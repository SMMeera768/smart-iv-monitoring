import numpy as np
from app.config.settings import settings
from app.schemas.request import FeaturesPayload

class DriftService:
    """
    Evaluates sensor baseline drift without confusing real IV infusion decreases or bag replacements.
    Uses frozen weights:
        - normalized baseline deviation: 0.50
        - AI anomaly support: 0.30
        - slope residual inconsistency: 0.20
    """
    def __init__(self, deviation_tolerance: float = 2.0):
        self.deviation_tolerance = deviation_tolerance

    def evaluate_drift(self, features: FeaturesPayload, anomaly_score: float) -> tuple[float, str]:
        """
        Returns:
            drift_score: float in [0.0, 1.0]
            drift_status: 'NORMAL' or 'POSSIBLE_DRIFT'
        """
        # 1. Normalized baseline deviation (clipped at 1.0)
        norm_dev = min(1.0, abs(features.baselineDeviation) / self.deviation_tolerance)

        # 2. Anomaly score contribution
        norm_anomaly = anomaly_score

        # 3. Slope inconsistency: in normal infusion, slope is negative. If slope is slightly positive or anomalous
        slope_factor = 0.0
        if features.weightSlope > 0.1:
            slope_factor = min(1.0, features.weightSlope / 1.0)

        # Weighted combination
        drift_score = (0.50 * norm_dev) + (0.30 * norm_anomaly) + (0.20 * slope_factor)
        drift_score = float(np.clip(drift_score, 0.0, 1.0))

        drift_status = "POSSIBLE_DRIFT" if drift_score >= settings.DRIFT_THRESHOLD else "NORMAL"
        return drift_score, drift_status
