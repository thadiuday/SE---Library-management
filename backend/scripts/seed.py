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
    else:
        print("Admin user already exists")
        
    db.close()
    print("Seed completed!")

if __name__ == "__main__":
    seed_database()
