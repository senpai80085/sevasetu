"""
Mock payment gateway.

Simulates payment operations for the demo.  Replace with Razorpay /
Stripe integration in production.

Payment states:  UNPAID → RESERVED → PAID
"""

from fastapi import HTTPException, status


_VALID_TRANSITIONS = {
    "unpaid":   {"reserved"},
    "reserved": {"paid", "unpaid"},  # refund goes back to unpaid
    "paid":     set(),               # terminal
}


def transition_payment(booking, target: str) -> None:
    """
    Move ``booking.payment_status`` to *target*.

    Raises HTTP 409 on illegal transition.
    """
    current = booking.payment_status or "unpaid"
    allowed = _VALID_TRANSITIONS.get(current, set())

    if target not in allowed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot move payment from '{current}' to '{target}'",
        )
    booking.payment_status = target


def reserve_payment(booking) -> dict:
    """Reserve payment when booking is confirmed."""
    transition_payment(booking, "reserved")
    return {
        "payment_id": f"PAY-{booking.id:06d}",
        "status": "reserved",
        "message": "Payment reserved (mock)",
    }


def capture_payment(booking) -> dict:
    """Capture reserved payment when job starts."""
    transition_payment(booking, "paid")
    return {
        "payment_id": f"PAY-{booking.id:06d}",
        "status": "paid",
        "message": "Payment captured (mock)",
    }
