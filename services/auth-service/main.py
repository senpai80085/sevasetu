"""
Auth-service – Role-specific OTP-based passwordless authentication for SevaSetu.

Runs on port 8006.
Role-specific endpoints:
    POST /auth/civilian/login    – Request OTP for civilian
    POST /auth/caregiver/login   – Request OTP for caregiver
    POST /auth/guardian/login    – Request OTP for guardian
    POST /auth/verify-otp         – Verify OTP and issue tokens
    POST /auth/refresh            – Refresh access token
    POST /auth/logout             – Server-side session revocation
"""

from fastapi import FastAPI, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import sys, os

# Add services directory to path for shared imports
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from shared.config import Config
from shared.database import SessionLocal, Base, engine
from shared.models import AuthIdentity, Civilian, Caregiver
from shared.security.jwt_handler import (
    create_access_token,
    create_refresh_token,
    decode_token,
)
from otp_store import generate_otp, verify_otp
from session_registry import create_session, revoke_session, is_session_valid

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SevaSetu Auth Service",
    description="Role-specific OTP-based authentication with session management",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=Config.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_ROLES = {"civilian", "caregiver", "guardian", "admin"}


# --------------- Pydantic schemas ---------------

class LoginRequestSchema(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=15)

class OTPVerifySchema(BaseModel):
    phone_number: str = Field(..., min_length=10, max_length=15)
    role: str
    otp: str = Field(..., min_length=6, max_length=6)

class RefreshSchema(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    identity_id: int
    session_id: str


# --------------- Helper Functions ---------------

def get_or_create_identity_profile(db, phone_number: str, role: str) -> AuthIdentity:
    """Find or create AuthIdentity and associated profile."""
    # Find or create identity
    identity = (
        db.query(AuthIdentity)
        .filter(
            AuthIdentity.phone_number == phone_number,
            AuthIdentity.role == role,
        )
        .first()
    )

    if identity is None:
        identity = AuthIdentity(
            phone_number=phone_number,
            role=role,
            is_verified=True,
        )
        db.add(identity)
        db.commit()
        db.refresh(identity)

        # Auto-create profile for civilian / caregiver
        if role == "civilian":
            profile = Civilian(
                identity_id=identity.id,
                name=f"User {phone_number[-4:]}",
                guardian_contact="",
            )
            db.add(profile)
            db.commit()
        elif role == "caregiver":
            import hashlib
            hashed = hashlib.sha256(phone_number.encode()).hexdigest()
            profile = Caregiver(
                identity_id=identity.id,
                hashed_identity=hashed,
                name=f"Caregiver {phone_number[-4:]}",
                skills=[],
                experience_years=0,
            )
            db.add(profile)
            db.commit()
    else:
        if not identity.is_verified:
            identity.is_verified = True
            db.commit()

    return identity


# --------------- Role-Specific Login Endpoints ---------------

@app.post("/auth/civilian/login")
def civilian_login(body: LoginRequestSchema):
    """
    Request OTP for civilian role.
    OTP is tied to phone + civilian role.
    """
    otp_code = generate_otp(body.phone_number, "civilian")
    return {
        "message": "OTP sent successfully",
        "phone_number": body.phone_number,
        "role": "civilian",
        "otp": otp_code,  # DEV ONLY – remove in production
    }


@app.post("/auth/caregiver/login")
def caregiver_login(body: LoginRequestSchema):
    """
    Request OTP for caregiver role.
    OTP is tied to phone + caregiver role.
    """
    otp_code = generate_otp(body.phone_number, "caregiver")
    return {
        "message": "OTP sent successfully",
        "phone_number": body.phone_number,
        "role": "caregiver",
        "otp": otp_code,  # DEV ONLY – remove in production
    }


@app.post("/auth/guardian/login")
def guardian_login(body: LoginRequestSchema):
    """
    Request OTP for guardian role.
    OTP is tied to phone + guardian role.
    """
    otp_code = generate_otp(body.phone_number, "guardian")
    return {
        "message": "OTP sent successfully",
        "phone_number": body.phone_number,
        "role": "guardian",
        "otp": otp_code,  # DEV ONLY – remove in production
    }


# --------------- Verification & Token Issuance ---------------

@app.post("/auth/verify-otp", response_model=TokenResponse)
def verify_otp_endpoint(body: OTPVerifySchema):
    """
    Verify OTP and issue JWT tokens with session tracking.

    Role must match the OTP request. On successful verification:
    - Creates/finds AuthIdentity
    - Creates server-side session
    - Issues access + refresh tokens with session_id
    """
    if body.role not in VALID_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of {VALID_ROLES}")

    # Verify OTP with role check
    if not verify_otp(body.phone_number, body.role, body.otp):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired OTP, or role mismatch",
        )

    try:
        db = SessionLocal()
        try:
            print(f"[DEBUG] Getting/Creating identity for {body.phone_number} ({body.role})")
            identity = get_or_create_identity_profile(db, body.phone_number, body.role)
            print(f"[DEBUG] Identity ID: {identity.id}")

            # Create server-side session
            session_id = create_session(identity.id, identity.role)
            print(f"[DEBUG] Session Created: {session_id}")

            # Issue tokens with session_id
            access = create_access_token(identity.id, identity.role, session_id)
            refresh = create_refresh_token(identity.id)

            return TokenResponse(
                access_token=access,
                refresh_token=refresh,
                role=identity.role,
                identity_id=identity.id,
                session_id=session_id,
            )
        finally:
            db.close()
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[ERROR] verify_otp failed: {e}")
        # Explicitly return 500 with detail to ensure CORS headers (if middleware allows)
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")


# --------------- Token Refresh ---------------

@app.post("/auth/refresh")
def refresh_token(body: RefreshSchema):
    """Issue a new access token using a valid refresh token."""
    try:
        payload = decode_token(body.refresh_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=400, detail="Not a refresh token")

    identity_id = int(payload["sub"])

    # Look up current role and create new session
    db = SessionLocal()
    try:
        identity = db.query(AuthIdentity).filter(AuthIdentity.id == identity_id).first()
        if identity is None:
            raise HTTPException(status_code=404, detail="Identity not found")

        # Create new session for refreshed token
        session_id = create_session(identity.id, identity.role)
        new_access = create_access_token(identity.id, identity.role, session_id)

        return {
            "access_token": new_access,
            "token_type": "bearer",
            "session_id": session_id,
        }
    finally:
        db.close()


# --------------- Server-Side Logout ---------------

@app.post("/auth/logout")
def logout(authorization: Optional[str] = Header(None)):
    """
    Server-side session revocation.

    Extracts session_id from the access token and marks it as revoked.
    Client must also delete token from storage.
    """
    if not authorization or not authorization.startswith("Bearer "):
        return {"message": "No token provided, client-side logout only"}

    token = authorization.replace("Bearer ", "")

    try:
        payload = decode_token(token)
        session_id = payload.get("session_id")

        if session_id:
            revoke_session(session_id)
            return {
                "message": "Session revoked successfully",
                "message_hi": "सत्र समाप्त कर दिया गया है",
            }
        else:
            return {"message": "Legacy token (no session_id), client-side logout only"}

    except Exception:
        return {"message": "Invalid token, client-side logout only"}


@app.get("/health")
def health():
    return {"status": "healthy", "service": "auth-service", "version": "2.0.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8006)
