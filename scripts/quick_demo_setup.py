"""
Standalone demo setup - no PostgreSQL required!
Uses SQLite for simplicity.
"""

import os
import sys

# Set SQLite as database BEFORE importing models
os.environ['DATABASE_URL'] = 'sqlite:///sevasetu_demo.db'

# Now import after setting env var
from pathlib import Path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / 'services'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Create SQLite engine
engine = create_engine('sqlite:///sevasetu_demo.db', echo=False)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# Import and create models
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Boolean, Enum as SQLEnum, Index, CheckConstraint
from datetime import datetime
import enum

class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class BlockchainStatus(str, enum.Enum):
    PENDING = "pending"
    SUBMITTED = "submitted"
    CONFIRMED = "confirmed"
    FAILED = "failed"

class Caregiver(Base):
    __tablename__ = "caregivers"
    id = Column(Integer, primary_key=True)
    hashed_identity = Column(String(256), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    gender = Column(String(20))
    skills = Column(Text)  # JSON string for SQLite
    experience_years = Column(Integer, default=0)
    rating_average = Column(Float, default=0.0)
    trust_score = Column(Float, default=0.0)
    verified = Column(Boolean, default=False)

class Civilian(Base):
    __tablename__ = "civilians"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    guardian_contact = Column(String(200))

class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True)
    caregiver_id = Column(Integer, nullable=False)
    civilian_id = Column(Integer, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(String(20), default="pending")

class Rating(Base):
    __tablename__ = "ratings"
    id = Column(Integer, primary_key=True)
    caregiver_hash = Column(String(256), nullable=False)
    caregiver_id = Column(Integer)
    rating = Column(Float, nullable=False)
    review_text = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    blockchain_status = Column(String(20), default="pending")
    blockchain_tx_hash = Column(String(256))

print("=== SevaSetu Demo Setup (SQLite) ===\n")

# Create all tables
print("Creating database tables...")
Base.metadata.create_all(engine)
print("✓ Tables created\n")

# Seed data
print("Seeding demo data...")
db = SessionLocal()

try:
    # Clear existing data
    db.query(Rating).delete()
    db.query(Booking).delete()
    db.query(Caregiver).delete()
    db.query(Civilian).delete()
    
    # Add caregivers
    import json
    caregivers = [
        Caregiver(
            hashed_identity="hash_sarah",
            name="Sarah Johnson",
            gender="Female",
            skills=json.dumps(["elderly care", "nursing", "mobility assistance"]),
            experience_years=5,
            rating_average=4.5,
            trust_score=85.0,
            verified=True
        ),
        Caregiver(
            hashed_identity="hash_michael",
            name="Michael Chen",
            gender="Male",
            skills=json.dumps(["elderly care", "physiotherapy", "dementia care"]),
            experience_years=8,
            rating_average=4.8,
            trust_score=92.0,
            verified=True
        ),
        Caregiver(
            hashed_identity="hash_priya",
            name="Priya Sharma",
            gender="Female",
            skills=json.dumps(["nursing", "medication management", "wound care"]),
            experience_years=3,
            rating_average=4.2,
            trust_score=75.0,
            verified=True
        )
    ]
    
    db.add_all(caregivers)
    db.commit()
    print(f"✓ Created {len(caregivers)} caregivers")
    
    # Add civilians
    civilians = [
        Civilian(name="John Smith", guardian_contact="john.guardian@demo.com"),
        Civilian(name="Mary Johnson", guardian_contact="mary.guardian@demo.com")
    ]
    
    db.add_all(civilians)
    db.commit()
    print(f"✓ Created {len(civilians)} civilians")
    
    # Add sample ratings
   ratings = [
        Rating(caregiver_hash="hash_sarah", caregiver_id=1, rating=5.0, review_text="Excellent care!"),
        Rating(caregiver_hash="hash_michael", caregiver_id=2, rating=5.0, review_text="Outstanding!"),
        Rating(caregiver_hash="hash_priya", caregiver_id=3, rating=4.0, review_text="Very good")
    ]
    
    db.add_all(ratings)
    db.commit()
    print(f"✓ Created {len(ratings)} ratings\n")
    
    print("✅ Demo database ready!\n")
    print("Demo Data Available:")
    print("  📋 Caregivers: 3 (Sarah, Michael, Priya)")
    print("  👤 Civilians: 2 (John, Mary)")
    print("  ⭐ Ratings: 3 sample reviews")
    print("\n🚀 Run the demo: python scripts\\run_demo.py")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
