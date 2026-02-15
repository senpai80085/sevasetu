"""
Caregiver API schemas.

This module defines Pydantic models for request validation and
response serialization in the caregiver API.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime


class CaregiverRegisterRequest(BaseModel):
    """
    Request schema for caregiver registration.

    Attributes:
        hashed_identity: Privacy-preserving identity hash
        name: Caregiver's display name
        gender: Gender (optional)
        skills: List of skill tags
        experience_years: Years of caregiving experience
    """
    hashed_identity: str = Field(..., min_length=32, max_length=256)
    name: str = Field(..., min_length=2, max_length=100)
    gender: Optional[str] = Field(None, max_length=50)
    skills: List[str] = Field(..., min_items=1)
    experience_years: int = Field(..., ge=0)

    @validator('skills')
    def validate_skills(cls, v):
        """Ensure all skills are non-empty strings."""
        if not all(skill.strip() for skill in v):
            raise ValueError("All skills must be non-empty strings")
        return [skill.strip().lower() for skill in v]


class CaregiverUpdateRequest(BaseModel):
    """Request schema for updating caregiver profile."""
    name: Optional[str] = None
    gender: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_years: Optional[int] = None


class CaregiverResponse(BaseModel):
    """
    Response schema for caregiver data.

    Attributes:
        id: Caregiver ID
        name: Caregiver's display name
        gender: Gender
        skills: List of skill tags
        experience_years: Years of experience
        rating_average: Average rating (1.0-5.0)
        trust_score: Computed trust score
        verified: Verification status
    """
    id: int
    name: str
    gender: Optional[str]
    skills: List[str]
    experience_years: int
    rating_average: float
    trust_score: float
    verified: bool

    class Config:
        """Pydantic configuration."""
        from_attributes = True


class AvailabilityRequest(BaseModel):
    """
    Request schema for updating caregiver availability.

    Attributes:
        caregiver_id: Caregiver ID
        available: Whether caregiver is currently available
    """
    caregiver_id: int = Field(..., gt=0)
    available: bool


class JobResponse(BaseModel):
    """
    Response schema for job/booking information.

    Attributes:
        id: Booking ID
        civilian_id: Client/civilian ID
        civilian_name: Client name
        start_time: Scheduled start time
        end_time: Scheduled end time
        status: Booking status
    """
    id: int
    civilian_id: int
    civilian_name: str
    start_time: datetime
    end_time: datetime
    status: str

    class Config:
        """Pydantic configuration."""
        from_attributes = True


class BookingStatusUpdateRequest(BaseModel):
    """Request schema for updating booking status (accept/reject)."""
    status: str
