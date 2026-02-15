"""
Caregiver schemas package.
"""

from .caregiver import (
    CaregiverRegisterRequest,
    CaregiverUpdateRequest,
    CaregiverResponse,
    AvailabilityRequest,
    JobResponse,
    BookingStatusUpdateRequest,
)

__all__ = [
    "CaregiverRegisterRequest",
    "CaregiverUpdateRequest",
    "CaregiverResponse",
    "AvailabilityRequest",
    "JobResponse",
    "BookingStatusUpdateRequest",
]
