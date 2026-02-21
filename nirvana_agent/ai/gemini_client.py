"""
gemini_client.py — Gemini API integration for adaptive weight optimization.

Sends structured telemetry + CSI data to Gemini and parses the
optimized weight JSON response.
"""

import os
import json
import re
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

_api_key = os.getenv("GEMINI_API_KEY", "")
_model = None


def _get_model():
    global _model
    if _model is None and _api_key:
        genai.configure(api_key=_api_key)
        _model = genai.GenerativeModel("gemini-1.5-flash")
    return _model


SYSTEM_PROMPT = """You are a systems engineer and mathematical physicist specializing in 
signal processing and environmental intelligence modeling. You will analyze telemetry data 
from a Cognitive Field Analyzer and optimize the weighted scoring for real-time environmental 
fluctuation detection. Always respond with valid JSON only, no markdown, no explanation."""


def build_analysis_prompt(telemetry: dict, csi_scores: dict, anomalies: list) -> str:
    anomaly_summary = ", ".join([f"{a['type']}({a['component']})" for a in anomalies[-5:]]) or "None"

    return f"""Analyze the following signal stability patterns from a Cognitive Field Analyzer. 
Detect anomalies, optimize weighted scoring for real-time environmental fluctuation detection. 
Act as a systems engineer and mathematical physicist.

TELEMETRY:
- WiFi RSSI: {telemetry.get('rssi', -70):.1f} dBm
- Latency: {telemetry.get('latency_ms', 20):.1f} ms
- Packet Loss: {telemetry.get('packet_loss_ratio', 0):.3f}
- CPU: {telemetry.get('cpu_pct', 30):.1f}%
- Memory: {telemetry.get('mem_pct', 50):.1f}%
- Bluetooth Devices: {telemetry.get('bt_count', 0)}

CSI SCORES (0-100 scale):
- WiFi CSI: {csi_scores.get('wifi', 50):.1f}
- Bluetooth CSI: {csi_scores.get('bt', 50):.1f}
- Network CSI: {csi_scores.get('net', 50):.1f}
- System CSI: {csi_scores.get('sys', 50):.1f}
- Global Score (GCS): {csi_scores.get('gcs', 50):.1f}

RECENT ANOMALIES: {anomaly_summary}

Based on this data:
1. Determine optimized component weights (must sum to exactly 1.0)
2. Provide a brief scientific insight about the current system state
3. Identify the dominant stability risk factor

Respond ONLY with JSON in this exact format:
{{
  "weights": {{"wifi": 0.30, "bt": 0.15, "net": 0.35, "sys": 0.20}},
  "insight": "Brief scientific analysis in 1-2 sentences",
  "risk_factor": "WiFi|Bluetooth|Network|System|None",
  "confidence": 0.85
}}"""


def get_adaptive_weights(telemetry: dict, csi_scores: dict,
                          anomalies: list, fallback_weights: dict) -> dict:
    """
    Query Gemini for adaptive weight optimization.
    Returns dict with: weights, insight, risk_factor, confidence
    Falls back to current weights if API unavailable.
    """
    model = _get_model()
    if model is None:
        return {
            "weights": fallback_weights,
            "insight": "AI layer offline — operating with static weights. Configure GEMINI_API_KEY to enable adaptive scoring.",
            "risk_factor": "None",
            "confidence": 0.5,
            "source": "offline"
        }

    prompt = build_analysis_prompt(telemetry, csi_scores, anomalies)

    try:
        response = model.generate_content(
            [{"role": "user", "parts": [SYSTEM_PROMPT + "\n\n" + prompt]}],
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=256
            )
        )
        text = response.text.strip()

        # Strip markdown code fences if present
        text = re.sub(r"```(?:json)?", "", text).strip().rstrip("`").strip()
        result = json.loads(text)

        # Validate and normalize weights
        weights = result.get("weights", fallback_weights)
        total = sum(weights.values())
        if total > 0:
            weights = {k: round(v / total, 4) for k, v in weights.items()}
        result["weights"] = weights
        result["source"] = "gemini"
        return result

    except Exception as e:
        print(f"[Gemini] API error: {e}")
        return {
            "weights": fallback_weights,
            "insight": f"Gemini API error — falling back to current weights. ({type(e).__name__})",
            "risk_factor": "None",
            "confidence": 0.5,
            "source": "fallback"
        }
