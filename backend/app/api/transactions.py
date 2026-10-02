from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
import math

from app.database.database import get_db
from app.models import models
from app.schemas import schemas
from app.core import security
from app.core.config import settings

router = APIRouter()

@router.get("", response_model=List[schemas.BorrowResponse])
def get_transactions(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    member_id: int = None,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    query = db.query(models.BorrowTransaction)
    if status:
        query = query.filter(models.BorrowTransaction.status == status)
    if member_id:
        query = query.filter(models.BorrowTransaction.member_id == member_id)
        
    transactions = query.order_by(models.BorrowTransaction.created_at.desc()).offset(skip).limit(limit).all()
    return transactions

@router.get("/fines", response_model=List[schemas.FineResponse])
def get_fines(
    status: str = None,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    query = db.query(models.Fine)
    if status:
        query = query.filter(models.Fine.status == status)
    
    return query.all()


def get_setting_int(db: Session, key: str, default: int) -> int:
    s = db.query(models.SystemSetting).filter(models.SystemSetting.key == key).first()
    if s and s.value:
        try:
            return int(s.value)
        except ValueError:
            pass
    return default

def get_setting_float(db: Session, key: str, default: float) -> float:
    s = db.query(models.SystemSetting).filter(models.SystemSetting.key == key).first()
    if s and s.value:
        try:
            return float(s.value)
        except ValueError:
            pass
    return default

@router.post("/issue", response_model=schemas.BorrowResponse, status_code=status.HTTP_201_CREATED)
def issue_book(
    borrow_in: schemas.BorrowCreate,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    # Check if member exists and is active
    member = db.query(models.Member).filter(models.Member.id == borrow_in.member_id).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    if member.status != "active":
        raise HTTPException(status_code=400, detail="Member is inactive")

    # Check if member reached borrow limit
    max_borrow_limit = get_setting_int(db, "max_borrow_limit", settings.MAX_BORROW_LIMIT)
    active_borrows = db.query(models.BorrowTransaction).filter(
        models.BorrowTransaction.member_id == borrow_in.member_id,
        models.BorrowTransaction.status == "issued"
    ).count()
    if active_borrows >= max_borrow_limit:
        raise HTTPException(status_code=400, detail=f"Member reached maximum borrow limit of {max_borrow_limit}")

    # Check if book exists and is available
    book = db.query(models.Book).filter(models.Book.id == borrow_in.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    if book.available_copies <= 0:
        raise HTTPException(status_code=400, detail="Book is not available currently")

    # Create transaction
    loan_period_days = get_setting_int(db, "loan_period_days", settings.LOAN_PERIOD_DAYS)
    issue_date = date.today()
    due_date = issue_date + timedelta(days=loan_period_days)
    
    transaction = models.BorrowTransaction(
        member_id=borrow_in.member_id,
        book_id=borrow_in.book_id,
        issue_date=issue_date,
        due_date=due_date,
        status="issued"
    )
    
    # Decrease available copies
    book.available_copies -= 1
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    return transaction


@router.post("/{transaction_id}/return", response_model=schemas.ReturnResponse)
def return_book(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    transaction = db.query(models.BorrowTransaction).filter(models.BorrowTransaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    if transaction.status == "returned":
        raise HTTPException(status_code=400, detail="Book already returned")
        
    # Process return
    transaction.return_date = date.today()
    transaction.status = "returned"
    
    # Increase available copies
    book = db.query(models.Book).filter(models.Book.id == transaction.book_id).first()
    if book:
        book.available_copies += 1
        
    db.commit()
    db.refresh(transaction)
    
    fine_obj = None
    # Calculate fine if overdue
    overdue_days = (transaction.return_date - transaction.due_date).days
    if overdue_days > 0:
        fine_rate = get_setting_float(db, "fine_per_day", settings.FINE_PER_DAY)
        fine_amount = overdue_days * fine_rate
        fine_obj = models.Fine(
            transaction_id=transaction.id,
            amount=fine_amount,
            overdue_days=overdue_days,
            status="unpaid"
        )
        db.add(fine_obj)
        db.commit()
        db.refresh(fine_obj)
        
    return {"transaction": transaction, "fine": fine_obj}



@router.post("/fines/{fine_id}/pay", response_model=schemas.FineResponse)
def pay_fine(
    fine_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(security.get_current_admin)
):
    fine = db.query(models.Fine).filter(models.Fine.id == fine_id).first()
    if not fine:
        raise HTTPException(status_code=404, detail="Fine not found")
        
    if fine.status == "paid":
        raise HTTPException(status_code=400, detail="Fine is already paid")
        
    fine.status = "paid"
    db.commit()
    db.refresh(fine)
    return fine
