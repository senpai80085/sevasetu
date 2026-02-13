"""
Caregiver model.

This module defines the Caregiver entity which represents care providers
in the SevaSetu platform. Caregivers offer their services to civilians
who need care.

Table Purpose:
    Stores caregiver profile information including identity hash,
    skills, experience, ratings, and trust score for matching and
    reputation tracking.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
import json
from ..database import Base


class Caregiver(Base):
    """
    Caregiver model representing care service providers.

    Linked to AuthIdentity via identity_id so that a phone-number login
    can resolve to a caregiver profile.

    Attributes:
        id (int): Primary key, auto-incrementing
        identity_id (int): FK to auth_identities – nullable for backward compat
        hashed_identity (str): Privacy-preserving hash of identity document
        name (str): Caregiver's display name
        gender (str): Gender
        skills (list): JSON-encoded list of skill tags
        experience_years (int): Years of professional caregiving experience
        rating_average (float): Average rating from all reviews (1.0-5.0)
        trust_score (float): Computed trust score from fraud detection engine
        verified (bool): Whether identity verification is complete
    """

    __tablename__ = "caregivers"

    id = Column(Integer, primary_key=True, index=True)

    # Link to unified auth identity (nullable so existing rows survive migration)
    identity_id = Column(Integer, ForeignKey("auth_identities.id"), nullable=True)

    hashed_identity = Column(String(256), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    gender = Column(String(50), nullable=True)

    # Skills stored as JSON text for SQLite compatibility
    _skills = Column("skills", Text, nullable=False, default="[]")
    experience_years = Column(Integer, nullable=False, default=0)

    rating_average = Column(Float, nullable=False, default=0.0)
    trust_score = Column(Float, nullable=False, default=0.0)
    verified = Column(Boolean, nullable=False, default=False)

    # Relationships
    identity = relationship("AuthIdentity", back_populates="caregiver_profile")
    bookings = relationship("Booking", back_populates="caregiver")
    ratings = relationship("Rating", back_populates="caregiver")

    @property
    def skills(self):
        """Get skills as a Python list."""
        if isinstance(self._skills, list):
            return self._skills
        try:
            return json.loads(self._skills) if self._skills else []
        except (json.JSONDecodeError, TypeError):
            return []

    @skills.setter
    def skills(self, value):
        """Set skills from a Python list."""
        if isinstance(value, list):
            self._skills = json.dumps(value)
        else:
            self._skills = value

    def __repr__(self):
        return f"<Caregiver(id={self.id}, name='{self.name}', trust_score={self.trust_score})>"
