import time
from fastapi import APIRouter
from app.schemas.request import AnalysisRequest
from app.schemas.response import AnalysisResponse, HealthResponse
from app.services.inference_service import InferenceService
from app.config.settings import settings

router = APIRouter(prefix="/ai/v1", tags=["AI Sensor Health"])
inference_service = InferenceService()
_start_time = time.time()

@router.post("/analyze", response_model=AnalysisResponse)
def analyze(request: AnalysisRequest):
    """
    Evaluates sensor health features (drift, anomaly, stuck readings).
    Does NOT diagnose medical conditions or classify infusion events.
    """
    return inference_service.process(request)

@router.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(
        status="ONLINE",
        modelVersion=settings.MODEL_VERSION,
        uptimeSeconds=round(time.time() - _start_time, 2)
    )
