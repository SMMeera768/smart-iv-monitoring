from app.config.settings import settings
from app.schemas.request import FeaturesPayload

class SensorHealthService:
    """
    Evaluates sensor integrity and deterministic physical limits.
    Combines AI anomaly scores with physical bounds to determine failure status.
    """
    def evaluate_failure(self, features: FeaturesPayload, anomaly_score: float) -> str:
        # 1. Stuck signal exceeding threshold (e.g. 120s with zero variance or identical reading)
        if features.stuckSignalDuration >= settings.STUCK_SIGNAL_THRESHOLD_SEC and features.rollingVariance < 0.00001:
            return "POSSIBLE_SENSOR_FAILURE"

        # 2. Extreme signal instability/noise
        if features.signalNoise > 15.0 or features.standardDeviation > 25.0:
            return "POSSIBLE_SENSOR_FAILURE"

        # 3. Sustained extreme anomaly
        if anomaly_score > 0.95:
            return "POSSIBLE_SENSOR_FAILURE"

        return "NORMAL"
