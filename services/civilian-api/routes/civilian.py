"""
Civilian API routes.

Endpoints for civilian operations: care requests, caregiver matching,
booking confirmation, and rating submission.

All endpoints are protected with require_role("civilian").
Booking state transitions are enforced by shared.workflow.
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import sys
import os
import httpx
import threading

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from shared.database import get_db, SessionLocal
from shared.models import Caregiver, Booking, Civilian, Rating, BookingStatus
from shared.config import Config
from shared.auth.dependencies import require_role
from shared.workflow import transition_booking
from shared.payment import reserve_payment
from shared.models.audit import log_audit
from schemas import (
    CareRequestRequest,
    CaregiverMatchResponse,
    MatchCaregiversResponse,
    ConfirmBookingRequest,
    BookingResponse,
    SubmitRatingRequest,
    RatingResponse,
    CivilianUpdateRequest,
    SafetySessionResponse,
)
import time
import random
import uuid
from .civilian_helper import _ensure_broadcast_caregiver


router = APIRouter(prefix="/civilian", tags=["civilian"])


# ── DEMO_MODE: Default caregiver fallback data ──────────────────────────

DEMO_CAREGIVER = {
    "caregiver_id": 0,
    "name": "Demo Caregiver",
    "skills": ["elderly_care", "assistance"],
    "experience_years": 3,
    "rating_average": 4.7,
    "trust_score": 88.0,
    "match_score": 88.0,
    "ai_confidence": 96.0,
    "ai_reason": "Best reliability prediction",
}


# ---------- helpers ----------

def _active_booking(db: Session, civilian_id: int):
    """Return the civilian's non-closed booking, or None."""
    return (
        db.query(Booking)
        .filter(
            Booking.civilian_id == civilian_id,
            ~Booking.status.in_(["closed", "cancelled", "rejected"]),
        )
        .first()
    )


def _recompute_trust(background: BackgroundTasks, caregiver_id: int):
    """Queue a trust-score recompute as a background task."""
    def _task():
        from shared.database import SessionLocal
        from shared.models import Caregiver as CG, Booking as BK
        db = SessionLocal()
        try:
            cg = db.query(CG).filter(CG.id == caregiver_id).first()
            if cg is None:
                return
            completed = db.query(BK).filter(
                BK.caregiver_id == caregiver_id, BK.status == "completed"
            ).count()
            score = (
                40.0 * int(cg.verified)
                + 30.0 * (cg.rating_average / 5.0)
                + 30.0 * min(completed / 10.0, 1.0)
            )
            cg.trust_score = round(score, 2)
            db.commit()
        finally:
            db.close()
    background.add_task(_task)


def _get_demo_caregiver(db: Session):
    """DEMO_MODE: Return the first available caregiver from DB, or None."""
    return db.query(Caregiver).filter(Caregiver.verified == True).order_by(Caregiver.id.desc()).first()


# ── DEMO_MODE: Auto-accept booking after timeout ────────────────────────

def _schedule_auto_accept(booking_id: int, delay_seconds: float = 5.0):
    """
    DEMO_MODE: Auto-accept a booking after `delay_seconds` if no caregiver
    has accepted it yet. This ensures hackathon demo reliability.
    """
    def _auto_accept():
        time.sleep(delay_seconds)
        db = SessionLocal()
        try:
            booking = db.query(Booking).filter(Booking.id == booking_id).first()
            if booking and booking.status in ("pending", "matched"):
                # DEMO_MODE: Force transition to confirmed
                booking.status = "confirmed"
                booking.payment_status = "reserved"
                db.commit()
                print(f"DEMO_MODE: Auto-accepted booking #{booking_id} after {delay_seconds}s")
        except Exception as e:
            print(f"DEMO_MODE: Auto-accept failed for #{booking_id}: {e}")
            db.rollback()
        finally:
            db.close()

    thread = threading.Thread(target=_auto_accept, daemon=True)
    thread.start()


# ---------- endpoints ----------

