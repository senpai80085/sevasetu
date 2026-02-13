"""
Booking workflow state machine.

Defines legal transitions and provides a guard function that raises
on illegal moves.  Used by all endpoints that change booking status.

State diagram:
    PENDING → MATCHED → CONFIRMED → IN_PROGRESS → COMPLETED → RATED → CLOSED
    Any state → CANCELLED  (always allowed)
"""

from fastapi import HTTPException, status


# Legal state transitions  (current → set of allowed targets)
_TRANSITIONS: dict[str, set[str]] = {
    "pending":     {"matched", "cancelled"},
    "matched":     {"confirmed", "cancelled"},
    "confirmed":   {"in_progress", "cancelled"},
    "in_progress": {"completed", "paused", "cancelled"},
    "paused":      {"in_progress", "cancelled"},
    "completed":   {"rated", "cancelled"},
    "rated":       {"closed"},
    "closed":      set(),        # terminal
    "cancelled":   set(),        # terminal
}


def transition_booking(booking, target_state: str) -> None:
    """
    Attempt to move *booking* to *target_state*.

    Mutates ``booking.status`` in place on success.
    Raises HTTP 409 Conflict on an illegal transition.

    Args:
        booking:      SQLAlchemy Booking instance (must have `.status`)
        target_state: desired next state string

    Raises:
        HTTPException 409 if the transition is not allowed.
    """
    current = booking.status
    allowed = _TRANSITIONS.get(current, set())

    if target_state not in allowed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Cannot transition booking {booking.id} "
                f"from '{current}' to '{target_state}'. "
                f"Allowed targets: {sorted(allowed) or 'none (terminal state)'}"
            ),
        )

    booking.status = target_state


def get_allowed_transitions(current_state: str) -> list[str]:
    """Return the list of states reachable from *current_state*."""
    return sorted(_TRANSITIONS.get(current_state, set()))
