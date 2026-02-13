"""
Trust score computation engine.

This module provides deterministic trust score calculation for caregivers
based on multiple verification and performance factors.

Approach:
    Uses weighted formula (NOT machine learning) for transparent,
    explainable trust scoring.
"""

from typing import Dict, Any


def compute_trust_score(
    verification_status: bool,
    rating_average: float,
    completed_jobs: int,
    complaints: int,
    anomaly_flags: int
) -> float:
    """
    Calculate trust score for a caregiver using weighted formula.
    
    This is a deterministic function that combines multiple factors
    to produce a trust score between 0.0 and 100.0.
    
    Args:
        verification_status: Whether identity is verified (bool)
        rating_average: Average rating from 1.0 to 5.0
        completed_jobs: Number of successfully completed jobs
        complaints: Number of complaints received
        anomaly_flags: Number of anomaly incidents flagged
        
    Returns:
        Trust score (0.0-100.0)
        
    Formula Breakdown:
        Base Score (40 points):
            - Verified: +40
            - Unverified: 0
            
        Rating Score (30 points):
            - Linear map from rating [1.0, 5.0] to [0, 30]
            - Formula: ((rating - 1.0) / 4.0) * 30
            
        Experience Score (20 points):
            - Logarithmic scale based on completed jobs
            - More jobs = higher score, with diminishing returns
            - Formula: min(20, log10(jobs + 1) * 10)
            
        Penalty Deductions:
            - Complaints: -5 points each (max -30)
            - Anomaly flags: -3 points each (max -20)
            
    Design Rationale:
        1. Verification is foundational (40% weight)
        2. User ratings matter most (30% weight)
        3. Experience builds trust gradually (20% weight)
        4. Complaints and anomalies are significant red flags
    """
    # Base verification score (40 points)
    verification_score = 40.0 if verification_status else 0.0
    
    # Rating score (30 points max)
    # Map [1.0, 5.0] to [0, 30]
    rating_normalized = (rating_average - 1.0) / 4.0  # Normalize to [0, 1]
    rating_score = rating_normalized * 30.0
    
    # Experience score based on completed jobs (20 points max)
    # Use logarithmic scale to handle diminishing returns
    import math
    experience_score = min(20.0, math.log10(completed_jobs + 1) * 10.0)
    
    # Penalty deductions
    complaint_penalty = min(30.0, complaints * 5.0)  # Max -30
    anomaly_penalty = min(20.0, anomaly_flags * 3.0)  # Max -20
    
    # Calculate final score
    trust_score = (
        verification_score +
        rating_score +
        experience_score -
        complaint_penalty -
        anomaly_penalty
    )
    
    # Ensure score is in valid range [0, 100]
    trust_score = max(0.0, min(100.0, trust_score))
    
    return round(trust_score, 2)


def get_trust_level(trust_score: float) -> str:
    """
    Convert numeric trust score to human-readable level.
    
    Args:
        trust_score: Numeric score (0-100)
        
    Returns:
        Trust level label
    """
    if trust_score >= 80:
        return "Excellent"
    elif trust_score >= 60:
        return "Good"
    elif trust_score >= 40:
        return "Fair"
    elif trust_score >= 20:
        return "Low"
    else:
        return "Very Low"


def explain_trust_score(
    verification_status: bool,
    rating_average: float,
    completed_jobs: int,
    complaints: int,
    anomaly_flags: int
) -> Dict[str, Any]:
    """
    Compute trust score and provide detailed breakdown.
    
    Args:
        Same as compute_trust_score()
        
    Returns:
        Dictionary with score, level, and breakdown
    """
    import math
    
    # Component scores
    verification_score = 40.0 if verification_status else 0.0
    rating_normalized = (rating_average - 1.0) / 4.0
    rating_score = rating_normalized * 30.0
    experience_score = min(20.0, math.log10(completed_jobs + 1) * 10.0)
    complaint_penalty = min(30.0, complaints * 5.0)
    anomaly_penalty = min(20.0, anomaly_flags * 3.0)
    
    # Total score
    total_score = compute_trust_score(
        verification_status,
        rating_average,
        completed_jobs,
        complaints,
        anomaly_flags
    )
    
    return {
        "trust_score": total_score,
        "trust_level": get_trust_level(total_score),
        "breakdown": {
            "verification": {
                "score": verification_score,
                "max": 40.0,
                "verified": verification_status
            },
            "ratings": {
                "score": round(rating_score, 2),
                "max": 30.0,
                "average": rating_average
            },
            "experience": {
                "score": round(experience_score, 2),
                "max": 20.0,
                "completed_jobs": completed_jobs
            },
            "penalties": {
                "complaints": round(complaint_penalty, 2),
                "anomalies": round(anomaly_penalty, 2),
                "total": round(complaint_penalty + anomaly_penalty, 2)
            }
        }
    }


if __name__ == "__main__":
    # Test scenarios
    print("=== Test Scenario 1: New Verified Caregiver ===")
    result1 = explain_trust_score(
        verification_status=True,
        rating_average=4.0,
        completed_jobs=5,
        complaints=0,
        anomaly_flags=0
    )
    print(f"Trust Score: {result1['trust_score']} ({result1['trust_level']})")
    print(f"Breakdown: {result1['breakdown']}\n")
    
    print("=== Test Scenario 2: Experienced Excellent Caregiver ===")
    result2 = explain_trust_score(
        verification_status=True,
        rating_average=4.8,
        completed_jobs=100,
        complaints=1,
        anomaly_flags=0
    )
    print(f"Trust Score: {result2['trust_score']} ({result2['trust_level']})")
    print(f"Breakdown: {result2['breakdown']}\n")
    
    print("=== Test Scenario 3: Unverified with Issues ===")
    result3 = explain_trust_score(
        verification_status=False,
        rating_average=3.0,
        completed_jobs=10,
        complaints=3,
        anomaly_flags=2
    )
    print(f"Trust Score: {result3['trust_score']} ({result3['trust_level']})")
    print(f"Breakdown: {result3['breakdown']}")
