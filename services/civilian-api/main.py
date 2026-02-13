"""
Civilian API main application.

This module initializes the FastAPI application for the civilian service.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add parent directory to path for shared imports
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from shared.config import Config
from routes import router

# Initialize FastAPI app
app = FastAPI(
    title="SevaSetu Civilian API",
    description="API for civilian operations in the SevaSetu platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.ALLOWED_ORIGINS,
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
    return {"status": "healthy", "service": "civilian-api"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
