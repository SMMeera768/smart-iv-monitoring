from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.models.model_loader import load_models
from app.config.settings import settings
from app.utils.logging_utils import setup_logger

logger = setup_logger("main")

app = FastAPI(
    title="Smart IV Sensor Health AI Service",
    description="Lightweight Isolation Forest & Drift Detection Microservice for Smart Multi-Bed IV Platform",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.on_event("startup")
def startup_event():
    logger.info("Initializing AI model and scalers...")
    load_models()
    logger.info(f"AI Service ready on {settings.HOST}:{settings.PORT}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
