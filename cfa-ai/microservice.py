"""
microservice.py — CFA Python AI Microservice
Flask server on port 8766.

Endpoints:
  POST /analyze   — Full telemetry analysis with Gemini + CSI + weights
  GET  /health    — Health check
  GET  /weights   — Current adaptive weights
"""

import os
from collections import deque
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from normalizer import normalize_snapshot
from math_engine import (
    compute_csi, compute_gcs, signal_variance, rolling_zscore,
    dct_high_freq_energy, bayesian_confidence, linear_regression_predict
)
from gemini_client import get_adaptive_weights
from weight_optimizer import apply_weights, current_weights, weight_history

load_dotenv()

app = Flask(__name__)
CORS(app) # Enable CORS for all routes
app.config["JSON_SORT_KEYS"] = False

# Rolling histories for each signal component (normalized [0,1])
HISTORY_LEN = 60
histories = {
    "wifi": deque(maxlen=HISTORY_LEN),
    "bt":   deque(maxlen=HISTORY_LEN),
    "net":  deque(maxlen=HISTORY_LEN),
    "sys":  deque(maxlen=HISTORY_LEN),
    "gcs":  deque(maxlen=HISTORY_LEN),
}
anomaly_log = deque(maxlen=50)
ai_call_counter = 0
AI_CALL_EVERY = 5  # Call Gemini every 5 analyze requests to throttle costs


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "cfa-ai", "version": "1.0"}), 200


@app.route("/weights", methods=["GET"])
def weights_endpoint():
    return jsonify({
        "current": current_weights(),
        "history": weight_history()[-5:],
    }), 200


@app.route("/analyze", methods=["POST"])
def analyze():
    global ai_call_counter
    data = request.get_json(force=True, silent=True) or {}

    # ── 1. Extract raw telemetry ──────────────────────────────────────────────
    telemetry = {
        "rssi":               float(data.get("rssi", data.get("wifi_rssi", -70.0))),
        "bandwidth_mbps":     float(data.get("bandwidth_mbps", 54.0)),
        "latency_ms":         float(data.get("latency_ms", 20.0)),
        "packet_loss_ratio":  float(data.get("packet_loss_ratio", 0.0)),
        "cpu_pct":            float(data.get("cpu_pct", 30.0)),
        "mem_pct":            float(data.get("mem_pct", 50.0)),
        "bt_rssi":            float(data.get("bt_rssi", -70.0)),
        "bt_count":           int(data.get("bt_count", 0)),
    }

    # ── 2. Normalize ──────────────────────────────────────────────────────────
    norm = normalize_snapshot(telemetry)

    # ── 3. Update histories ───────────────────────────────────────────────────
    wifi_sig = (norm["wifi_signal"] + norm["wifi_bandwidth"]) / 2.0
    bt_sig   = (norm["bt_signal"] + norm["bt_active"]) / 2.0
    net_sig  = (norm["latency_score"] + norm["net_quality"]) / 2.0
    sys_sig  = (norm["cpu_score"] + norm["mem_score"]) / 2.0

    histories["wifi"].append(wifi_sig)
    histories["bt"].append(bt_sig)
    histories["net"].append(net_sig)
    histories["sys"].append(sys_sig)

    # ── 4. Compute CSI scores ─────────────────────────────────────────────────
    weights = current_weights()
    csi_wifi = compute_csi(list(histories["wifi"]), telemetry["packet_loss_ratio"], telemetry["latency_ms"])
    csi_bt   = compute_csi(list(histories["bt"]))
    csi_net  = compute_csi(list(histories["net"]), telemetry["packet_loss_ratio"], telemetry["latency_ms"])
    csi_sys  = compute_csi(list(histories["sys"]))

    csi_scores = {
        "wifi": round(csi_wifi * 100, 2),
        "bt":   round(csi_bt   * 100, 2),
        "net":  round(csi_net  * 100, 2),
        "sys":  round(csi_sys  * 100, 2),
    }
    gcs = compute_gcs(csi_wifi, csi_bt, csi_net, csi_sys, weights)
    histories["gcs"].append(gcs)

    # ── 5. Anomaly detection ──────────────────────────────────────────────────
    gcs_hist = list(histories["gcs"])
    z = rolling_zscore(gcs_hist)
    dct_energy = dct_high_freq_energy(gcs_hist)
    bayes = bayesian_confidence(gcs_hist)

    anomalies = list(anomaly_log)
    if z > 2.5:
        event = {"type": "Z_SCORE", "component": "GCS", "z": round(z, 2), "value": round(gcs, 1)}
        anomaly_log.append(event)
        anomalies = list(anomaly_log)

    if dct_energy > 15.0:
        event = {"type": "OSCILLATION", "component": "Signal", "energy": round(dct_energy, 2)}
        anomaly_log.append(event)
        anomalies = list(anomaly_log)

    # ── 6. Prediction ─────────────────────────────────────────────────────────
    forecast = linear_regression_predict(gcs_hist)

    # ── 7. Gemini adaptive weights (throttled) ────────────────────────────────
    ai_call_counter += 1
    ai_result = {"weights": weights, "insight": "Collecting data...", "risk_factor": "None", "confidence": 0.5, "source": "cached"}

    if ai_call_counter % AI_CALL_EVERY == 1:
        ai_result = get_adaptive_weights(telemetry, csi_scores, anomalies, weights)
        new_weights = apply_weights(ai_result["weights"])
        ai_result["weights"] = new_weights

    # ── 8. Build response ─────────────────────────────────────────────────────
    return jsonify({
        "gcs":           gcs,
        "csi":           csi_scores,
        "weights":       current_weights(),
        "forecast":      forecast,
        "anomaly": {
            "z_score":      round(z, 3),
            "dct_energy":   round(dct_energy, 3),
            "bayesian":     round(bayes, 3),
        },
        "insight":       ai_result.get("insight", ""),
        "risk_factor":   ai_result.get("risk_factor", "None"),
        "ai_confidence": ai_result.get("confidence", 0.5),
        "ai_source":     ai_result.get("source", "offline"),
        "telemetry":     telemetry,
    }), 200


