import time
from app.schemas.request import AnalysisRequest
from app.schemas.response import AnalysisResponse
from app.preprocessing.feature_builder import build_feature_vector
from app.models.model_loader import get_model, get_metadata
from app.services.drift_service import DriftService
from app.services.sensor_health_service import SensorHealthService
from app.config.settings import settings

class InferenceService:
    def __init__(self):
        self.drift_service = DriftService()
        self.health_service = SensorHealthService()

    def process(self, request: AnalysisRequest) -> AnalysisResponse:
        start_time = time.perf_counter()

        # 1. Build canonical feature vector
        vector = build_feature_vector(request.features)

        # 2. Predict anomaly index
        model = get_model()
        anomaly_score, supporting_features = model.predict_anomaly(vector)

        # 3. Evaluate drift status
        drift_score, drift_status = self.drift_service.evaluate_drift(request.features, anomaly_score)

        # 4. Evaluate sensor failure status
        failure_status = self.health_service.evaluate_failure(request.features, anomaly_score)

        # If failure detected, include supporting feature note
        if failure_status != "NORMAL" and "stuckSignalDuration" not in supporting_features:
            if request.features.stuckSignalDuration >= settings.STUCK_SIGNAL_THRESHOLD_SEC:
                supporting_features.append("stuckSignalDuration")
            elif request.features.signalNoise > 15.0:
                supporting_features.append("signalNoise")

        latency_ms = int((time.perf_counter() - start_time) * 1000)

        metadata = get_metadata()
        model_version = metadata.get("modelVersion", settings.MODEL_VERSION)

        return AnalysisResponse(
            modelVersion=model_version,
            anomalyScore=round(anomaly_score, 4),
            driftScore=round(drift_score, 4),
            driftStatus=drift_status,
            failureStatus=failure_status,
            supportingFeatures=supporting_features,
            inferenceLatencyMs=max(1, latency_ms)
        )
