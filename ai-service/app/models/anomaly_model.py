import numpy as np
from typing import Tuple, List
from app.preprocessing.feature_builder import FEATURE_NAMES

class AnomalyModelWrapper:
    """
    Wraps IsolationForest or internal analytical estimator.
    Converts raw decision function score into a normalized anomaly index [0, 1].
    Documented formula:
        anomalyScore = 1.0 / (1.0 + exp(10.0 * raw_score))
    """
    def __init__(self, model=None, scaler=None):
        self.model = model
        self.scaler = scaler

    def predict_anomaly(self, X: np.ndarray) -> Tuple[float, List[str]]:
        """
        Takes raw feature vector (1x6).
        Returns:
            anomaly_score: float in [0, 1]
            supporting_features: list of feature names with highest deviation
        """
        if self.scaler is not None:
            try:
                X_scaled = self.scaler.transform(X)
            except Exception:
                X_scaled = X
        else:
            X_scaled = X

        if self.model is not None:
            try:
                # raw decision function: positive = inlier, negative = outlier
                raw_score = float(self.model.decision_function(X_scaled)[0])
            except Exception:
                raw_score = self._fallback_score(X_scaled)
        else:
            raw_score = self._fallback_score(X_scaled)

        # Deterministic Sigmoidal Normalization to [0.0, 1.0]
        # raw_score > 0 => anomaly_score < 0.5 (normal)
        # raw_score < 0 => anomaly_score > 0.5 (anomalous)
        anomaly_score = 1.0 / (1.0 + float(np.exp(np.clip(10.0 * raw_score, -20.0, 20.0))))
        anomaly_score = float(np.clip(anomaly_score, 0.0, 1.0))

        # Identify top contributing features based on magnitude of standardized deviation
        deviations = np.abs(X_scaled[0])
        top_indices = np.argsort(deviations)[::-1][:2]
        supporting = [FEATURE_NAMES[i] for i in top_indices if deviations[i] > 1.2]

        return anomaly_score, supporting

    def _fallback_score(self, X_scaled: np.ndarray) -> float:
        """
        Lightweight analytical distance when trained model file is not present.
        """
        # Mahalanobis / Euclidean distance proxy on standardized features
        dist = float(np.sqrt(np.sum(np.square(X_scaled[0]))))
        # Map distance to pseudo raw score (baseline dist ~ 2.0)
        return float(0.20 - (dist / 10.0))
