from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.database import get_db
from app.models import models
from app.schemas import schemas
from app.core import security

router = APIRouter()

@router.get("", response_model=List[schemas.CategoryResponse])
def get_categories(db: Session = Depends(get_db), current_user: models.User = Depends(security.get_current_user)):
    return db.query(models.Category).all()

@router.post("", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category: schemas.CategoryCreate, 
    db: Session = Depends(get_db), 
    current_admin: models.User = Depends(security.get_current_admin)
):
    db_category = db.query(models.Category).filter(models.Category.name == category.name).first()
    if db_category:
        raise HTTPException(status_code=409, detail="Category with this name already exists")
    
    new_category = models.Category(**category.model_dump())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category

@router.put("/{category_id}", response_model=schemas.CategoryResponse)
def update_category(
    category_id: int, 
    category: schemas.CategoryCreate, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    check_name = db.query(models.Category).filter(
        models.Category.name == category.name, 
        models.Category.id != category_id
    ).first()
    if check_name:
        raise HTTPException(status_code=409, detail="Category with this name already exists")
        
    for key, value in category.model_dump().items():
        setattr(db_category, key, value)
        
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    # Check if books exist in this category
    books_count = db.query(models.Book).filter(models.Book.category_id == category_id).count()
    if books_count > 0:
        raise HTTPException(status_code=409, detail="Cannot delete category containing books")
        
    db.delete(db_category)
    db.commit()
    return None
