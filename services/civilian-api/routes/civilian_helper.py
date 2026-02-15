from sqlalchemy.orm import Session
from shared.models import Caregiver, AuthIdentity

def _ensure_broadcast_caregiver(db: Session):
    """Ensure caregiver_id=0 exists for broadcast."""
    # 1. Ensure Identity exists (FK constraint)
    identity = db.query(AuthIdentity).filter(AuthIdentity.id == 0).first()
    if not identity:
        identity = AuthIdentity(
            id=0,
            phone_number="0000000000",
            role="caregiver",
            is_verified=True
        )
        db.add(identity)
        db.commit()

    # 2. Ensure Caregiver exists
    cg = db.query(Caregiver).filter(Caregiver.id == 0).first()
    if not cg:
        cg = Caregiver(
            id=0,
            identity_id=0,
            name="Broadcast",
            hashed_identity="broadcast",
            skills=[],
            experience_years=0,
            rating_average=5.0,
            verified=True
        )
        db.add(cg)
        db.commit()
