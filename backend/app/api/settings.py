from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models import models
from app.schemas import schemas
from app.core import security
from app.core.config import settings as app_settings
from datetime import datetime

router = APIRouter()

DEFAULT_SETTINGS = {
    "fine_per_day": str(app_settings.FINE_PER_DAY),
    "max_borrow_limit": str(app_settings.MAX_BORROW_LIMIT),
    "loan_period_days": str(app_settings.LOAN_PERIOD_DAYS),
    "library_name": "Central Campus Library",
    "contact_email": "library@campus.edu",
    "contact_phone": "+1 (555) 019-2834",
    "operating_hours": "Mon-Fri: 8:00 AM - 8:00 PM, Sat: 9:00 AM - 4:00 PM"
}

def get_current_settings_dict(db: Session) -> dict:
    rows = db.query(models.SystemSetting).all()
    saved = {row.key: row.value for row in rows}
    
    return {
        "fine_per_day": float(saved.get("fine_per_day", DEFAULT_SETTINGS["fine_per_day"])),
        "max_borrow_limit": int(saved.get("max_borrow_limit", DEFAULT_SETTINGS["max_borrow_limit"])),
        "loan_period_days": int(saved.get("loan_period_days", DEFAULT_SETTINGS["loan_period_days"])),
        "library_name": saved.get("library_name", DEFAULT_SETTINGS["library_name"]),
        "contact_email": saved.get("contact_email", DEFAULT_SETTINGS["contact_email"]),
        "contact_phone": saved.get("contact_phone", DEFAULT_SETTINGS["contact_phone"]),
        "operating_hours": saved.get("operating_hours", DEFAULT_SETTINGS["operating_hours"]),
    }

@router.get("", response_model=schemas.LibrarySettings)
def get_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    return get_current_settings_dict(db)

@router.put("", response_model=schemas.LibrarySettings)
def update_settings(
    payload: schemas.LibrarySettings,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    update_data = payload.model_dump()
    for key, val in update_data.items():
        str_val = str(val) if val is not None else ""
        existing = db.query(models.SystemSetting).filter(models.SystemSetting.key == key).first()
        if existing:
            existing.value = str_val
        else:
            db.add(models.SystemSetting(key=key, value=str_val))
            
    db.commit()
    return get_current_settings_dict(db)

@router.post("/reset-defaults", response_model=schemas.LibrarySettings)
def reset_default_settings(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    for key, val in DEFAULT_SETTINGS.items():
        existing = db.query(models.SystemSetting).filter(models.SystemSetting.key == key).first()
        if existing:
            existing.value = val
        else:
            db.add(models.SystemSetting(key=key, value=val))
    db.commit()
    return get_current_settings_dict(db)

@router.get("/system-info")
def get_system_info(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    books_count = db.query(models.Book).count()
    categories_count = db.query(models.Category).count()
    members_count = db.query(models.Member).count()
    active_borrows = db.query(models.BorrowTransaction).filter(models.BorrowTransaction.status == "issued").count()
    total_fines = db.query(models.Fine).count()
    
    return {
        "project_name": app_settings.PROJECT_NAME,
        "version": app_settings.VERSION,
        "database_type": "SQLite 3",
        "api_prefix": app_settings.API_V1_STR,
        "server_time": datetime.utcnow().isoformat() + "Z",
        "counts": {
            "books": books_count,
            "categories": categories_count,
            "members": members_count,
            "active_borrows": active_borrows,
            "fines": total_fines
        }
    }
