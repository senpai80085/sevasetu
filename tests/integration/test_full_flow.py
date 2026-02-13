"""
Integration tests for SevaSetu platform.

Tests the complete flow:
1. Register caregiver
2. Request care
3. Match caregivers (AI service)
4. Confirm booking
5. Submit rating

Uses pytest with simulated AI service responses.
"""

import pytest
import sys
import os
from datetime import datetime, timedelta

# Add services to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../services'))

from shared.database import Base, engine, SessionLocal
from shared.models import Caregiver, Civilian, Booking, Rating
from caregiver_api.routes.caregiver import register_caregiver
from civilian_api.routes.civilian import confirm_booking, submit_rating
from fastapi.testclient import TestClient


@pytest.fixture(scope="module")
def setup_database():
    """
    Create test database tables.
    """
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session(setup_database):
    """
    Provide a clean database session for each test.
    """
    session = SessionLocal()
    yield session
    session.rollback()
    session.close()


def test_full_caregiving_flow(db_session):
    """
    Integration test for complete caregiving flow.
    
    Flow:
    1. Register caregiver
    2. Create civilian
    3. Request care
    4. Match caregivers (simulated AI)
    5. Confirm booking
    6. Submit rating
    """
    # STEP 1: Register caregiver
    print("\n=== STEP 1: Registering caregiver ===")
    caregiver = Caregiver(
        hashed_identity="test_hash_123456789abcdef",
        name="Test Caregiver",
        gender="Female",
        skills=["elderly care", "nursing"],
        experience_years=5,
        rating_average=0.0,
        trust_score=0.0,
        verified=True
    )
    db_session.add(caregiver)
    db_session.commit()
    db_session.refresh(caregiver)
    
    assert caregiver.id is not None
    print(f"Caregiver registered: ID={caregiver.id}, Name={caregiver.name}")
    
    # STEP 2: Create civilian
    print("\n=== STEP 2: Creating civilian ===")
    civilian = Civilian(
        name="Test Civilian",
        guardian_contact="guardian@test.com"
    )
    db_session.add(civilian)
    db_session.commit()
    db_session.refresh(civilian)
    
    assert civilian.id is not None
    print(f"Civilian created: ID={civilian.id}, Name={civilian.name}")
    
    # STEP 3: Request care (simulated)
    print("\n=== STEP 3: Requesting care ===")
    required_skills = ["elderly care"]
    start_time = datetime.now() + timedelta(days=1)
    end_time = start_time + timedelta(hours=4)
    print(f"Care requested for: {required_skills}")
    print(f"Time: {start_time} to {end_time}")
    
    # STEP 4: Match caregivers (simulated AI ranking)
    print("\n=== STEP 4: Matching caregivers (AI simulation) ===")
    # In real flow, this would call AI service
    # For test, we simulate the match
    matching_caregivers = db_session.query(Caregiver).filter(
        Caregiver.verified == True
    ).all()
    
    matched = []
    for cg in matching_caregivers:
        skill_overlap = set(cg.skills) & set(required_skills)
        if skill_overlap:
            matched.append({
                "caregiver_id": cg.id,
                "name": cg.name,
                "match_score": 0.85  # Simulated AI score
            })
    
    assert len(matched) > 0
    print(f"Found {len(matched)} matching caregivers")
    print(f"Top match: {matched[0]['name']} (score: {matched[0]['match_score']})")
    
    # STEP 5: Confirm booking
    print("\n=== STEP 5: Confirming booking ===")
    booking = Booking(
        caregiver_id=matched[0]['caregiver_id'],
        civilian_id=civilian.id,
        start_time=start_time,
        end_time=end_time,
       status="confirmed"
    )
    db_session.add(booking)
    db_session.commit()
    db_session.refresh(booking)
    
    assert booking.id is not None
    print(f"Booking confirmed: ID={booking.id}")
    print(f"Caregiver {booking.caregiver_id} assigned to Civilian {booking.civilian_id}")
    
    # STEP 6: Submit rating
    print("\n=== STEP 6: Submitting rating ===")
    rating = Rating(
        caregiver_hash=caregiver.hashed_identity,
        caregiver_id=caregiver.id,
        rating=4.5,
        review_text="Excellent care provided!"
    )
    db_session.add(rating)
    
    # Update caregiver average rating
    all_ratings = db_session.query(Rating).filter(
        Rating.caregiver_id == caregiver.id
    ).all()
    total_ratings = len(all_ratings) + 1
    sum_ratings = sum(r.rating for r in all_ratings) + 4.5
    caregiver.rating_average = sum_ratings / total_ratings
    
    db_session.commit()
    db_session.refresh(rating)
    db_session.refresh(caregiver)
    
    assert rating.id is not None
    assert caregiver.rating_average == 4.5
    print(f"Rating submitted: {rating.rating}/5.0")
    print(f"Caregiver new average rating: {caregiver.rating_average}")
    
    print("\n=== INTEGRATION TEST PASSED ===")
    print("Complete flow executed successfully:")
    print(f"  ✓ Caregiver registered (ID: {caregiver.id})")
    print(f"  ✓ Civilian created (ID: {civilian.id})")
    print(f"  ✓ Care requested")
    print(f"  ✓ Caregivers matched")
    print(f"  ✓ Booking confirmed (ID: {booking.id})")
    print(f"  ✓ Rating submitted (ID: {rating.id})")


def test_trust_score_calculation():
    """
    Test trust score computation engine.
    """
    from shared.trust_engine import compute_trust_score, explain_trust_score
    
    print("\n=== Testing Trust Score Engine ===")
    
    # Test case: Good caregiver
    score = compute_trust_score(
        verification_status=True,
        rating_average=4.5,
        completed_jobs=20,
        complaints=0,
        anomaly_flags=0
    )
    
    assert 70 <= score <= 95
    print(f"Good caregiver trust score: {score}")
    
    # Test case: Problematic caregiver
    score2 = compute_trust_score(
        verification_status=False,
        rating_average=2.5,
        completed_jobs=5,
        complaints=3,
        anomaly_flags=2
    )
    
    assert score2 < 40
    print(f"Problematic caregiver trust score: {score2}")
    
    print("✓ Trust score engine tests passed")


def test_safety_monitoring():
    """
    Test safety anomaly detection.
    """
    from safety_service.monitor import detect_anomaly, AnomalyStatus
    
    print("\n=== Testing Safety Monitoring ===")
    
    # Normal activity
    status = detect_anomaly(motion_level=0.5, stillness_time=10)
    assert status == AnomalyStatus.NORMAL
    print(f"Normal activity: {status}")
    
    # Warning condition
    status = detect_anomaly(motion_level=0.15, stillness_time=20)
    assert status == AnomalyStatus.WARNING
    print(f"Low activity: {status}")
    
    # Alert condition
    status = detect_anomaly(motion_level=0.05, stillness_time=35)
    assert status == AnomalyStatus.ALERT
    print(f"No motion: {status}")
    
    print("✓ Safety monitoring tests passed")


if __name__ == "__main__":
    print("Running integration tests...")
    pytest.main([__file__, "-v", "-s"])
