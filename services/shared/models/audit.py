"""
Audit log model and helper.

Logs critical actions across all services for traceability.
"""

from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from ..database import Base, SessionLocal


class AuditLog(Base):
    """
    Immutable audit trail for platform actions.

    Attributes:
        id:         Auto-incrementing PK
        user_id:    AuthIdentity id of the actor (0 for system)
        action:     Short verb (login, booking_created, rating_submitted, …)
        entity:     Table / resource name (booking, caregiver, …)
        entity_id:  PK of the affected row
        detail:     Optional free-text detail
        timestamp:  When the action happened
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, default=0)
    action = Column(String(100), nullable=False, index=True)
    entity = Column(String(100), nullable=False)
    entity_id = Column(Integer, nullable=True)
    detail = Column(Text, nullable=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)


def log_audit(
    user_id: int,
    action: str,
    entity: str,
    entity_id: int = None,
    detail: str = None,
) -> None:
    """
    Write an audit row.  Safe to call from anywhere — opens and
    closes its own session so it never interferes with the caller's
    transaction.
    """
    db = SessionLocal()
    try:
        db.add(AuditLog(
            user_id=user_id,
            action=action,
            entity=entity,
            entity_id=entity_id,
            detail=detail,
        ))
        db.commit()
    except Exception:
        db.rollback()
    finally:
        db.close()
