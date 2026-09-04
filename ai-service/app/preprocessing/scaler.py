import numpy as np
from typing import Optional

class FallbackScaler:
    """
    Standard robust min-max / z-score scaler for fallback when joblib scaler is not loaded.
    Pre-calibrated on normal sensor baseline operations.
    """
    def __init__(self):
        # Means and stds for [weightSlope, standardDeviation, rollingVariance, signalNoise, baselineDeviation, stuckSignalDuration]
        self.means = np.array([-1.5, 0.15, 0.02, 0.08, 0.10, 0.0], dtype=np.float64)
        self.scales = np.array([1.0, 0.20, 0.05, 0.10, 0.30, 30.0], dtype=np.float64)

    def transform(self, X: np.ndarray) -> np.ndarray:
        return (X - self.means) / np.where(self.scales == 0, 1.0, self.scales)

    def fit(self, X: np.ndarray):
        self.means = np.mean(X, axis=0)
        self.scales = np.std(X, axis=0)
        self.scales[self.scales == 0] = 1.0
        return self
