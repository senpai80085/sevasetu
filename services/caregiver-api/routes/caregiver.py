"""
Caregiver API routes.

Endpoints for caregiver operations: registration, availability,
profile retrieval, job listing, start-job, and end-job.

All endpoints are protected with require_role("caregiver").
Job lifecycle uses shared.workflow state transitions.
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from shared.database import get_db
from shared.models import Caregiver, Booking, Civilian
from shared.auth.dependencies import require_role
from shared.workflow import transition_booking
from shared.payment import capture_payment
from shared.models.audit import log_audit
from schemas import (
    CaregiverRegisterRequest,
    CaregiverUpdateRequest,
    CaregiverResponse,
    AvailabilityRequest,
    JobResponse,
    BookingStatusUpdateRequest,
)

router = APIRouter(prefix="/caregiver", tags=["caregiver"])


@router.put("/update", response_model=CaregiverResponse)
def update_caregiver(
    request: CaregiverUpdateRequest,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("caregiver")),
):
    """Update caregiver profile details."""
    cg = db.query(Caregiver).filter(Caregiver.identity_id == user["identity_id"]).first()
    if not cg:
        raise HTTPException(status_code=404, detail="Caregiver not found")

    if request.name is not None:
        cg.name = request.name
    if request.gender is not None:
        cg.gender = request.gender
    if request.skills is not None:
        cg.skills = request.skills
    if request.experience_years is not None:
        cg.experience_years = request.experience_years

    db.commit()
    db.refresh(cg)
    return cg


@router.get("/me", response_model=CaregiverResponse)
def get_current_caregiver(
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("caregiver")),
):
    """Retrieve current caregiver profile."""
    # Find by identity_id
    cg = db.query(Caregiver).filter(Caregiver.identity_id == user["identity_id"]).first()
    if not cg:
        raise HTTPException(status_code=404, detail="Caregiver profile not found")

    # Dynamic trust score calculation
    completed = db.query(Booking).filter(
        Booking.caregiver_id == cg.id, Booking.status == "completed"
    ).count()
    score = (
        40.0 * int(cg.verified)
        + 30.0 * (cg.rating_average / 5.0)
        + 30.0 * min(completed / 10.0, 1.0)
    )
    cg.trust_score = round(score, 2)
    return cg


@router.get("/jobs/me", response_model=List[JobResponse])
def get_current_caregiver_jobs(
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("caregiver")),
):
    """List all jobs for the current caregiver."""
    cg = db.query(Caregiver).filter(Caregiver.identity_id == user["identity_id"]).first()
    if not cg:
        raise HTTPException(status_code=404, detail="Caregiver not found")

    bookings = db.query(Booking).filter(Booking.caregiver_id == cg.id).all()
    jobs = []
    for b in bookings:
        civ = db.query(Civilian).filter(Civilian.id == b.civilian_id).first()
        jobs.append(JobResponse(
            id=b.id,
            civilian_id=b.civilian_id,
            civilian_name=civ.name if civ else "Unknown",
            start_time=b.start_time,
            end_time=b.end_time,
            status=b.status,
        ))
    return jobs


# ---------- existing endpoints (unchanged logic, RBAC added) ----------

@router.post("/register", response_model=CaregiverResponse, status_code=status.HTTP_201_CREATED)
def register_caregiver(
    request: CaregiverRegisterRequest,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("caregiver")),
):
    """Register a new caregiver."""
    existing = db.query(Caregiver).filter(
        Caregiver.hashed_identity == request.hashed_identity
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Identity already exists")

    new_cg = Caregiver(
        hashed_identity=request.hashed_identity,
        name=request.name,
        gender=request.gender,
        skills=request.skills,
        experience_years=request.experience_years,
        rating_average=0.0,
        trust_score=0.0,
        verified=False,
    )
    db.add(new_cg)
    db.commit()
    db.refresh(new_cg)
    return new_cg


@router.post("/availability", status_code=status.HTTP_200_OK)
def update_availability(
    request: AvailabilityRequest,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("caregiver")),
):
    """Update caregiver availability (placeholder)."""
    cg = db.query(Caregiver).filter(Caregiver.id == request.caregiver_id).first()
    if not cg:
        raise HTTPException(status_code=404, detail="Caregiver not found")
    return {
        "message": "Availability updated",
        "caregiver_id": request.caregiver_id,
        "available": request.available,
    }


@router.get("/{caregiver_id}", response_model=CaregiverResponse)
def get_caregiver(
    caregiver_id: int,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("caregiver")),
):
    """Retrieve caregiver profile with dynamic trust score."""
    cg = db.query(Caregiver).filter(Caregiver.id == caregiver_id).first()
    if not cg:
        raise HTTPException(status_code=404, detail="Caregiver not found")

    completed = db.query(Booking).filter(
        Booking.caregiver_id == caregiver_id, Booking.status == "completed"
    ).count()
    score = (
        40.0 * int(cg.verified)
        + 30.0 * (cg.rating_average / 5.0)
        + 30.0 * min(completed / 10.0, 1.0)
    )
    cg.trust_score = round(score, 2)
    return cg


@router.get("/jobs/{caregiver_id}", response_model=List[JobResponse])
def get_caregiver_jobs(
    caregiver_id: int,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("caregiver")),
):
    """List all jobs for a caregiver."""
    cg = db.query(Caregiver).filter(Caregiver.id == caregiver_id).first()
    if not cg:
        raise HTTPException(status_code=404, detail="Caregiver not found")

    bookings = db.query(Booking).filter(Booking.caregiver_id == caregiver_id).all()
    jobs = []
    for b in bookings:
        civ = db.query(Civilian).filter(Civilian.id == b.civilian_id).first()
        jobs.append(JobResponse(
            id=b.id,
            civilian_id=b.civilian_id,
            civilian_name=civ.name if civ else "Unknown",
            start_time=b.start_time,
            end_time=b.end_time,
            status=b.status,
        ))
    return jobs


# ---------- Part 4 – Job lifecycle endpoints ----------

@router.post("/start-job/{booking_id}")
def start_job(
    booking_id: int,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("caregiver")),
):
    """
    Start a confirmed job → CONFIRMED→IN_PROGRESS.

    Captures payment and records the actual start timestamp.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    transition_booking(booking, "in_progress")
    booking.started_at = datetime.utcnow()

    # Capture the reserved payment
    pay_result = capture_payment(booking)

    db.commit()

    log_audit(user["identity_id"], "job_started", "booking", booking.id)

    return {
        "message": "Job started",
        "booking_id": booking.id,
        "status": booking.status,
        "started_at": booking.started_at.isoformat(),
        "payment": pay_result,
    }


