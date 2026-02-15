"""
Caregiver API main application.

This module initializes the FastAPI application for the caregiver service.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add parent directory to path for shared imports
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from shared.config import Config
from shared.database import Base, engine, SessionLocal
from shared.models import Caregiver
from routes import router


# ── DEMO_MODE: Seed default caregiver on startup ────────────────────────
@asynccontextmanager
async def lifespan(app):
    """
    DEMO_MODE: Ensure a default caregiver always exists.
    Runs on every server startup. Skips if data already present.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Caregiver).count() == 0:
            demo_cg = Caregiver(
                hashed_identity="demo_caregiver_hash_sevasetu",
                name="Demo Caregiver",
                gender="Female",
                skills=["elderly_care", "assistance"],
                experience_years=3,
                rating_average=4.7,
                trust_score=88.0,
                verified=True,
            )
            db.add(demo_cg)
            db.commit()
            print("DEMO_MODE: Seeded default caregiver (Demo Caregiver)")
    except Exception as e:
        print(f"DEMO_MODE: Seed skipped ({e})")
        db.rollback()
    finally:
        db.close()

    yield  # App runs here


# Initialize FastAPI app
app = FastAPI(
    title="SevaSetu Caregiver API",
    description="API for caregiver operations in the SevaSetu platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router)


@app.get("/health")
def health_check():
    """
    Health check endpoint.

    Returns:
        dict: Service status
    """
    return {"status": "healthy", "service": "caregiver-api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
