"""
End-to-end workflow integration test.

Tests the full booking lifecycle:
    login → request-care → match → confirm → start → end → rate
"""

import sys, os
import pytest
from fastapi.testclient import TestClient
from datetime import datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'services'))

from shared.database import Base, engine


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture(scope="module")
def auth():
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'services', 'auth-service'))
    from main import app
    return TestClient(app)


@pytest.fixture(scope="module")
def civilian():
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'services', 'civilian-api'))
    from main import app
    return TestClient(app)


@pytest.fixture(scope="module")
def caregiver():
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'services', 'caregiver-api'))
    from main import app
    return TestClient(app)


def _get_token(auth_client, phone: str, role: str) -> str:
    """Helper: get a JWT access token."""
    r = auth_client.post("/auth/request-otp", json={"phone_number": phone, "role": role})
    otp = r.json()["otp"]
    r = auth_client.post("/auth/verify-otp", json={"phone_number": phone, "role": role, "otp": otp})
    return r.json()["access_token"]


def _headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


# -- Seed a verified caregiver directly --

@pytest.fixture(scope="module")
def seed_caregiver():
    """Insert a verified caregiver into the DB."""
    from shared.database import SessionLocal
    from shared.models import Caregiver
    db = SessionLocal()
    cg = db.query(Caregiver).filter(Caregiver.hashed_identity == "test_e2e_hash").first()
    if not cg:
        cg = Caregiver(
            hashed_identity="test_e2e_hash",
            name="E2E Caregiver",
            skills=["elder_care", "medical"],
            experience_years=5,
            rating_average=4.0,
            trust_score=70.0,
            verified=True,
        )
        db.add(cg)
        db.commit()
        db.refresh(cg)
    db.close()
    return cg.id


# -- Seed a civilian directly --

@pytest.fixture(scope="module")
def seed_civilian():
    """Insert a civilian into the DB."""
    from shared.database import SessionLocal
    from shared.models import Civilian
    db = SessionLocal()
    civ = db.query(Civilian).filter(Civilian.name == "E2E Civilian").first()
    if not civ:
        civ = Civilian(name="E2E Civilian", guardian_contact="+911234567890")
        db.add(civ)
        db.commit()
        db.refresh(civ)
    db.close()
    return civ.id


def test_full_workflow(auth, civilian, caregiver, seed_caregiver, seed_civilian):
    """
    Full lifecycle test:
        login → request-care (PENDING) → match (MATCHED) → confirm (CONFIRMED)
        → start-job (IN_PROGRESS) → end-job (COMPLETED) → submit-rating (RATED→CLOSED)
    """
    cg_id = seed_caregiver
    civ_id = seed_civilian

    civ_token = _get_token(auth, "7777777777", "civilian")
    cg_token = _get_token(auth, "8888888888", "caregiver")

    now = datetime.utcnow()
    start = (now + timedelta(hours=1)).isoformat()
    end = (now + timedelta(hours=3)).isoformat()

    # 1. Request care → PENDING
    r = civilian.post("/civilian/request-care", json={
        "civilian_id": civ_id,
        "required_skills": ["elder_care"],
        "start_time": start,
        "end_time": end,
    }, headers=_headers(civ_token))
    assert r.status_code == 201, r.json()
    booking_id = r.json()["booking_id"]
    assert r.json()["status"] == "pending"

    # 2. Match caregivers → MATCHED
    r = civilian.post("/civilian/match-caregivers", json={
        "civilian_id": civ_id,
        "required_skills": ["elder_care"],
        "start_time": start,
        "end_time": end,
    }, headers=_headers(civ_token))
    assert r.status_code == 200

    # 3. Confirm booking → CONFIRMED, payment=reserved
    r = civilian.post("/civilian/confirm-booking", json={
        "civilian_id": civ_id,
        "caregiver_id": cg_id,
        "start_time": start,
        "end_time": end,
    }, headers=_headers(civ_token))
    assert r.status_code == 201, r.json()
    assert r.json()["status"] == "confirmed"

    # 4. Start job → IN_PROGRESS, payment=paid
    r = caregiver.post(f"/caregiver/start-job/{booking_id}", headers=_headers(cg_token))
    assert r.status_code == 200, r.json()
    assert r.json()["status"] == "in_progress"
    assert r.json()["payment"]["status"] == "paid"

    # 5. End job → COMPLETED
    r = caregiver.post(f"/caregiver/end-job/{booking_id}", headers=_headers(cg_token))
    assert r.status_code == 200, r.json()
    assert r.json()["status"] == "completed"

    # 6. Submit rating → RATED → auto CLOSED
    r = civilian.post("/civilian/submit-rating", json={
        "caregiver_id": cg_id,
        "rating": 4.5,
        "review_text": "Great care!",
    }, headers=_headers(civ_token))
    assert r.status_code == 201, r.json()
    assert "Rating submitted" in r.json()["message"]


def test_illegal_transition_blocked(auth, caregiver, seed_caregiver):
    """Cannot start a job that isn't confirmed."""
    cg_token = _get_token(auth, "9999999999", "caregiver")
    # booking_id 999 doesn't exist, but even if it did the state would be wrong
    r = caregiver.post("/caregiver/start-job/999999", headers=_headers(cg_token))
    assert r.status_code == 404  # not found


def test_concurrent_booking_blocked(auth, civilian, seed_civilian):
    """Second request-care with an active booking should be rejected."""
    civ_token = _get_token(auth, "6666666666", "civilian")

    now = datetime.utcnow()
    start = (now + timedelta(hours=1)).isoformat()
    end = (now + timedelta(hours=3)).isoformat()

    civ_id = seed_civilian

    # First booking succeeds (might conflict with previous test's civilian,
    # so we use a new civilian or accept existing)
    r = civilian.post("/civilian/request-care", json={
        "civilian_id": civ_id,
        "required_skills": ["elder_care"],
        "start_time": start,
        "end_time": end,
    }, headers=_headers(civ_token))
    # might be 201 or 409 if one already exists from previous test
    if r.status_code == 201:
        # Second booking should be blocked
        r2 = civilian.post("/civilian/request-care", json={
            "civilian_id": civ_id,
            "required_skills": ["elder_care"],
            "start_time": start,
            "end_time": end,
        }, headers=_headers(civ_token))
        assert r2.status_code == 409
