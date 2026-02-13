"""
Booking model.

This module defines the Booking entity which represents care service
appointments between caregivers and civilians.

Table Purpose:
    Stores booking information including scheduling, status tracking,
    and relationships between caregivers and civilians.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..database import Base


class BookingStatus(str, enum.Enum):
    """
    Enumeration of possible booking statuses.

    Full lifecycle:
        PENDING → MATCHED → CONFIRMED → IN_PROGRESS → COMPLETED → RATED → CLOSED
        Any state → CANCELLED
    """
    PENDING = "pending"
    MATCHED = "matched"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    PAUSED = "paused"
    COMPLETED = "completed"
    RATED = "rated"
    CLOSED = "closed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"


class Booking(Base):
    """
    Booking model representing care service appointments.

    Attributes:
        id (int): Primary key
        caregiver_id (int): FK to caregivers
        civilian_id (int): FK to civilians
        start_time (datetime): Scheduled start
        end_time (datetime): Scheduled end
        status (str): Current workflow state
        started_at (datetime): Actual job start timestamp
        ended_at (datetime): Actual job end timestamp
        payment_status (str): Payment state (unpaid/reserved/paid)
    """

    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)

    caregiver_id = Column(Integer, ForeignKey("caregivers.id"), nullable=False, index=True)
    civilian_id = Column(Integer, ForeignKey("civilians.id"), nullable=False, index=True)

    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)

    status = Column(String(20), nullable=False, default="pending")

    # Job lifecycle timestamps
    started_at = Column(DateTime, nullable=True)
    ended_at = Column(DateTime, nullable=True)

    # Payment tracking
    payment_status = Column(String(20), nullable=False, default="unpaid")

    # Relationships
    caregiver = relationship("Caregiver", back_populates="bookings")
    civilian = relationship("Civilian", back_populates="bookings")

    __table_args__ = (
        Index('idx_caregiver_time', 'caregiver_id', 'start_time', 'end_time'),
        CheckConstraint('start_time < end_time', name='check_valid_time_range'),
    )

    def overlaps_with(self, other_start, other_end):
        """Check if this booking overlaps with another time range."""
        return not (other_end <= self.start_time or other_start >= self.end_time)

    def __repr__(self):
        return (
            f"<Booking(id={self.id}, caregiver={self.caregiver_id}, "
            f"civilian={self.civilian_id}, status={self.status})>"
        )
