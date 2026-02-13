"""
Server-side session registry with revocation support.

Tracks active user sessions by session_id. Allows server-side logout
by marking sessions as revoked.

NOT for production scale – use Redis or similar distributed cache.
"""

import threading
import uuid
from datetime import datetime
from typing import Optional, Dict, Any


_sessions: Dict[str, Dict[str, Any]] = {}
_lock = threading.Lock()


def create_session(identity_id: int, role: str) -> str:
    """
    Create a new session for the given identity and role.

    Returns:
        session_id (uuid string)
    """
    session_id = str(uuid.uuid4())
    with _lock:
        _sessions[session_id] = {
            "identity_id": identity_id,
            "role": role,
            "issued_at": datetime.utcnow(),
            "revoked": False,
        }
    return session_id


def is_session_valid(session_id: str, expected_role: str = None) -> bool:
    """
    Check if a session is valid (exists and not revoked).

    Args:
        session_id: Session identifier
        expected_role: If provided, also check role matches

    Returns:
        True if session is valid, False otherwise
    """
    with _lock:
        session = _sessions.get(session_id)
        if not session:
            return False
        if session.get("revoked"):
            return False
        if expected_role and session.get("role") != expected_role:
            return False
        return True


def revoke_session(session_id: str) -> bool:
    """
    Revoke a session (server-side logout).

    Returns:
        True if session was revoked, False if not found
    """
    with _lock:
        session = _sessions.get(session_id)
        if not session:
            return False
        session["revoked"] = True
        return True


def get_session_info(session_id: str) -> Optional[Dict[str, Any]]:
    """Get session information if it exists."""
    with _lock:
        return _sessions.get(session_id).copy() if session_id in _sessions else None