@app.route("/analyze/meeting", methods=["POST"])
def analyze_meeting():
    """
    High-resolution stability check for online meetings.
    Analyzes the last 10-20 samples for jitter, packet loss, and signal variance.
    """
    data = request.get_json(force=True, silent=True) or {}
    
    # Extract recent history for analysis
    wifi_hist = list(histories["wifi"])
    net_hist  = list(histories["net"])
    
    if len(wifi_hist) < 5:
        return jsonify({
            "ready": False,
            "score": 0,
            "verdict": "Insufficient data. Please wait for signal stabilization.",
            "details": "Collecting environmental telemetry..."
        }), 200

    # Calculate stability metrics
    stability = 1.0 - signal_variance(wifi_hist[-10:])
    jitter = signal_variance(net_hist[-10:])
    latency = float(data.get("latency_ms", 20.0))
    loss = float(data.get("packet_loss_ratio", 0.0))
    
    # Heuristic scoring
    score = (stability * 40) + (max(0, 1 - jitter) * 30) + (max(0, 1 - (latency/200)) * 20) + (max(0, 1 - loss) * 10)
    score = round(min(100, max(0, score)), 1)
    
    # AI-style verdict
    if score > 85:
        verdict = "OPTIMAL: Safe for 4K video and screen sharing."
        details = "Signal is extremely stable with negligible jitter."
    elif score > 65:
        verdict = "STABLE: Good for HD video calls."
        details = "Minor signal fluctuations detected, but within safe margins."
    elif score > 40:
        verdict = "CAUTION: Audio-only recommended."
        details = "High signal entropy detected. Video may stutter or disconnect."
    else:
        verdict = "UNSTABLE: Connection risk high."
        details = "Critical packet loss or latency jitter. Move closer to the router."

    return jsonify({
        "ready": True,
        "score": score,
        "verdict": verdict,
        "details": details,
        "metrics": {
            "stability": round(stability, 2),
            "jitter": round(jitter, 3),
            "latency": latency,
            "packet_loss": loss
        }
    }), 200


if __name__ == "__main__":
    port = int(os.getenv("CFA_AI_PORT", "8766"))
    print(f"[CFA-AI] Starting microservice on http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
