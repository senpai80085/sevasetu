"""
Initialize database with SQLite and seed demo data.
Run this before starting services!
"""

import sys
from pathlib import Path

# Add services to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root / 'services'))

from shared.database import Base, engine, SessionLocal
from shared.models import Caregiver, Civilian, Rating
from datetime import datetime
import json

print("\n🔧 Initializing SevaSetu Database...\n")

# Create all tables
print("Creating database tables...")
Base.metadata.create_all(bind=engine)
print("✅ Tables created successfully\n")

# Seed demo data
print("Seeding demo data...")
db = SessionLocal()

try:
    # Clear existing data
    db.query(Rating).delete()
    db.query(Caregiver).delete()
    db.query(Civilian).delete()
    db.commit()
    
    # Add caregivers
    caregivers = [
        Caregiver(
            hashed_identity="hash_sarah_johnson",
            name="Sarah Johnson",
            gender="Female",
            skills=["elderly care", "nursing", "mobility assistance"],
            experience_years=5,
            rating_average=4.5,
            trust_score=85.0,
            verified=True
        ),
        Caregiver(
            hashed_identity="hash_michael_chen",
            name="Michael Chen",
            gender="Male",
            skills=["elderly care", "physiotherapy", "dementia care"],
            experience_years=8,
            rating_average=4.8,
            trust_score=92.0,
            verified=True
        ),
        Caregiver(
            hashed_identity="hash_priya_sharma",
            name="Priya Sharma",
            gender="Female",
            skills=["nursing", "medication management", "wound care"],
            experience_years=3,
            rating_average=4.2,
            trust_score=75.0,
            verified=True
        ),
        Caregiver(
            hashed_identity="hash_david_williams",
            name="David Williams",
            gender="Male",
            skills=["mobility assistance", "companionship"],
            experience_years=2,
            rating_average=4.0,
            trust_score=65.0,
            verified=False
        )
    ]
    
    db.add_all(caregivers)
    db.commit()
    print(f"✅ Created {len(caregivers)} caregivers")
    
    # Add civilians
    civilians = [
        Civilian(name="John Smith", guardian_contact="john.guardian@demo.com"),
        Civilian(name="Mary Johnson", guardian_contact="mary.guardian@demo.com"),
        Civilian(name="Robert Brown", guardian_contact="robert.guardian@demo.com")
    ]
    
    db.add_all(civilians)
    db.commit()
    print(f"✅ Created {len(civilians)} civilians")
    
    # Add sample ratings
    ratings = [
        Rating(
            caregiver_hash="hash_sarah_johnson",
            caregiver_id=1,
            rating=5.0,
            review_text="Excellent care, very professional!",
            blockchain_status="pending"
        ),
        Rating(
            caregiver_hash="hash_sarah_johnson",
            caregiver_id=1,
            rating=4.0,
            review_text="Good service",
            blockchain_status="pending"
        ),
        Rating(
            caregiver_hash="hash_michael_chen",
            caregiver_id=2,
            rating=5.0,
            review_text="Outstanding caregiver!",
            blockchain_status="confirmed"
        ),
        Rating(
            caregiver_hash="hash_priya_sharma",
            caregiver_id=3,
            rating=4.5,
            review_text="Very knowledgeable",
            blockchain_status="pending"
        )
    ]
    
    db.add_all(ratings)
    db.commit()
    print(f"✅ Created {len(ratings)} ratings\n")
    
    print("=" * 60)
    print("✅ Database initialized successfully!")
    print("=" * 60)
    print("\n📊 Demo Data Summary:")
    print(f"  👨‍⚕️ Caregivers: {len(caregivers)}")
    print(f"  👤 Civilians: {len(civilians)}")
    print(f"  ⭐ Ratings: {len(ratings)}")
    print("\n🚀 Next step: Start services with start_all_services.ps1\n")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
    db.rollback()
finally:
    db.close()
