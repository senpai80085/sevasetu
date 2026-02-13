"""
Shared service configuration.

This module contains configuration settings shared across all services.
"""

import os
from typing import Optional


class Config:
    """Base configuration class for SevaSetu platform."""
    
    # Database settings (using SQLite for demo - change to PostgreSQL in production)
    # Database settings (using SQLite for demo - change to PostgreSQL in production)
    # Using absolute path to ensure all services access the SAME database file
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DB_PATH = os.path.join(BASE_DIR, "sevasetu.db")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{DB_PATH}"
    )
    
    # Service URLs
    AI_SERVICE_URL: str = os.getenv("AI_SERVICE_URL", "http://localhost:8003")
    BLOCKCHAIN_SERVICE_URL: str = os.getenv("BLOCKCHAIN_SERVICE_URL", "http://localhost:8004")
    SAFETY_SERVICE_URL: str = os.getenv("SAFETY_SERVICE_URL", "http://localhost:8005")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    
    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",  # Civilian app
        "http://localhost:3001",  # Caregiver app
    ]
