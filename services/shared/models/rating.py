"""
Rating model.

This module defines the Rating entity which stores caregiver performance
reviews submitted by civilians after completed bookings.

Table Purpose:
    Stores privacy-preserving ratings and reviews for caregivers.
    Uses caregiver hash instead of direct ID to enable blockchain
    integration while maintaining privacy.
"""

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from ..database import Base


class BlockchainStatus(str, enum.Enum):
    """Status of blockchain submission."""
    PENDING = "pending"
    SUBMITTED = "submitted"
    CONFIRMED = "confirmed"
    FAILED = "failed"


class Rating(Base):
    """
    Rating model representing caregiver performance reviews.
    
    This table stores civilian feedback on completed care services,
    including numeric ratings and text reviews. Uses caregiver_hash
    for blockchain compatibility and privacy.
    
    Blockchain submission is async - ratings are immediately visible
    but blockchain confirmation happens in background.
    
    Attributes:
        id (int): Primary key, auto-incrementing
        caregiver_hash (str): Privacy-preserving caregiver identifier
        rating (float): Numeric rating between 1.0 and 5.0
        review_text (str): Optional text review
        timestamp (datetime): When the rating was submitted
        blockchain_status (str): Status of blockchain submission
        blockchain_tx_hash (str): Transaction hash when submitted
    """
    
    __tablename__ = "ratings"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Caregiver identification (privacy-preserving)
    caregiver_hash = Column(String(256), nullable=False, index=True)
    
    # Rating data
    rating = Column(Float, nullable=False)
    review_text = Column(Text, nullable=True)
    
    # Timestamp
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Blockchain async submission tracking
    blockchain_status = Column(
        String(20),
        nullable=False,
        default="pending"
    )
    blockchain_tx_hash = Column(String(256), nullable=True)
    
    # Optional foreign key relationship (for internal use)
    caregiver_id = Column(Integer, ForeignKey("caregivers.id"), nullable=True)
    caregiver = relationship("Caregiver", back_populates="ratings")
    
    def __repr__(self):
        """String representation for debugging."""
        return (
            f"<Rating(id={self.id}, "
            f"caregiver_hash={self.caregiver_hash[:16]}..., "
            f"rating={self.rating}, "
            f"blockchain={self.blockchain_status})>"
        )
