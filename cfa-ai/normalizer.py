"""
normalizer.py — Signal normalization for CFA telemetry values.
Converts raw OS measurements to [0, 1] range for CSI computation.
"""

import numpy as np


# ── Signal range constants ────────────────────────────────────────────────────
RSSI_MIN, RSSI_MAX           = -100.0, -30.0    # dBm
BANDWIDTH_MIN, BANDWIDTH_MAX = 0.0, 600.0       # Mbps
LATENCY_MIN, LATENCY_MAX     = 1.0, 500.0       # ms
CPU_MIN, CPU_MAX             = 0.0, 100.0       # %
MEM_MIN, MEM_MAX             = 0.0, 100.0       # %
BT_RSSI_MIN, BT_RSSI_MAX    = -100.0, -30.0    # dBm


def _clamp(val: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, float(val)))


def normalize(val: float, lo: float, hi: float) -> float:
    """Min-max normalize val to [0, 1] within [lo, hi]."""
    if hi == lo:
        return 0.5
    return _clamp((val - lo) / (hi - lo), 0.0, 1.0)


def normalize_rssi(rssi: float) -> float:
    """WiFi RSSI (dBm) → [0,1]. Higher = better."""
    return normalize(rssi, RSSI_MIN, RSSI_MAX)


def normalize_bandwidth(mbps: float) -> float:
    return normalize(mbps, BANDWIDTH_MIN, BANDWIDTH_MAX)


def normalize_latency_inv(ms: float) -> float:
    """Latency → [0,1] inverted. Lower latency = higher score."""
    return 1.0 - normalize(ms, LATENCY_MIN, LATENCY_MAX)


def normalize_cpu_inv(pct: float) -> float:
    """CPU usage → [0,1] inverted. Lower usage = higher score."""
    return 1.0 - normalize(pct, CPU_MIN, CPU_MAX)


def normalize_memory_inv(pct: float) -> float:
    return 1.0 - normalize(pct, MEM_MIN, MEM_MAX)


def normalize_packet_loss_inv(ratio: float) -> float:
    """Packet loss [0,1] → inverted quality score."""
    return 1.0 - _clamp(ratio, 0.0, 1.0)


def normalize_bt_rssi(rssi: float) -> float:
    return normalize(rssi, BT_RSSI_MIN, BT_RSSI_MAX)


def normalize_snapshot(snap: dict) -> dict:
    """
    Takes a raw telemetry dict from Java agent and returns normalized [0,1] signals.
    Expected keys: rssi, bandwidth_mbps, latency_ms, packet_loss_ratio,
                   cpu_pct, mem_pct, bt_rssi, bt_count
    """
    return {
        "wifi_signal":   normalize_rssi(snap.get("rssi", -70.0)),
        "wifi_bandwidth": normalize_bandwidth(snap.get("bandwidth_mbps", 54.0)),
        "latency_score": normalize_latency_inv(snap.get("latency_ms", 20.0)),
        "net_quality":   normalize_packet_loss_inv(snap.get("packet_loss_ratio", 0.0)),
        "cpu_score":     normalize_cpu_inv(snap.get("cpu_pct", 30.0)),
        "mem_score":     normalize_memory_inv(snap.get("mem_pct", 50.0)),
        "bt_signal":     normalize_bt_rssi(snap.get("bt_rssi", -70.0)),
        "bt_active":     min(1.0, snap.get("bt_count", 0) / 5.0),
    }