@router.post("/end-job/{booking_id}")
def end_job(
    booking_id: int,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("caregiver")),
):
    """
    End an in-progress job → IN_PROGRESS→COMPLETED.

    Records the actual end timestamp.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    transition_booking(booking, "completed")
    booking.ended_at = datetime.utcnow()

    db.commit()

    log_audit(user["identity_id"], "job_ended", "booking", booking.id)

    return {
        "message": "Job completed",
        "booking_id": booking.id,
        "status": booking.status,
        "ended_at": booking.ended_at.isoformat(),
    }


# ---------- Part 4 – Step K: Safety integration ----------

@router.post("/pause-job/{booking_id}")
def pause_job(
    booking_id: int,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("caregiver")),
):
    """Pause job on safety alert → IN_PROGRESS→PAUSED."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    transition_booking(booking, "paused")
    db.commit()

    log_audit(user["identity_id"], "job_paused_safety", "booking", booking.id)

    return {"message": "Job paused due to safety alert", "booking_id": booking.id, "status": booking.status}


@router.post("/resume-job/{booking_id}")
def resume_job(
    booking_id: int,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("caregiver")),
):
    """Resume paused job after guardian acknowledgement → PAUSED→IN_PROGRESS."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    transition_booking(booking, "in_progress")
    db.commit()

    log_audit(user["identity_id"], "job_resumed", "booking", booking.id)

    return {"message": "Job resumed", "booking_id": booking.id, "status": booking.status}


# ---------- DEMO ENDPOINTS ----------

@router.get("/bookings/pending", response_model=List[JobResponse])
def get_pending_bookings(
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("caregiver")),
):
    """
    Poll for pending/matched/confirmed bookings from the real DB.
    Returns only real bookings — no fake data.
    """
    cg = db.query(Caregiver).filter(Caregiver.identity_id == user["identity_id"]).first()
    if not cg:
        cg = db.query(Caregiver).first()
        if not cg:
            return []

    # Find bookings assigned to this caregiver OR unassigned (caregiver_id=0)
    # Only show CONFIRMED bookings (after Civilian clicks "Select")
    bookings = db.query(Booking).filter(
        (Booking.caregiver_id == cg.id) | (Booking.caregiver_id == 0),
        Booking.status.in_(["confirmed"])
    ).all()

    jobs = []
    for b in bookings:
        civ = db.query(Civilian).filter(Civilian.id == b.civilian_id).first()
        jobs.append(JobResponse(
            id=b.id,
            civilian_id=b.civilian_id,
            civilian_name=civ.name if civ else "Patient",
            start_time=b.start_time,
            end_time=b.end_time,
            status=b.status,
        ))

    return jobs


@router.put("/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: int,
    request: BookingStatusUpdateRequest,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("caregiver")),
):
    """Accept or Reject booking."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if request.status.lower() == "confirmed":
        transition_booking(booking, "confirmed")
    elif request.status.lower() == "accepted":
        transition_booking(booking, "accepted")
    elif request.status.lower() == "rejected":
        # Transition to rejected state
        transition_booking(booking, "rejected")
        # TODO: Logic to re-open booking for matching? For now, it's terminal. 
    
    db.commit()
    return {"message": f"Booking {request.status}", "status": booking.status}


@router.put("/profile", response_model=CaregiverResponse)
def update_profile_demo(
    request: CaregiverUpdateRequest,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("caregiver")),
):
    """Alias for update_caregiver."""
    # Reuse logic
    cg = db.query(Caregiver).filter(Caregiver.identity_id == user["identity_id"]).first()
    if not cg:
        raise HTTPException(status_code=404, detail="Caregiver not found")

    if request.name is not None:
        cg.name = request.name
    if request.gender is not None:
        cg.gender = request.gender
    if request.skills is not None:
        cg.skills = request.skills
    if request.experience_years is not None:
        cg.experience_years = request.experience_years

    db.commit()
    db.refresh(cg)
    return cg
