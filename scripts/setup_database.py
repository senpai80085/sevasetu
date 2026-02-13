"""
Database setup and initialization script.

Creates all tables and optionally seeds initial test data.
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'services'))

from shared.database import Base, engine, SessionLocal
from shared.models import Caregiver, Civilian, Booking, Rating


def create_tables():
    """Create all database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully")


def seed_test_data():
    """Seed initial test data for demo."""
    print("\nSeeding test data...")
    db = SessionLocal()
    
    try:
        # Create test caregivers
        caregivers = [
            Caregiver(
                hashed_identity="hash_caregiver_1",
                name="Sarah Johnson",
                gender="Female",
                skills=["elderly care", "nursing", "mobility assistance"],
                experience_years=5,
                rating_average=4.5,
                trust_score=85.0,
                verified=True
            ),
            Caregiver(
                hashed_identity="hash_caregiver_2",
                name="Michael Chen",
                gender="Male",
                skills=["elderly care", "physiotherapy", "dementia care"],
                experience_years=8,
                rating_average=4.8,
                trust_score=92.0,
                verified=True
            ),
            Caregiver(
                hashed_identity="hash_caregiver_3",
                name="Priya Sharma",
                gender="Female",
                skills=["nursing", "medication management", "wound care"],
                experience_years=3,
                rating_average=4.2,
                trust_score=75.0,
                verified=True
            ),
            Caregiver(
                hashed_identity="hash_caregiver_4",
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
        print(f"✓ Created {len(caregivers)} test caregivers")
        
        # Create test civilians
        civilians = [
            Civilian(
                name="John Smith",
                guardian_contact="guardian1@example.com"
            ),
            Civilian(
                name="Mary Johnson",
                guardian_contact="guardian2@example.com"
            ),
            Civilian(
                name="Robert Brown",
                guardian_contact="guardian3@example.com"
            )
        ]
        
        db.add_all(civilians)
        db.commit()
        print(f"✓ Created {len(civilians)} test civilians")
        
        # Create sample ratings
        ratings = [
            Rating(
                caregiver_hash="hash_caregiver_1",
                caregiver_id=1,
                rating=5.0,
                review_text="Excellent care, very professional",
                blockchain_status="pending"
            ),
            Rating(
                caregiver_hash="hash_caregiver_1",
                caregiver_id=1,
                rating=4.0,
                review_text="Good service",
                blockchain_status="pending"
            ),
            Rating(
                caregiver_hash="hash_caregiver_2",
                caregiver_id=2,
                rating=5.0,
                review_text="Outstanding caregiver",
                blockchain_status="pending"
            )
        ]
        
        db.add_all(ratings)
        db.commit()
        print(f"✓ Created {len(ratings)} sample ratings")
        
        print("\n✅ Database seeded successfully!")
        print("\nTest Caregiver IDs: 1, 2, 3, 4")
        print("Test Civilian IDs: 1, 2, 3")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding data: {e}")
        raise
    finally:
        db.close()


def reset_database():
    """Drop all tables and recreate."""
    print("⚠️  Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("✓ Tables dropped")
    create_tables()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Setup SevaSetu database")
    parser.add_argument('--seed', action='store_true', help='Seed test data')
    parser.add_argument('--reset', action='store_true', help='Reset database (WARNING: deletes all data)')
    
    args = parser.parse_args()
    
    if args.reset:
        confirm = input("⚠️  This will DELETE ALL DATA. Continue? (yes/no): ")
        if confirm.lower() == 'yes':
            reset_database()
            if args.seed:
                seed_test_data()
        else:
            print("Cancelled.")
    else:
        create_tables()
        if args.seed:
            seed_test_data()
