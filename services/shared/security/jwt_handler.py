"""
JWT token creation and verification utilities.

Uses python-jose with HS256 signing. Reads SECRET_KEY from the shared
Config so every microservice uses the same signing key.

Token types
-----------
access  – short-lived (15 min), carries identity_id + role.
refresh – long-lived (7 days), carries identity_id only.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any

from jose import jwt, JWTError

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from shared.config import Config

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7


def create_access_token(identity_id: int, role: str, session_id: str) -> str:
    """
    Create a short-lived access token.

    Claims:
        sub        – identity id (str)
        role       – user role
        session_id – unique session identifier
        type       – "access"
        exp        – 15 minutes from now
    """
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(identity_id),
        "role": role,
        "session_id": session_id,
        "type": "access",
        "exp": expire,
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(identity_id: int) -> str:
    """
    Create a long-lived refresh token (no role claim).

    Claims:
        sub  – identity id (str)
        type – "refresh"
        exp  – 7 days from now
    """
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(identity_id),
        "type": "refresh",
        "exp": expire,
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT token.

    Returns:
        dict with keys: sub, role (access only), type, exp

    Raises:
        JWTError – on invalid / expired token
    """
    return jwt.decode(token, Config.SECRET_KEY, algorithms=[ALGORITHM])