@router.post("/request-care", status_code=status.HTTP_201_CREATED)
def request_care(
    request: CareRequestRequest,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("civilian")),
):
    """
    Create a new care request → booking in PENDING state.

    Blocks if the civilian already has an active (non-closed) booking.
    """
    civilian = db.query(Civilian).filter(Civilian.id == request.civilian_id).first()
    if not civilian:
        # DEMO_MODE: Create civilian on-the-fly if missing
        civilian = Civilian(id=request.civilian_id, name="Demo User", guardian_contact="demo@sevasetu.in")
        db.add(civilian)
        db.commit()

    # Part 3 – Step F: prevent concurrent bookings
    active = _active_booking(db, request.civilian_id)
    if active:
        # DEMO_MODE: Return existing booking instead of 409
        return BookingResponse(
            booking_id=active.id,
            caregiver_id=active.caregiver_id,
            civilian_id=active.civilian_id,
            start_time=active.start_time,
            end_time=active.end_time,
            status=active.status,
        )

    # Create booking in PENDING state
    _ensure_broadcast_caregiver(db)
    booking = Booking(
        civilian_id=request.civilian_id,
        caregiver_id=0,  # Broadcast to all
        start_time=request.start_time,
        end_time=request.end_time,
        status="pending",
        payment_status="unpaid",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    log_audit(user["identity_id"], "booking_created", "booking", booking.id)

    return BookingResponse(
        booking_id=booking.id,
        caregiver_id=0,
        civilian_id=booking.civilian_id,
        start_time=booking.start_time,
        end_time=booking.end_time,
        status=booking.status,
    )


@router.post("/match-caregivers", response_model=MatchCaregiversResponse)
async def match_caregivers(
    request: CareRequestRequest,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("civilian")),
):
    """
    Find and rank matching caregivers.

    DEMO_MODE: Always returns at least 1 caregiver (fallback to demo profile).
    Simulated AI processing delay of 1.5 seconds.
    """
    civilian = db.query(Civilian).filter(Civilian.id == request.civilian_id).first()
    if not civilian:
        civilian = Civilian(id=request.civilian_id, name="Demo User", guardian_contact="demo@sevasetu.in")
        db.add(civilian)
        db.commit()

    # Find the pending booking
    booking = (
        db.query(Booking)
        .filter(Booking.civilian_id == request.civilian_id, Booking.status.in_(["pending", "matched"]))
        .first()
    )

    # DEMO_MODE: Simulated AI processing delay (1.5 seconds)
    time.sleep(1.5)

    # 1. Try to find real caregivers from DB
    caregiver = _get_demo_caregiver(db)

    results = []
    # DEMO_MODE: AI confidence between 93-98
    confidence = round(random.uniform(93.0, 98.0), 1)

    if caregiver:
        results.append(CaregiverMatchResponse(
            caregiver_id=caregiver.id,
            name=caregiver.name,
            skills=caregiver.skills,
            experience_years=caregiver.experience_years,
            rating_average=caregiver.rating_average,
            trust_score=caregiver.trust_score,
            match_score=caregiver.trust_score,
            ai_confidence=confidence,
            ai_reason="Best reliability prediction",
        ))
    else:
        results.append(CaregiverMatchResponse(**DEMO_CAREGIVER))

    # Transition booking PENDING → MATCHED if booking exists
    if booking:
        if booking.status == "pending":
            transition_booking(booking, "matched")
        # Keep caregiver_id=0 for broadcast
        db.commit()

    return MatchCaregiversResponse(caregivers=results)


@router.post("/confirm-booking", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def confirm_booking(
    request: ConfirmBookingRequest,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("civilian")),
):
    """
    Confirm booking → MATCHED→CONFIRMED.
    """
    civilian = db.query(Civilian).filter(Civilian.id == request.civilian_id).first()
    if not civilian:
        civilian = Civilian(id=request.civilian_id, name="Demo User", guardian_contact="demo@sevasetu.in")
        db.add(civilian)
        db.commit()

    # Find or create the booking
    booking = (
        db.query(Booking)
        .filter(
            Booking.civilian_id == request.civilian_id,
            Booking.status.in_(["pending", "matched"]),
        )
        .first()
    )

    _ensure_broadcast_caregiver(db)
    
    if booking:
        booking.caregiver_id = request.caregiver_id
        booking.start_time = request.start_time
        booking.end_time = request.end_time
        if booking.status == "pending":
            transition_booking(booking, "matched")
        transition_booking(booking, "confirmed")
    else:
        booking = Booking(
            caregiver_id=request.caregiver_id,
            civilian_id=request.civilian_id,
            start_time=request.start_time,
            end_time=request.end_time,
            status="confirmed",
            payment_status="unpaid",
        )
        db.add(booking)

    db.flush()
    reserve_payment(booking)
    db.commit()
    db.refresh(booking)

    log_audit(user["identity_id"], "booking_confirmed", "booking", booking.id)

    return BookingResponse(
        booking_id=booking.id,
        caregiver_id=booking.caregiver_id,
        civilian_id=booking.civilian_id,
        start_time=booking.start_time,
        end_time=booking.end_time,
        status=booking.status,
    )


