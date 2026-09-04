import unittest
import numpy as np
from app.schemas.request import FeaturesPayload, AnalysisRequest
from app.preprocessing.feature_builder import build_feature_vector, FEATURE_NAMES
from app.models.anomaly_model import AnomalyModelWrapper
from app.services.drift_service import DriftService
from app.services.sensor_health_service import SensorHealthService
from app.services.inference_service import InferenceService

class TestAiService(unittest.TestCase):

    def setUp(self):
        self.normal_features = FeaturesPayload(
            weightSlope=-1.8,
            standardDeviation=0.12,
            rollingVariance=0.014,
            signalNoise=0.07,
            baselineDeviation=0.05,
            stuckSignalDuration=0.0
        )

    def test_feature_vector_shape_and_order(self):
        vec = build_feature_vector(self.normal_features)
        self.assertEqual(vec.shape, (1, 6))
        self.assertAlmostEqual(vec[0][0], -1.8)
        self.assertAlmostEqual(vec[0][5], 0.0)

    def test_anomaly_score_normalization_range(self):
        model = AnomalyModelWrapper()
        vec = build_feature_vector(self.normal_features)
        score, supporting = model.predict_anomaly(vec)
        self.assertGreaterEqual(score, 0.0)
        self.assertLessEqual(score, 1.0)
        self.assertIsInstance(supporting, list)

    def test_drift_service_detection(self):
        drift_service = DriftService(deviation_tolerance=2.0)

        # Subtle deviation
        d_score_normal, status_normal = drift_service.evaluate_drift(self.normal_features, 0.1)
        self.assertEqual(status_normal, "NORMAL")

        # Significant deviation (3.0g deviation > 2.0g tolerance)
        drift_features = FeaturesPayload(
            weightSlope=0.2, # positive slope
            standardDeviation=0.15,
            rollingVariance=0.02,
            signalNoise=0.08,
            baselineDeviation=3.0,
            stuckSignalDuration=0.0
        )
        d_score_drift, status_drift = drift_service.evaluate_drift(drift_features, 0.7)
        self.assertGreaterEqual(d_score_drift, 0.5)
        self.assertEqual(status_drift, "POSSIBLE_DRIFT")

    def test_sensor_failure_on_stuck_signal(self):
        health_service = SensorHealthService()
        stuck_features = FeaturesPayload(
            weightSlope=0.0,
            standardDeviation=0.0,
            rollingVariance=0.0,
            signalNoise=0.0,
            baselineDeviation=0.0,
            stuckSignalDuration=150.0 # > 120s
        )
        status = health_service.evaluate_failure(stuck_features, 0.8)
        self.assertEqual(status, "POSSIBLE_SENSOR_FAILURE")

    def test_full_inference_pipeline(self):
        service = InferenceService()
        req = AnalysisRequest(bedId="BED_1", features=self.normal_features)
        resp = service.process(req)

        self.assertEqual(resp.modelVersion, "iforest-v1")
        self.assertGreaterEqual(resp.anomalyScore, 0.0)
        self.assertLessEqual(resp.anomalyScore, 1.0)
        self.assertIn(resp.driftStatus, ["NORMAL", "POSSIBLE_DRIFT"])
        self.assertIn(resp.failureStatus, ["NORMAL", "POSSIBLE_SENSOR_FAILURE"])
        self.assertGreaterEqual(resp.inferenceLatencyMs, 0)

if __name__ == "__main__":
    unittest.main()
