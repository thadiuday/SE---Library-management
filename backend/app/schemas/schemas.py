from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date

class UserBase(BaseModel):
    email: EmailStr
    role: str
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    member_profile: Optional["MemberResponse"] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class Login(BaseModel):
    email: EmailStr
    password: str

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    
    class Config:
        from_attributes = True

class BookBase(BaseModel):
    isbn: str
    title: str
    author: str
    category_id: Optional[int] = None
    publisher: Optional[str] = None
    publication_year: Optional[int] = None
    description: Optional[str] = None
    total_copies: int = Field(default=1, ge=0)
    shelf_location: Optional[str] = None

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    isbn: Optional[str] = None
    title: Optional[str] = None
    author: Optional[str] = None
    category_id: Optional[int] = None
    publisher: Optional[str] = None
    publication_year: Optional[int] = None
    description: Optional[str] = None
    total_copies: Optional[int] = Field(None, ge=0)
    shelf_location: Optional[str] = None

class BookResponse(BookBase):
    id: int
    available_copies: int
    category: Optional[CategoryResponse] = None
    
    class Config:
        from_attributes = True

class MemberBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    student_id: str
    department: Optional[str] = None
    year: Optional[int] = None

class MemberCreate(MemberBase):
    password: str

class MemberUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    student_id: Optional[str] = None

class MemberResponse(MemberBase):
    id: int
    user_id: int
    status: str
    
    class Config:
        from_attributes = True

class BorrowCreate(BaseModel):
    member_id: int
    book_id: int

class BorrowResponse(BaseModel):
    id: int
    member_id: int
    book_id: int
    issue_date: date
    due_date: date
    return_date: Optional[date] = None
    status: str
    book: Optional[BookResponse] = None
    member: Optional[MemberResponse] = None
    
    class Config:
        from_attributes = True

class FineResponse(BaseModel):
    id: int
    transaction_id: int
    amount: float
    overdue_days: int
    status: str
    
    class Config:
        from_attributes = True

class ReturnResponse(BaseModel):
    transaction: BorrowResponse
    fine: Optional[FineResponse] = None

class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    total_pages: int

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class LibrarySettings(BaseModel):
    fine_per_day: float = Field(default=5.0, ge=0)
    max_borrow_limit: int = Field(default=5, ge=1, le=50)
    loan_period_days: int = Field(default=14, ge=1, le=365)
    library_name: str = Field(default="Central Campus Library")
    contact_email: EmailStr = Field(default="library@campus.edu")
    contact_phone: Optional[str] = Field(default="+1 (555) 019-2834")
    operating_hours: Optional[str] = Field(default="Mon-Fri: 8:00 AM - 8:00 PM, Sat: 9:00 AM - 4:00 PM")

UserResponse.model_rebuild()

