"""
math_engine.py — Core mathematical computations for the CSI formula.

  CSI = (SignalStrength × StabilityFactor × TimeConsistency) / (Noise + Entropy + Variance + ε)
  GCS = Σ (Wi × CSIi)

Also includes:
  - Shannon entropy
  - Rolling Z-score
  - Fourier (DCT) high-frequency energy
  - Bayesian confidence (Beta distribution)
"""

import numpy as np
from typing import List


# ── Core CSI formula ──────────────────────────────────────────────────────────

def compute_csi(
    signal_history: List[float],
    noise: float = 0.0,
    latency_ms: float = 20.0,
    window: int = 10
) -> float:
    """
    Compute the Cognitive Stability Index for a signal history array.

    Args:
        signal_history: List of normalized [0,1] signal samples (oldest → newest)
        noise:          Packet loss ratio [0,1]
        latency_ms:     Measured latency in milliseconds
        window:         Moving average window size

    Returns:
        CSI value in [0, 1]
    """
    if not signal_history:
        return 0.0

    arr = np.array(signal_history, dtype=float)

    mean_signal   = float(np.mean(arr))
    std_signal    = float(np.std(arr)) + 1e-9
    ma            = float(np.mean(arr[-window:])) if len(arr) >= window else mean_signal

    signal_strength   = mean_signal
    stability_factor  = 1.0 / std_signal
    time_consistency  = ma

    entropy   = shannon_entropy(arr)
    variance  = float(np.var(arr))
    noise_val = min(1.0, noise + latency_ms / 500.0)

    numerator   = signal_strength * stability_factor * time_consistency
    denominator = noise_val + entropy + variance + 1e-6

    raw = numerator / denominator
    return float(raw / (raw + 1.0))  # sigmoid normalization to [0,1]


def compute_gcs(
    csi_wifi: float,
    csi_bt: float,
    csi_net: float,
    csi_sys: float,
    weights: dict
) -> float:
    """Weighted sum of CSI components → GCS in [0, 100]."""
    w = weights
    raw = (w.get("wifi", 0.30) * csi_wifi +
           w.get("bt",   0.15) * csi_bt   +
           w.get("net",  0.35) * csi_net  +
           w.get("sys",  0.20) * csi_sys)
    return round(min(100.0, raw * 100.0), 2)


# ── Information theory ────────────────────────────────────────────────────────

def shannon_entropy(arr: np.ndarray, bins: int = 10) -> float:
    """
    Shannon entropy over a continuous signal discretized into `bins` buckets.
    Returns normalized entropy in [0, 1].
    """
    arr = np.clip(arr, 0.0, 1.0)
    counts, _ = np.histogram(arr, bins=bins, range=(0.0, 1.0))
    probs = counts / (len(arr) + 1e-9)
    probs = probs[probs > 0]
    h = -float(np.sum(probs * np.log2(probs + 1e-12)))
    max_h = np.log2(bins)
    return h / max_h if max_h > 0 else 0.0


def signal_variance(arr: List[float]) -> float:
    return float(np.var(arr)) if arr else 0.0


def moving_average(arr: List[float], n: int = 10) -> float:
    if not arr:
        return 0.0
    window = arr[-n:] if len(arr) >= n else arr
    return float(np.mean(window))


# ── Anomaly detection ─────────────────────────────────────────────────────────

def rolling_zscore(arr: List[float]) -> float:
    """
    Compute Z-score of the most recent value in the history window.
    Returns |z| score.
    """
    if len(arr) < 3:
        return 0.0
    a = np.array(arr, dtype=float)
    mu, sigma = np.mean(a[:-1]), np.std(a[:-1]) + 1e-9
    return abs(float((a[-1] - mu) / sigma))


def dct_high_freq_energy(arr: List[float], high_bin_start: int = 8) -> float:
    """
    Simplified Discrete Cosine Transform for oscillation detection.
    Returns normalized high-frequency energy.
    """
    n = 16
    if len(arr) < n:
        return 0.0
    segment = np.array(arr[-n:], dtype=float)
    energy = 0.0
    for k in range(high_bin_start, n):
        c = sum(segment[i] * np.cos(np.pi * k * (2 * i + 1) / (2 * n))
                for i in range(n))
        energy += c * c
    return float(np.sqrt(energy) / n)


# ── Probability & Bayesian ────────────────────────────────────────────────────

def bayesian_confidence(samples: List[float], threshold: float = 60.0) -> float:
    """
    Beta(α, β) distribution mean as stability confidence.
    α = count above threshold, β = count below.
    """
    successes = sum(1 for v in samples if v >= threshold)
    failures  = len(samples) - successes
    # Bayesian mean with uniform prior: (α+1)/(α+β+2)
    return (successes + 1.0) / (successes + failures + 2.0)


# ── Prediction ────────────────────────────────────────────────────────────────

def linear_regression_predict(history: List[float]) -> dict:
    """
    OLS linear regression on history to predict next value.
    Returns dict with: next_csi, slope, intercept, trend
    """
    n = len(history)
    if n < 3:
        return {"next_csi": history[-1] if history else 50.0, "slope": 0.0,
                "intercept": 0.0, "trend": "STABLE"}

    x = np.arange(n, dtype=float)
    y = np.array(history, dtype=float)
    slope, intercept = np.polyfit(x, y, 1)
    next_val = float(np.clip(intercept + slope * n, 0.0, 100.0))

    if abs(slope) < 0.3:
        trend = "STABLE"
    elif slope > 0:
        trend = "IMPROVING"
    else:
        trend = "DEGRADING"

    return {"next_csi": round(next_val, 2), "slope": round(float(slope), 4),
            "intercept": round(float(intercept), 4), "trend": trend}
