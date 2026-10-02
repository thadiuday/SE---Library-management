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
def get_books(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    available: Optional[bool] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    query = db.query(models.Book)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Book.title.ilike(search_term),
                models.Book.author.ilike(search_term),
                models.Book.isbn.ilike(search_term)
            )
        )
        
    if category_id:
        query = query.filter(models.Book.category_id == category_id)
        
    if available is not None:
        if available:
            query = query.filter(models.Book.available_copies > 0)
        else:
            query = query.filter(models.Book.available_copies == 0)
            
    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    
    # Calculate offset
    offset = (page - 1) * page_size
    books = query.order_by(models.Book.title).offset(offset).limit(page_size).all()
    
    # Convert to schema explicitly if needed or let response_model handle it
    items = [schemas.BookResponse.model_validate(book) for book in books]
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/{book_id}", response_model=schemas.BookResponse)
def get_book(
    book_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(security.get_current_user)
):
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@router.post("", response_model=schemas.BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(
    book: schemas.BookCreate, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    # Check ISBN duplicate
    if db.query(models.Book).filter(models.Book.isbn == book.isbn).first():
        raise HTTPException(status_code=409, detail="A book with this ISBN already exists")
        
    # Check category
    if book.category_id and not db.query(models.Category).filter(models.Category.id == book.category_id).first():
        raise HTTPException(status_code=400, detail="Invalid category ID")
        
    new_book = models.Book(**book.model_dump())
    new_book.available_copies = new_book.total_copies # New books have all copies available
    
    db.add(new_book)
    db.commit()
    db.refresh(new_book)
    return new_book

@router.put("/{book_id}", response_model=schemas.BookResponse)
def update_book(
    book_id: int, 
    book_update: schemas.BookUpdate, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    update_data = book_update.model_dump(exclude_unset=True)
    
    if "isbn" in update_data and update_data["isbn"] != db_book.isbn:
        if db.query(models.Book).filter(models.Book.isbn == update_data["isbn"]).first():
            raise HTTPException(status_code=409, detail="A book with this ISBN already exists")
            
    if "category_id" in update_data and update_data["category_id"] is not None:
        if not db.query(models.Category).filter(models.Category.id == update_data["category_id"]).first():
            raise HTTPException(status_code=400, detail="Invalid category ID")
            
    if "total_copies" in update_data:
        # Calculate issued copies
        issued = db_book.total_copies - db_book.available_copies
        if update_data["total_copies"] < issued:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot reduce total copies below currently issued count ({issued})"
            )
        # Update available copies based on new total
        db_book.available_copies = update_data["total_copies"] - issued
        
    for key, value in update_data.items():
        if key != "available_copies": # We handled this manually if total_copies changed
            setattr(db_book, key, value)
            
    db.commit()
    db.refresh(db_book)
    return db_book

@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: int, 
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    db_book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    # Check for active borrows
    active_borrows = db.query(models.BorrowTransaction).filter(
        models.BorrowTransaction.book_id == book_id,
        models.BorrowTransaction.status == "issued"
    ).count()
    
    if active_borrows > 0:
        raise HTTPException(
            status_code=409, 
            detail="Cannot delete a book with active borrow transactions"
        )
        
    db.delete(db_book)
    db.commit()
    return None
