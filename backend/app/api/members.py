from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
import math

from app.database.database import get_db
from app.models import models
from app.schemas import schemas
from app.core import security

router = APIRouter()

@router.get("", response_model=schemas.PaginatedResponse)
def get_members(
    search: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    query = db.query(models.Member)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Member.name.ilike(search_term),
                models.Member.email.ilike(search_term),
                models.Member.student_id.ilike(search_term)
            )
        )
        
    if status_filter:
        query = query.filter(models.Member.status == status_filter)
        
    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    
    offset = (page - 1) * page_size
    members = query.order_by(models.Member.name).offset(offset).limit(page_size).all()
    
    items = [schemas.MemberResponse.model_validate(member) for member in members]
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/{member_id}", response_model=schemas.MemberResponse)
def get_member(
    member_id: int, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

@router.post("", response_model=schemas.MemberResponse, status_code=status.HTTP_201_CREATED)
def create_member(
    member: schemas.MemberCreate, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    # Check if user email already exists
    if db.query(models.User).filter(models.User.email == member.email).first():
        raise HTTPException(status_code=409, detail="A user with this email already exists")
        
    # Check if student_id already exists
    if db.query(models.Member).filter(models.Member.student_id == member.student_id).first():
        raise HTTPException(status_code=409, detail="A member with this student ID already exists")
        
    # 1. Create User account first
    new_user = models.User(
        email=member.email,
        password_hash=security.get_password_hash(member.password),
        role="student",
        is_active=True
    )
    db.add(new_user)
    db.flush() # Get user ID without committing
    
    # 2. Create Member profile
    member_data = member.model_dump(exclude={"password"})
    new_member = models.Member(
        **member_data,
        user_id=new_user.id
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    
    return new_member

@router.put("/{member_id}", response_model=schemas.MemberResponse)
def update_member(
    member_id: int, 
    member_update: schemas.MemberUpdate, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    db_member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    update_data = member_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(db_member, key, value)
        
    db.commit()
    db.refresh(db_member)
    return db_member

@router.patch("/{member_id}/status", response_model=schemas.MemberResponse)
def update_member_status(
    member_id: int, 
    status_update: dict, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    status_val = status_update.get("status")
    if status_val not in ["active", "inactive"]:
        raise HTTPException(status_code=400, detail="Invalid status value")
        
    db_member = db.query(models.Member).filter(models.Member.id == member_id).first()
    if not db_member:
        raise HTTPException(status_code=404, detail="Member not found")
        
    db_member.status = status_val
    
    # Also update user active status
    db_user = db.query(models.User).filter(models.User.id == db_member.user_id).first()
    if db_user:
        db_user.is_active = (status_val == "active")
        
    db.commit()
    db.refresh(db_member)
    return db_member
