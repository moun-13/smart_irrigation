"""FastAPI service: predict water stress from environment + crop type."""
from pathlib import Path

import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = ROOT / "model.pkl"

app = FastAPI(
    title="Smart Irrigation API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_artifact = None


def load_artifact():
    global _artifact
    if _artifact is None:
        if not MODEL_PATH.is_file():
            raise RuntimeError(
                f"Model not found at {MODEL_PATH}. Run: python models/compare_models.py"
            )
        _artifact = joblib.load(MODEL_PATH)
    return _artifact


class PredictIn(BaseModel):
    temperature: float = Field(..., description="°C")
    rainfall: float = Field(..., description="mm")
    soil_moisture: float = Field(..., description="%")
    crop_type: str = Field(..., description="Crop name")


class PredictOut(BaseModel):
    water_stress: float
    level: str


def stress_level(score: float) -> str:
    if score >= 70:
        return "high"
    if score >= 40:
        return "medium"
    return "low"


@app.get("/")
def root():
    """Évite le 404 sur la racine ; la doc interactive est sur /docs."""
    return {
        "name": "Smart Irrigation API",
        "server": "fastapi",
        "docs": "/docs",
        "openapi_json": "/openapi.json",
        "health": "GET /health",
        "predict": "POST /predict (JSON: temperature, rainfall, soil_moisture, crop_type)",
    }


@app.get("/whoami")
def whoami():
    """Pour vérifier que tu parles bien à ce backend (pas à Vite / Laravel / autre)."""
    return {
        "server": "smart-irrigation-fastapi",
        "docs": "/docs",
        "swagger_alt": "/swagger",
    }


@app.get("/swagger", include_in_schema=False)
async def swagger_ui_alt():
    """Même chose que /docs (interface Swagger), autre URL si /docs pose problème."""
    return get_swagger_ui_html(openapi_url="/openapi.json", title=f"{app.title} — Swagger")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/predict")
def predict_help():
    """Le navigateur fait un GET : sans cette route, /predict peut sembler « introuvable »."""
    return {
        "message": "Ouvre /docs et utilise POST /predict, ou envoie une requête POST (pas GET) avec un corps JSON.",
        "swagger_ui": "/docs",
        "method": "POST",
        "content_type": "application/json",
        "example_body": {
            "temperature": 28,
            "rainfall": 5,
            "soil_moisture": 35,
            "crop_type": "Wheat",
        },
    }


@app.post("/predict", response_model=PredictOut)
def predict(body: PredictIn):
    art = load_artifact()
    model = art["model"]
    enc = art["crop_encoder"]
    crop = body.crop_type.strip()
    if crop not in list(enc.classes_):
        raise HTTPException(
            400,
            detail=f"Unknown crop_type. Use one of: {list(enc.classes_)}",
        )
    crop_i = enc.transform([crop])[0]
    X = np.array(
        [[body.temperature, body.rainfall, body.soil_moisture, crop_i]],
        dtype=float,
    )
    raw = float(model.predict(X)[0])
    water_stress = max(0.0, min(100.0, raw))
    return PredictOut(water_stress=water_stress, level=stress_level(water_stress))
