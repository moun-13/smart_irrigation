"""FastAPI service: predict water stress with user auth/history."""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import secrets
import sqlite3

import joblib
import numpy as np
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = ROOT / "model.pkl"
DB_PATH = ROOT / "irrigation.db"

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


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            farm_location TEXT,
            created_at TEXT NOT NULL
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            temperature REAL NOT NULL,
            rainfall REAL NOT NULL,
            soil_moisture REAL NOT NULL,
            crop_type TEXT NOT NULL,
            water_stress REAL NOT NULL,
            stress_level TEXT NOT NULL,
            recommended_water_l_m2 REAL NOT NULL,
            irrigation_frequency_days INTEGER NOT NULL,
            explanation TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """
    )
    conn.commit()
    conn.close()


def hash_password(password: str) -> str:
    # PBKDF2 with random salt stored as salt$hash
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 120_000
    ).hex()
    return f"{salt}${dk}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt, expected = stored.split("$", 1)
    except ValueError:
        return False
    candidate = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), 120_000
    ).hex()
    return secrets.compare_digest(candidate, expected)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_current_user(authorization: str | None) -> sqlite3.Row:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, detail="Missing or invalid authorization token.")
    token = authorization.split(" ", 1)[1].strip()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT users.id, users.name, users.email, users.farm_location
        FROM sessions
        JOIN users ON users.id = sessions.user_id
        WHERE sessions.token = ?
        """,
        (token,),
    )
    user = cur.fetchone()
    conn.close()
    if user is None:
        raise HTTPException(401, detail="Session not found or expired.")
    return user


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
    water_stress: float = Field(..., ge=0, le=100)
    level: str
    recommended_water_l_m2: float
    irrigation_frequency_days: int
    explanation: str
    timestamp: str


class SignUpIn(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=200)
    password: str = Field(..., min_length=6, max_length=200)
    farm_location: str | None = Field(default=None, max_length=200)


class LoginIn(BaseModel):
    email: str = Field(..., min_length=5, max_length=200)
    password: str = Field(..., min_length=6, max_length=200)


class AuthOut(BaseModel):
    token: str
    user: dict


class HistoryItem(BaseModel):
    id: int
    temperature: float
    rainfall: float
    soil_moisture: float
    crop_type: str
    water_stress: float
    stress_level: str
    recommended_water_l_m2: float
    irrigation_frequency_days: int
    explanation: str
    created_at: str


def stress_level(score: float) -> str:
    if score >= 70:
        return "high"
    if score >= 40:
        return "medium"
    return "low"


def recommendation_from_inputs(
    score: float, temperature: float, rainfall: float, soil_moisture: float
) -> tuple[float, int, str]:
    # Simple recommendation rules that can be improved over time.
    recommended_water_l_m2 = round(max(5.0, min(35.0, 6 + (score * 0.25))), 1)
    if score >= 70:
        frequency_days = 1
        level_reason = "severe stress"
    elif score >= 40:
        frequency_days = 2
        level_reason = "moderate stress"
    else:
        frequency_days = 4
        level_reason = "low stress"

    moisture_state = "low" if soil_moisture < 40 else "adequate"
    rain_state = "low rainfall" if rainfall < 10 else "sufficient rainfall"
    temp_state = "high temperature" if temperature >= 30 else "moderate temperature"

    explanation = (
        f"Your crop is under {level_reason} due to {temp_state}, "
        f"{moisture_state} soil moisture, and {rain_state}."
    )
    return recommended_water_l_m2, frequency_days, explanation


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


@app.post("/auth/signup", response_model=AuthOut)
def signup(body: SignUpIn):
    email = body.email.strip().lower()
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            """
            INSERT INTO users(name, email, password_hash, farm_location, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                body.name.strip(),
                email,
                hash_password(body.password),
                body.farm_location.strip() if body.farm_location else None,
                now_iso(),
            ),
        )
        user_id = cur.lastrowid
        token = secrets.token_urlsafe(48)
        cur.execute(
            "INSERT INTO sessions(token, user_id, created_at) VALUES (?, ?, ?)",
            (token, user_id, now_iso()),
        )
        conn.commit()
        user = {
            "id": user_id,
            "name": body.name.strip(),
            "email": email,
            "farm_location": body.farm_location.strip() if body.farm_location else None,
        }
        return {"token": token, "user": user}
    except sqlite3.IntegrityError:
        raise HTTPException(409, detail="Email already registered.")
    finally:
        conn.close()


@app.post("/auth/login", response_model=AuthOut)
def login(body: LoginIn):
    email = body.email.strip().lower()
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, email, farm_location, password_hash FROM users WHERE email = ?",
        (email,),
    )
    row = cur.fetchone()
    if row is None or not verify_password(body.password, row["password_hash"]):
        conn.close()
        raise HTTPException(401, detail="Invalid email or password.")

    token = secrets.token_urlsafe(48)
    cur.execute(
        "INSERT INTO sessions(token, user_id, created_at) VALUES (?, ?, ?)",
        (token, row["id"], now_iso()),
    )
    conn.commit()
    conn.close()
    return {
        "token": token,
        "user": {
            "id": row["id"],
            "name": row["name"],
            "email": row["email"],
            "farm_location": row["farm_location"],
        },
    }


@app.post("/auth/logout")
def logout(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, detail="Missing or invalid authorization token.")
    token = authorization.split(" ", 1)[1].strip()
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()
    return {"status": "logged_out"}


@app.get("/auth/me")
def me(authorization: str | None = Header(default=None)):
    user = get_current_user(authorization)
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "farm_location": user["farm_location"],
    }


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
def predict(body: PredictIn, authorization: str | None = Header(default=None)):
    user = get_current_user(authorization)
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
    level = stress_level(water_stress)
    recommended_water_l_m2, irrigation_frequency_days, explanation = recommendation_from_inputs(
        water_stress, body.temperature, body.rainfall, body.soil_moisture
    )
    timestamp = now_iso()

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO predictions (
            user_id, temperature, rainfall, soil_moisture, crop_type,
            water_stress, stress_level, recommended_water_l_m2,
            irrigation_frequency_days, explanation, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user["id"],
            body.temperature,
            body.rainfall,
            body.soil_moisture,
            crop,
            water_stress,
            level,
            recommended_water_l_m2,
            irrigation_frequency_days,
            explanation,
            timestamp,
        ),
    )
    conn.commit()
    conn.close()
    return PredictOut(
        water_stress=water_stress,
        level=level,
        recommended_water_l_m2=recommended_water_l_m2,
        irrigation_frequency_days=irrigation_frequency_days,
        explanation=explanation,
        timestamp=timestamp,
    )


@app.get("/predictions/history", response_model=list[HistoryItem])
def prediction_history(authorization: str | None = Header(default=None)):
    user = get_current_user(authorization)
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, temperature, rainfall, soil_moisture, crop_type, water_stress,
               stress_level, recommended_water_l_m2, irrigation_frequency_days,
               explanation, created_at
        FROM predictions
        WHERE user_id = ?
        ORDER BY created_at DESC
        """,
        (user["id"],),
    )
    rows = [dict(r) for r in cur.fetchall()]
    conn.close()
    return rows


@app.on_event("startup")
def on_startup():
    init_db()
