"""
Safety Service main application.

This module provides safety monitoring and guardian live mode APIs.
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any

from monitor import detect_anomaly, analyze_monitoring_data, AnomalyStatus
from guardian import start_guardian_session, end_guardian_session, get_session_status

# Initialize FastAPI app
app = FastAPI(
    title="SevaSetu Safety Service",
    description="Safety monitoring and guardian live mode service",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class MonitoringRequest(BaseModel):
    """Request schema for anomaly detection."""
    civilian_id: int = Field(..., gt=0)
    motion_level: float = Field(..., ge=0.0, le=1.0)
    stillness_time: int = Field(..., ge=0)


class GuardianSessionStartRequest(BaseModel):
    """Request schema for starting guardian session."""
    civilian_id: int = Field(..., gt=0)
    caregiver_id: int = Field(..., gt=0)
    guardian_contact: str
    duration_minutes: int = Field(default=30, gt=0, le=120)


class GuardianSessionEndRequest(BaseModel):
    """Request schema for ending guardian session."""
    session_token: str


# Routes
@app.post("/monitor/analyze")
def analyze_safety_monitoring(request: MonitoringRequest) -> Dict[str, Any]:
    """
    Analyze monitoring data for anomalies with escalation management.
    
    Uses escalation ladder to prevent guardian mode spam:
    - 1st alert: Notification only
    - 2nd alert in 5 min: Guardian prompt
    - 3rd+ alert in 5 min: Auto-enable live mode
    
    Args:
        request: Civilian ID, motion level, and stillness time
        
    Returns:
        Analysis with status, explanation, recommendations, and escalation info
    """
    from monitor.alert_manager import get_alert_action
    
    # Get base analysis
    analysis = analyze_monitoring_data(
        motion_level=request.motion_level,
        stillness_time=request.stillness_time
    )
    
    # If anomaly detected, apply escalation ladder
    if analysis["status"] in ["warning", "alert"]:
        escalation = get_alert_action(request.civilian_id)
        
        # Update recommendations based on escalation
        analysis["escalation"] = escalation
        analysis["recommendations"] = [escalation["explanation"]] + analysis.get("recommendations", [])
    
    return analysis


@app.post("/guardian/session/start")
def start_session(request: GuardianSessionStartRequest) -> Dict[str, Any]:
    """
    Start a guardian live mode session.
    
    Args:
        request: Session parameters
        
    Returns:
        Session tokens and WebRTC connection details
    """
    return start_guardian_session(
        civilian_id=request.civilian_id,
        caregiver_id=request.caregiver_id,
        guardian_contact=request.guardian_contact,
        duration_minutes=request.duration_minutes
    )


@app.post("/guardian/session/end")
def end_session(request: GuardianSessionEndRequest) -> Dict[str, Any]:
    """
    End an active guardian session.
    
    Args:
        request: Session token
        
    Returns:
        Session end confirmation
    """
    try:
        return end_guardian_session(request.session_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@app.get("/guardian/session/{session_token}")
def get_session(session_token: str) -> Dict[str, Any]:
    """
    Get guardian session status.
    
    Args:
        session_token: Session token
        
    Returns:
        Session status details
    """
    try:
        return get_session_status(session_token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "safety-service"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
