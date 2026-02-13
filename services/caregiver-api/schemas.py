from pydantic import BaseModel
from typing import List, Optional

class CaregiverRegisterRequest(BaseModel):
    hashed_identity: str
    name: str
    gender: str
    skills: List[str]
    experience_years: int

class CaregiverUpdateRequest(BaseModel):
    name: Optional[str] = None
    gender: Optional[str] = None
    skills: Optional[List[str]] = None
    experience_years: Optional[int] = None

class CaregiverResponse(BaseModel):
    id: int
    name: str
    trust_score: float
    rating_average: float
    verified: bool
    skills: List[str] = []
    experience_years: int = 0

class AvailabilityRequest(BaseModel):
    caregiver_id: int
    available: bool

class JobResponse(BaseModel):
    id: int
    civilian_id: int
    civilian_name: str
    start_time: str
    end_time: str
    status: str

class BookingStatusUpdateRequest(BaseModel):
    status: str
