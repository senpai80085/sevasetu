"""
AI matching service routes.

This module exposes FastAPI endpoints for caregiver matching and ranking.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from pathlib import Path
import sys

# Add model directory to path
sys.path.append(str(Path(__file__).parent.parent / "model"))

from model import CaregiverMatcher

router = APIRouter(tags=["matching"])

# Initialize matcher (load model once at startup)
try:
    matcher = CaregiverMatcher()
except FileNotFoundError:
    matcher = None  # Will be trained on first request


class RankRequest(BaseModel):
    """
    Request schema for ranking caregivers.
    
    Attributes:
        caregivers: List of caregiver data with features
        required_skills: Required skills for matching context
    """
    caregivers: List[Dict[str, Any]]
    required_skills: List[str]


class RankResponse(BaseModel):
    """
    Response schema for ranked caregivers.
    
    Attributes:
        ranked_caregivers: Top caregivers sorted by match score
    """
    ranked_caregivers: List[Dict[str, Any]]


@router.post("/rank", response_model=RankResponse)
def rank_caregivers(request: RankRequest):
    """
    Rank caregivers using ML model.
    
    This endpoint receives caregiver candidates and returns the top 3
    ranked by predicted match score.
    
    Args:
        request: Caregiver data and matching context
        
    Returns:
        RankResponse: Top 3 caregivers sorted by match score
        
    Expected Input Features (per caregiver):
        - skill_match: Skill overlap score (0.0-1.0)
        - distance_score: Distance proximity (0.0-1.0)  
        - experience_years: Years of experience (0-20+)
        - rating_average: Average rating (1.0-5.0)
        - price: Normalized price (0.0-1.0, optional, defaults to 0.5)
        
    Note: If model not trained, falls back to trust_score sorting
    """
    global matcher
    
    # Auto-train model if not loaded
    if matcher is None:
        try:
            from model import train_model
            print("Training model (first-time setup)...")
            train_model()
            matcher = CaregiverMatcher()
        except Exception as e:
            # Fallback: sort by trust_score
            print(f"Warning: Could not load ML model: {e}")
            sorted_caregivers = sorted(
                request.caregivers,
                key=lambda x: x.get('trust_score', 0),
                reverse=True
            )[:3]
            return RankResponse(ranked_caregivers=sorted_caregivers)
    
    try:
        # Ensure required features exist
        for cg in request.caregivers:
            if 'price' not in cg:
                cg['price'] = 0.5  # Default mid-range price
        
        # Rank using ML model
        ranked = matcher.rank_caregivers(request.caregivers)
        
        # Return top 3
        top_3 = ranked[:3]
        
        return RankResponse(ranked_caregivers=top_3)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during ranking: {str(e)}"
        )


@router.get("/health")
def health_check():
    """
    Health check endpoint.
    
    Returns:
        dict: Service status and model loaded status
    """
    return {
        "status": "healthy",
        "service": "ai-matching",
        "model_loaded": matcher is not None
    }
