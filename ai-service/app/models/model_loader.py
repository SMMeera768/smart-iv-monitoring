import os
import json
from typing import Optional, Dict, Any
from app.config.settings import settings
from app.models.anomaly_model import AnomalyModelWrapper
from app.preprocessing.scaler import FallbackScaler
from app.utils.logging_utils import setup_logger

logger = setup_logger("model_loader")

_loaded_model: Optional[AnomalyModelWrapper] = None
_model_metadata: Dict[str, Any] = {
    "modelVersion": settings.MODEL_VERSION,
    "status": "INITIALIZED"
}

def load_models() -> AnomalyModelWrapper:
    global _loaded_model, _model_metadata

    model = None
    scaler = None

    # Attempt to load scikit-learn model and scaler via joblib
    try:
        import joblib
        if os.path.exists(settings.MODEL_PATH):
            model = joblib.load(settings.MODEL_PATH)
            logger.info(f"Loaded Isolation Forest model from {settings.MODEL_PATH}")

        if os.path.exists(settings.SCALER_PATH):
            scaler = joblib.load(settings.SCALER_PATH)
            logger.info(f"Loaded Scaler from {settings.SCALER_PATH}")
    except Exception as e:
        logger.warning(f"Could not load serialized joblib models: {e}. Using pre-calibrated analytical wrapper.")

    if scaler is None:
        scaler = FallbackScaler()

    if os.path.exists(settings.METADATA_PATH):
        try:
            with open(settings.METADATA_PATH, "r") as f:
                _model_metadata = json.load(f)
        except Exception as e:
            logger.warning(f"Could not read metadata: {e}")

    _loaded_model = AnomalyModelWrapper(model=model, scaler=scaler)
    return _loaded_model

def get_model() -> AnomalyModelWrapper:
    global _loaded_model
    if _loaded_model is None:
        _loaded_model = load_models()
    return _loaded_model

def get_metadata() -> Dict[str, Any]:
    return _model_metadata
