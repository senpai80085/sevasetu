"""
In-memory OTP store with auto-expiry.

Generates 6-digit numeric OTPs, stores them with a 5-minute TTL,
and cleans up after successful verification. Thread-safe via a Lock.

NOT for production – use Redis or a database-backed store instead.
"""

import random
import threading
from datetime import datetime, timedelta
from typing import Optional, Tuple


_OTP_TTL_MINUTES = 5

# (phone_number, role) -> (otp_code, expiry_timestamp)
_store: dict[Tuple[str, str], Tuple[str, datetime]] = {}
_lock = threading.Lock()


def generate_otp(phone_number: str, role: str) -> str:
    """
    Generate and store a 6-digit OTP for *phone_number* tied to *role*.

    If there is an existing unexpired OTP for this phone+role it is overwritten.

    Args:
        phone_number: User's phone number
        role: Role for which OTP is being requested (civilian/caregiver/guardian)

    Returns:
        The 6-digit OTP string (e.g. "482917").
    """
    otp = f"{random.randint(100000, 999999)}"
    expiry = datetime.utcnow() + timedelta(minutes=_OTP_TTL_MINUTES)

    with _lock:
        _store[(phone_number, role)] = (otp, expiry)

    return otp


def verify_otp(phone_number: str, role: str, otp: str) -> bool:
    """
    Verify *otp* for *phone_number* with matching *role*.

    On success the entry is deleted so the same OTP cannot be reused.

    Args:
        phone_number: User's phone number
        role: Role that must match the OTP request
        otp: OTP code to verify

    Returns:
        True if the OTP matches, role matches, and has not expired, False otherwise.
    """
    with _lock:
        entry = _store.get((phone_number, role))
        if entry is None:
            return False

        stored_otp, expiry = entry

        if datetime.utcnow() > expiry:
            # Expired – clean up
            del _store[(phone_number, role)]
            return False

        if stored_otp != otp:
            return False

        # Valid – remove so it can't be reused
        del _store[(phone_number, role)]
        return True
