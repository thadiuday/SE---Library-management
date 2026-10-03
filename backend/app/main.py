from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, books, categories, members, transactions, settings as settings_api
from app.database.database import Base, engine
from app.core.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

from app.database.database import SessionLocal
from app.models import models
from app.core.security import get_password_hash

def init_default_users():
    db = SessionLocal()
    try:
        admin = db.query(models.User).filter(models.User.email == "admin@library.com").first()
        if not admin:
            admin = models.User(
                email="admin@library.com",
                password_hash=get_password_hash("admin123"),
                role="admin",
                is_active=True
            )
            db.add(admin)
            db.commit()
            
        student = db.query(models.User).filter(models.User.email == "student@library.com").first()
        if not student:
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
    except Exception as e:
        print(f"User initialization check: {e}")
        db.rollback()
    finally:
        db.close()

init_default_users()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, configure specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(categories.router, prefix=f"{settings.API_V1_STR}/categories", tags=["categories"])
app.include_router(books.router, prefix=f"{settings.API_V1_STR}/books", tags=["books"])
app.include_router(members.router, prefix=f"{settings.API_V1_STR}/members", tags=["members"])
app.include_router(transactions.router, prefix=f"{settings.API_V1_STR}/transactions", tags=["transactions"])
app.include_router(settings_api.router, prefix=f"{settings.API_V1_STR}/settings", tags=["settings"])

@app.get("/")
def root():
    return {"message": "Welcome to Library Management System API"}
