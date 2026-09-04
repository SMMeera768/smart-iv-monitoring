from pydantic import BaseModel, Field
from typing import Optional

class FeaturesPayload(BaseModel):
    weightSlope: float = Field(..., description="Weight slope in g/min")
    standardDeviation: float = Field(..., description="Rolling standard deviation of weight")
    rollingVariance: float = Field(..., description="Rolling variance of weight")
    signalNoise: float = Field(..., description="Noise level (diff between raw and filtered)")
    baselineDeviation: float = Field(..., description="Difference from adaptive baseline")
    stuckSignalDuration: float = Field(default=0.0, description="Duration in seconds signal has remained unchanged")

class AnalysisRequest(BaseModel):
    bedId: str = Field(..., description="Bed code, e.g. BED_1")
    timestamp: Optional[str] = Field(None, description="ISO timestamp")
    features: FeaturesPayload
