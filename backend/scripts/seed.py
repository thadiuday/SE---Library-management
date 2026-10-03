import os
import sys

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import SessionLocal, engine, Base
from app.models import models
from app.core.security import get_password_hash

def seed_database():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if admin already exists
    admin = db.query(models.User).filter(models.User.email == "admin@library.com").first()
    
    if not admin:
        print("Creating admin user...")
        admin = models.User(
            email="admin@library.com",
            password_hash=get_password_hash("admin123"),
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()
        print("Admin user created (admin@library.com / admin123)")
    # Check if student demo already exists
    student = db.query(models.User).filter(models.User.email == "student@library.com").first()
    if not student:
        print("Creating demo student user...")
        student_user = models.User(
            email="student@library.com",
            password_hash=get_password_hash("student123"),
            role="student",
            is_active=True
        )
        db.add(student_user)
        db.flush()

        member = models.Member(
            user_id=student_user.id,
            name="Alex Rivera",
            email="student@library.com",
            student_id="STU-2024-001",
            department="Computer Science",
            year=3,
            phone="+1 (555) 019-4482",
            status="active"
        )
        db.add(member)
        db.commit()
        print("Demo student user created (student@library.com / student123)")
    else:
        print("Demo student user already exists")
        
    db.close()
    print("Seed completed!")

if __name__ == "__main__":
    seed_database()
