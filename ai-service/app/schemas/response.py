from pydantic import BaseModel
from typing import List

class AnalysisResponse(BaseModel):
    modelVersion: str
    anomalyScore: float  # Normalized anomaly index in [0, 1] — NOT a probability
    driftScore: float    # Drift index in [0, 1]
    driftStatus: str     # "NORMAL" or "POSSIBLE_DRIFT"
    failureStatus: str   # "NORMAL" or "POSSIBLE_SENSOR_FAILURE"
    supportingFeatures: List[str]
    inferenceLatencyMs: int

class HealthResponse(BaseModel):
    status: str
    modelVersion: str
    uptimeSeconds: float
