"""
Civilian model.

This module defines the Civilian entity which represents individuals
or families who request caregiving services through the SevaSetu platform.

Table Purpose:
    Stores civilian profile information including identity and emergency
    contact details for care requestors.
"""

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class Civilian(Base):
    """
    Civilian model representing care service requestors.

    Linked to AuthIdentity via identity_id so that a phone-number login
    can resolve to a civilian profile.

    Attributes:
        id (int): Primary key, auto-incrementing
        identity_id (int): FK to auth_identities – nullable for backward compat
        name (str): Civilian's name or family identifier
        guardian_contact (str): Emergency contact phone/email for guardian
    """

    __tablename__ = "civilians"

    id = Column(Integer, primary_key=True, index=True)

    # Link to unified auth identity (nullable so existing rows survive migration)
    identity_id = Column(Integer, ForeignKey("auth_identities.id"), nullable=True)

    name = Column(String(100), nullable=False)
    guardian_contact = Column(String(200), nullable=False)

    # Relationships
    identity = relationship("AuthIdentity", back_populates="civilian_profile")
    bookings = relationship("Booking", back_populates="civilian")

    def __repr__(self):
        return f"<Civilian(id={self.id}, name='{self.name}')>"
