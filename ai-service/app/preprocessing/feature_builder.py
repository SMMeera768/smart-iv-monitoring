import numpy as np
from typing import List, Dict, Any
from app.schemas.request import FeaturesPayload

FEATURE_NAMES = [
    "weightSlope",
    "standardDeviation",
    "rollingVariance",
    "signalNoise",
    "baselineDeviation",
    "stuckSignalDuration"
]

def build_feature_vector(payload: FeaturesPayload) -> np.ndarray:
    """
    Transforms the FeaturesPayload into a 1x6 numpy array in strict canonical feature order.
    """
    values = [
        float(payload.weightSlope),
        float(payload.standardDeviation),
        float(payload.rollingVariance),
        float(payload.signalNoise),
        float(payload.baselineDeviation),
        float(payload.stuckSignalDuration)
    ]
    return np.array([values], dtype=np.float64)

def feature_dict_from_vector(vector: np.ndarray) -> Dict[str, float]:
    """
    Reconstructs dictionary from feature vector.
    """
    return {name: float(vector[0][i]) for i, name in enumerate(FEATURE_NAMES)}
