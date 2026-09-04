from pydantic import BaseModel
import os

class Settings(BaseModel):
    HOST: str = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("AI_SERVICE_PORT", "8000"))
    MODEL_VERSION: str = "iforest-v1"
    ANOMALY_THRESHOLD: float = 0.60
    DRIFT_THRESHOLD: float = 0.50
    STUCK_SIGNAL_THRESHOLD_SEC: float = 120.0
    MODEL_PATH: str = os.getenv(
        "MODEL_PATH",
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "isolation_forest.joblib")
    )
    SCALER_PATH: str = os.getenv(
        "SCALER_PATH",
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "scaler.joblib")
    )
    METADATA_PATH: str = os.getenv(
        "METADATA_PATH",
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "metadata.json")
    )

settings = Settings()
