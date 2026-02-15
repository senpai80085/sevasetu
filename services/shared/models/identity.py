"""
AuthIdentity model.

Unified authentication identity table that links phone-number-based
login to civilian and caregiver profiles via a shared foreign key.

Every user who logs in gets an AuthIdentity row. Their role determines
which profile table (civilians / caregivers) they are linked to.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base


class AuthIdentity(Base):
    """
    Unified identity for all platform users.

    Attributes:
        id:            Primary key, referenced by civilian.identity_id
                       and caregiver.identity_id.
        phone_number:  Phone used for OTP login (unique per role).
        role:          One of 'civilian', 'caregiver', 'guardian', 'admin'.
        is_verified:   True after first successful OTP verification.
        created_at:    Row creation timestamp.
    """

    __tablename__ = "auth_identities"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # civilian | caregiver | guardian | admin
    is_verified = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Same phone can register as different roles, but not duplicate same role
    __table_args__ = (
        UniqueConstraint('phone_number', 'role', name='uq_phone_role'),
    )

    # Back-populate relationships (defined on the other side)
    civilian_profile = relationship("Civilian", back_populates="identity", uselist=False)
    caregiver_profile = relationship("Caregiver", back_populates="identity", uselist=False)

    def __repr__(self):
        return (
            f"<AuthIdentity(id={self.id}, phone='{self.phone_number}', "
            f"role='{self.role}', verified={self.is_verified})>"
        )
