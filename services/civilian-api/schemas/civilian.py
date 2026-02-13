"""
Civilian API schemas.

This module defines Pydantic models for request validation and
response serialization in the civilian API.
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class CareRequestRequest(BaseModel):
    """
    Request schema for requesting care service.
    
    Attributes:
        civilian_id: Civilian ID
        required_skills: List of required skills
        start_time: Desired start time
        end_time: Desired end time
        location: Service location (for distance calculation)
    """
    civilian_id: int = Field(..., gt=0)
    required_skills: List[str] = Field(..., min_items=1)
    start_time: datetime
    end_time: datetime
    location: Optional[str] = None


class CaregiverMatchResponse(BaseModel):
    """
    Response schema for matched caregiver.
    
    Attributes:
        caregiver_id: Caregiver ID
        name: Caregiver name
        skills: List of skills
        experience_years: Years of experience
        rating_average: Average rating
        trust_score: Trust score
        match_score: AI-computed match score
    """
    caregiver_id: int
    name: str
    skills: List[str]
    experience_years: int
    rating_average: float
    trust_score: float
    match_score: float
    ai_confidence: float
    ai_reason: str


class MatchCaregiversResponse(BaseModel):
    """
    Response schema for caregiver matching.
    
    Attributes:
        caregivers: Top matched caregivers (sorted by match score)
    """
    caregivers: List[CaregiverMatchResponse]


class ConfirmBookingRequest(BaseModel):
    """
    Request schema for confirming a booking.
    
    Attributes:
        civilian_id: Civilian ID
        caregiver_id: Selected caregiver ID
        start_time: Booking start time
        end_time: Booking end time
    """
    civilian_id: int = Field(..., gt=0)
    caregiver_id: int = Field(..., gt=0)
    start_time: datetime
    end_time: datetime


class BookingResponse(BaseModel):
    """
    Response schema for booking confirmation.
    
    Attributes:
        booking_id: Created booking ID
        caregiver_id: Assigned caregiver ID
        civilian_id: Civilian ID
        start_time: Booking start time
        end_time: Booking end time
        status: Booking status
    """
    booking_id: int
    caregiver_id: int
    civilian_id: int
    start_time: datetime
    end_time: datetime
    status: str


class SubmitRatingRequest(BaseModel):
    """
    Request schema for submitting caregiver rating.
    
    Attributes:
        caregiver_id: Caregiver ID being rated
        rating: Numeric rating (1.0-5.0)
        review_text: Optional text review
    """
    caregiver_id: int = Field(..., gt=0)
    rating: float = Field(..., ge=1.0, le=5.0)
    review_text: Optional[str] = None


class RatingResponse(BaseModel):
    """
    Response schema for rating submission.
    
    Attributes:
        rating_id: Created rating ID
        caregiver_id: Rated caregiver ID
        rating: Submitted rating
        message: Success message
    """
    rating_id: int
    caregiver_id: int
    rating: float
    message: str


class CivilianUpdateRequest(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    # Add other fields if needed


class SafetySessionResponse(BaseModel):
    session_id: str
    stream_url: str
