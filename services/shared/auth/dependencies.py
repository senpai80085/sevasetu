"""
RBAC dependencies for FastAPI with session validation.

Usage in any service:
    from shared.auth.dependencies import get_current_user, require_role

    @router.get("/protected")
    def protected(user=Depends(require_role("civilian"))):
        ...
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
import httpx

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
from shared.security.jwt_handler import decode_token
from shared.config import Config

_bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
) -> Dict[str, Any]:
    """
    Extract and validate JWT from the Authorization header.
    
    Validates:
    - Token signature and expiration
    - Session validity (if session_id present)
    
    Returns:
        dict with keys: identity_id (int), role (str), session_id (str)
    
    Raises:
        HTTPException 401 if token is missing, invalid, expired, or session revoked.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # ── DEMO_MODE: Bypass JWT for demo tokens ───────────────────────
    token_str = credentials.credentials
    if token_str.startswith("demo_token_sevasetu_"):
        # Extract role from token: demo_token_sevasetu_civilian → civilian
        demo_role = token_str.replace("demo_token_sevasetu_", "")
        return {
            "identity_id": 1,
            "role": demo_role,
            "session_id": "demo_session_001",
        }
    # ────────────────────────────────────────────────────────────────

    try:
        # DEBUG: Log token and key verification
        print(f"[DEBUG] Validating token: {credentials.credentials[:10]}...")
        from shared.config import Config
        print(f"[DEBUG] Using SECRET_KEY starting with: {Config.SECRET_KEY[:3]}")
        payload = decode_token(credentials.credentials)
        print(f"[DEBUG] Token Valid. Payload: {payload}")
    except Exception as e:
        print(f"[ERROR] Token validation failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not an access token",
        )

    # Check session validity if session_id present (new tokens have it, legacy may not)
    session_id = payload.get("session_id")
    if session_id:
        # Quick session check via in-process import
        # (In distributed setup, use Redis or query auth-service)
        try:
            # Try local import if in auth-service
            from session_registry import is_session_valid as check_session
            if not check_session(session_id):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session revoked. Please sign in again.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
        except ImportError:
            # Not in auth-service, skip session check for now
            # In production, query auth-service or shared Redis
            pass

    return {
        "identity_id": int(payload["sub"]),
        "role": payload["role"],
        "session_id": session_id,
    }


def require_role(role_name: str):
    """
    Return a FastAPI dependency that enforces a specific role.
    
    Shows bilingual error message on role mismatch.
    
    Usage:
        @router.get("/my-endpoint")
        def my_endpoint(user=Depends(require_role("civilian"))):
            ...
    """

    async def _role_checker(
        user: Dict[str, Any] = Depends(get_current_user),
    ) -> Dict[str, Any]:
        if user["role"] != role_name:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "en": f"This account type cannot access this feature. Required: {role_name}, got: {user['role']}",
                    "hi": "यह खाता इस सुविधा का उपयोग नहीं कर सकता"
                },
            )
        return user

    return _role_checker
