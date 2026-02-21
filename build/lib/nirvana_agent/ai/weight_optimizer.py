"""
weight_optimizer.py — Adaptive weight learning with exponential smoothing.
Maintains a rolling history of Gemini-returned weights and applies
exponential moving average for stability.
"""

from collections import deque
from typing import List

# Smoothing factor — higher = more responsive to new AI weights
ALPHA = 0.3

# Default weights (sum = 1.0)
DEFAULT_WEIGHTS = {"wifi": 0.30, "bt": 0.15, "net": 0.35, "sys": 0.20}

# Keys expected
KEYS = ["wifi", "bt", "net", "sys"]


class WeightOptimizer:
    def __init__(self, history_len: int = 20):
        self._current = dict(DEFAULT_WEIGHTS)
        self._history: deque = deque(maxlen=history_len)

    def update(self, new_weights: dict) -> dict:
        """
        Apply exponential smoothing: w_new = α·w_gemini + (1-α)·w_current
        Normalizes to ensure sum = 1.0.
        Returns the smoothed weight dict.
        """
        if not self._is_valid(new_weights):
            return dict(self._current)

        smoothed = {}
        for k in KEYS:
            smoothed[k] = ALPHA * new_weights.get(k, DEFAULT_WEIGHTS[k]) + \
                          (1.0 - ALPHA) * self._current.get(k, DEFAULT_WEIGHTS[k])

        # Normalize
        total = sum(smoothed.values())
        if total > 0:
            smoothed = {k: round(v / total, 4) for k, v in smoothed.items()}

        self._current = smoothed
        self._history.append(smoothed)
        return dict(self._current)

    def get_current(self) -> dict:
        return dict(self._current)

    def get_history(self) -> List[dict]:
        return list(self._history)

    def reset(self):
        self._current = dict(DEFAULT_WEIGHTS)
        self._history.clear()

    def _is_valid(self, w: dict) -> bool:
        """Check that all expected keys are present and values are finite positive numbers."""
        if not all(k in w for k in KEYS):
            return False
        if not all(isinstance(w[k], (int, float)) and w[k] >= 0 for k in KEYS):
            return False
        return sum(w[k] for k in KEYS) > 0


# Module-level singleton
_optimizer = WeightOptimizer()


def apply_weights(new_weights: dict) -> dict:
    return _optimizer.update(new_weights)


def current_weights() -> dict:
    return _optimizer.get_current()


def weight_history() -> List[dict]:
    return _optimizer.get_history()
