from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Date, Numeric, Text, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False) # 'admin' or 'student'
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    member_profile = relationship("Member", back_populates="user", uselist=False)

class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20))
    student_id = Column(String(50), unique=True, nullable=False, index=True)
    department = Column(String(100))
    year = Column(Integer)
    status = Column(String(20), default="active", nullable=False) # 'active', 'inactive'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="member_profile")
    transactions = relationship("BorrowTransaction", back_populates="member")

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    books = relationship("Book", back_populates="category")

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    isbn = Column(String(20), unique=True, index=True, nullable=False)
    title = Column(String(500), nullable=False, index=True)
    author = Column(String(255), nullable=False, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    publisher = Column(String(255))
    publication_year = Column(Integer)
    description = Column(Text)
    total_copies = Column(Integer, default=1, nullable=False)
    available_copies = Column(Integer, default=1, nullable=False)
    shelf_location = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    category = relationship("Category", back_populates="books")
    transactions = relationship("BorrowTransaction", back_populates="book")

class BorrowTransaction(Base):
    __tablename__ = "borrow_transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    issue_date = Column(Date, nullable=False)
    due_date = Column(Date, nullable=False)
    return_date = Column(Date, nullable=True)
    status = Column(String(20), default="issued", nullable=False) # 'issued', 'returned'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    member = relationship("Member", back_populates="transactions")
    book = relationship("Book", back_populates="transactions")
    fine = relationship("Fine", back_populates="transaction", uselist=False)

class Fine(Base):
    __tablename__ = "fines"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("borrow_transactions.id"), unique=True, nullable=False)
    amount = Column(Float, nullable=False)
    overdue_days = Column(Integer, nullable=False)
    status = Column(String(20), default="unpaid", nullable=False) # 'unpaid', 'paid'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    transaction = relationship("BorrowTransaction", back_populates="fine")

class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String(100), primary_key=True, index=True)
    value = Column(String(500), nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