@router.post("/submit-rating", response_model=RatingResponse, status_code=status.HTTP_201_CREATED)
def submit_rating(
    request: SubmitRatingRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("civilian")),
):
    """
    Submit rating → COMPLETED→RATED.

    Trust score recompute runs as a background task.
    """
    caregiver = db.query(Caregiver).filter(Caregiver.id == request.caregiver_id).first()
    if not caregiver:
        raise HTTPException(status_code=404, detail="Caregiver not found")

    # Transition booking to RATED
    booking = (
        db.query(Booking)
        .filter(
            Booking.caregiver_id == request.caregiver_id,
            Booking.status == "completed",
        )
        .order_by(Booking.id.desc())
        .first()
    )
    if booking:
        transition_booking(booking, "rated")

    # Create rating
    new_rating = Rating(
        caregiver_hash=caregiver.hashed_identity,
        caregiver_id=caregiver.id,
        rating=request.rating,
        review_text=request.review_text,
        blockchain_status="pending",
    )
    db.add(new_rating)

    # Update average
    all_ratings = db.query(Rating).filter(Rating.caregiver_id == caregiver.id).all()
    total = len(all_ratings) + 1
    caregiver.rating_average = (sum(r.rating for r in all_ratings) + request.rating) / total

    db.commit()
    db.refresh(new_rating)

    # Background: recompute trust score
    _recompute_trust(background_tasks, caregiver.id)

    log_audit(user["identity_id"], "rating_submitted", "rating", new_rating.id)

    # Auto-close booking after rating
    if booking:
        transition_booking(booking, "closed")
        db.commit()

    return RatingResponse(
        rating_id=new_rating.id,
        caregiver_id=caregiver.id,
        rating=request.rating,
        message="Rating submitted (blockchain pending). Booking closed.",
    )


# ---------- DEMO ENDPOINTS ----------

@router.post("/bookings", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking_demo(
    request: CareRequestRequest,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("civilian")),
):
    """
    DEMO_MODE: Create Booking with status=PENDING.
    Always succeeds — returns existing active booking if one exists.
    """
    # DEMO_MODE: Check active booking — return it instead of failing
    active = _active_booking(db, request.civilian_id)
    if active:
        return BookingResponse(
            booking_id=active.id,
            caregiver_id=active.caregiver_id,
            civilian_id=active.civilian_id,
            start_time=active.start_time,
            end_time=active.end_time,
            status=active.status,
        )

    # DEMO_MODE: Assign demo caregiver automatically
    caregiver = _get_demo_caregiver(db)
    cg_id = caregiver.id if caregiver else 0

    booking = Booking(
        civilian_id=request.civilian_id,
        caregiver_id=cg_id,
        start_time=request.start_time,
        end_time=request.end_time,
        status="pending",
        payment_status="unpaid",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    # Auto-accept removed — caregiver must accept manually

    return BookingResponse(
        booking_id=booking.id,
        caregiver_id=booking.caregiver_id,
        civilian_id=booking.civilian_id,
        start_time=booking.start_time,
        end_time=booking.end_time,
        status=booking.status,
    )


@router.put("/profile")
def update_profile(
    request: CivilianUpdateRequest,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("civilian")),
):
    """Update civilian profile."""
    civ = db.query(Civilian).filter(Civilian.identity_id == user["identity_id"]).first()
    if civ:
        if request.name:
            civ.name = request.name
        db.commit()
        db.refresh(civ)
    return civ


@router.get("/booking/status/{booking_id}")
def get_booking_status(
    booking_id: int,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("civilian")),
):
    """
    Poll booking status — used by civilian app to track lifecycle.
    Returns current status + caregiver name.
    """
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        return {"status": "not_found", "booking_id": booking_id}

    caregiver_name = "Caregiver"
    if booking.caregiver_id:
        cg = db.query(Caregiver).filter(Caregiver.id == booking.caregiver_id).first()
        if cg:
            caregiver_name = cg.name

    return {
        "booking_id": booking.id,
        "status": booking.status,
        "caregiver_id": booking.caregiver_id,
        "caregiver_name": caregiver_name,
        "start_time": booking.start_time.isoformat() if booking.start_time else None,
        "end_time": booking.end_time.isoformat() if booking.end_time else None,
        "started_at": booking.started_at.isoformat() if booking.started_at else None,
    }


@router.put("/booking/cancel/{booking_id}")
def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    user: Dict[str, Any] = Depends(require_role("civilian")),
):
    """Cancel a pending/confirmed booking."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        return {"status": "not_found"}
    booking.status = "cancelled"
    db.commit()
    return {"status": "cancelled", "booking_id": booking_id}


@router.post("/safety/session/start", response_model=SafetySessionResponse)
def start_safety_session(
    user: Dict[str, Any] = Depends(require_role("civilian")),
):
    """Start simulated safety session."""
    return SafetySessionResponse(
        session_id=str(uuid.uuid4()),
        stream_url="/demo-stream"
    )
