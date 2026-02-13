"""
AI Matching Service main application.

This module initializes the FastAPI application for AI-powered
caregiver matching.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import router

# Initialize FastAPI app
app = FastAPI(
    title="SevaSetu AI Matching Service",
    description="ML-powered caregiver matching and ranking service",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # AI service is called by other backend services
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(router)


@app.on_event("startup")
async def startup_event():
    """
    Initialize model on startup if not already trained.
    """
    print("AI Matching Service starting...")
    print("Model will be loaded on first request if not already trained.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
