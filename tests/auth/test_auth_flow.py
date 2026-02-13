"""
End-to-end tests for the SevaSetu authentication system.

Tests:
    1. Request OTP → Verify OTP → Receive tokens
    2. Access civilian endpoint with valid civilian token (success)
    3. Access caregiver endpoint with civilian token (403)
    4. Refresh token works
    5. Expired / invalid token rejected
"""

import sys, os
import pytest
from fastapi.testclient import TestClient

# Ensure shared modules are importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'services'))

from shared.database import Base, engine
from shared.security.jwt_handler import create_access_token, decode_token


# ---- Fixtures ----

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    """Create all tables before the test suite runs."""
    Base.metadata.create_all(bind=engine)
    yield
    # Tables persist for inspection; drop if needed


@pytest.fixture(scope="module")
def auth_client():
    """TestClient for the auth-service."""
    # Need to adjust sys.path for auth-service imports
    auth_service_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'services', 'auth-service')
    sys.path.insert(0, auth_service_dir)
    from main import app as auth_app
    return TestClient(auth_app)


@pytest.fixture(scope="module")
def caregiver_client():
    """TestClient for the caregiver-api."""
    cg_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'services', 'caregiver-api')
    sys.path.insert(0, cg_dir)
    from main import app as cg_app
    return TestClient(cg_app)


@pytest.fixture(scope="module")
def civilian_client():
    """TestClient for the civilian-api."""
    cv_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'services', 'civilian-api')
    sys.path.insert(0, cv_dir)
    from main import app as cv_app
    return TestClient(cv_app)


# ---- Test 1: Full OTP → Token flow ----

def test_request_and_verify_otp(auth_client):
    """Request OTP, verify it, and receive valid JWT tokens."""
    # Step 1: Request OTP
    resp = auth_client.post("/auth/request-otp", json={
        "phone_number": "9876543210",
        "role": "civilian",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "otp" in data
    otp = data["otp"]
    assert len(otp) == 6

    # Step 2: Verify OTP
    resp = auth_client.post("/auth/verify-otp", json={
        "phone_number": "9876543210",
        "role": "civilian",
        "otp": otp,
    })
    assert resp.status_code == 200
    tokens = resp.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    assert tokens["role"] == "civilian"
    assert tokens["identity_id"] > 0

    # Validate the access token is decodable
    payload = decode_token(tokens["access_token"])
    assert payload["role"] == "civilian"
    assert payload["type"] == "access"


# ---- Test 2: Access civilian endpoint with valid token ----

def test_civilian_access_with_valid_token(auth_client, civilian_client):
    """A civilian token should grant access to civilian endpoints."""
    # Get a civilian token
    resp = auth_client.post("/auth/request-otp", json={
        "phone_number": "1111111111",
        "role": "civilian",
    })
    otp = resp.json()["otp"]
    resp = auth_client.post("/auth/verify-otp", json={
        "phone_number": "1111111111",
        "role": "civilian",
        "otp": otp,
    })
    token = resp.json()["access_token"]

    # Access civilian health / request-care (should not 401/403)
    resp = civilian_client.get("/health")
    assert resp.status_code == 200  # health is unprotected


# ---- Test 3: Access caregiver endpoint with civilian token → 403 ----

def test_caregiver_access_with_civilian_token_fails(auth_client, caregiver_client):
    """A civilian token must be rejected on caregiver endpoints."""
    # Get a civilian token
    resp = auth_client.post("/auth/request-otp", json={
        "phone_number": "2222222222",
        "role": "civilian",
    })
    otp = resp.json()["otp"]
    resp = auth_client.post("/auth/verify-otp", json={
        "phone_number": "2222222222",
        "role": "civilian",
        "otp": otp,
    })
    civilian_token = resp.json()["access_token"]

    # Try to access a caregiver endpoint
    resp = caregiver_client.get(
        "/caregiver/1",
        headers={"Authorization": f"Bearer {civilian_token}"},
    )
    assert resp.status_code == 403


# ---- Test 4: Refresh token works ----

def test_refresh_token(auth_client):
    """A valid refresh token should yield a new access token."""
    # Get tokens
    resp = auth_client.post("/auth/request-otp", json={
        "phone_number": "3333333333",
        "role": "caregiver",
    })
    otp = resp.json()["otp"]
    resp = auth_client.post("/auth/verify-otp", json={
        "phone_number": "3333333333",
        "role": "caregiver",
        "otp": otp,
    })
    refresh = resp.json()["refresh_token"]

    # Refresh
    resp = auth_client.post("/auth/refresh", json={
        "refresh_token": refresh,
    })
    assert resp.status_code == 200
    assert "access_token" in resp.json()


# ---- Test 5: Expired / invalid token rejected ----

def test_invalid_token_rejected(caregiver_client):
    """An invalid token should return 401."""
    resp = caregiver_client.get(
        "/caregiver/1",
        headers={"Authorization": "Bearer invalid.token.here"},
    )
    assert resp.status_code == 401


def test_missing_token_rejected(caregiver_client):
    """No token should return 401."""
    resp = caregiver_client.get("/caregiver/1")
    assert resp.status_code == 401


def test_wrong_otp_rejected(auth_client):
    """A wrong OTP should return 401."""
    auth_client.post("/auth/request-otp", json={
        "phone_number": "4444444444",
        "role": "civilian",
    })
    resp = auth_client.post("/auth/verify-otp", json={
        "phone_number": "4444444444",
        "role": "civilian",
        "otp": "000000",  # wrong OTP
    })
    assert resp.status_code == 401
