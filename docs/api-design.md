# API Design — Library Management System

## 1. General Conventions

- **Base URL:** `/api`
- **Content Type:** `application/json`
- **Authentication:** JWT Bearer token in `Authorization` header
- **Pagination:** Query parameters `page` (default: 1), `page_size` (default: 20)
- **Search:** Query parameter `search` for text search
- **Error Response Format:**
  ```json
  {
    "detail": "Human-readable error message"
  }
  ```
- **Paginated Response Format:**
  ```json
  {
    "items": [...],
    "total": 100,
    "page": 1,
    "page_size": 20,
    "total_pages": 5
  }
  ```

## 2. Authentication Endpoints

### POST `/api/auth/login`

**Description:** Authenticate user and return JWT token.  
**Auth Required:** No  
**Request Body:**
```json
{
  "email": "admin@library.com",
  "password": "password123"
}
```
**Success Response (200):**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "role": "admin",
  "user_id": 1
}
```
**Error Responses:**
- `401` — Invalid credentials
- `403` — Account inactive
- `422` — Validation error

### GET `/api/auth/me`

**Description:** Get current authenticated user's profile.  
**Auth Required:** Yes (Admin, Student)  
**Success Response (200):**
```json
{
  "id": 1,
  "email": "admin@library.com",
  "role": "admin",
  "is_active": true,
  "member": null
}
```
For students, `member` contains their member profile.

---

## 3. Book Endpoints

### GET `/api/books`

**Description:** List all books with optional search, filter, and pagination.  
**Auth Required:** Yes (Admin, Student)  
**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string | Search by title, author, or ISBN |
| `category_id` | int | Filter by category |
| `available` | bool | Filter by availability |
| `page` | int | Page number (default: 1) |
| `page_size` | int | Items per page (default: 20) |
| `sort_by` | string | Sort field (title, author, created_at) |
| `sort_order` | string | asc or desc (default: asc) |

**Success Response (200):** Paginated list of books.

### GET `/api/books/{id}`

**Description:** Get a single book's details.  
**Auth Required:** Yes (Admin, Student)  
**Success Response (200):** Book object with category details.  
**Error Response:** `404` — Book not found.

### POST `/api/books`

**Description:** Create a new book.  
**Auth Required:** Yes (Admin only)  
**Request Body:**
```json
{
  "isbn": "978-0-13-468599-1",
  "title": "The Pragmatic Programmer",
  "author": "David Thomas, Andrew Hunt",
  "category_id": 1,
  "publisher": "Addison-Wesley",
  "publication_year": 2019,
  "description": "A guide to software craftsmanship.",
  "total_copies": 5,
  "shelf_location": "A-101"
}
```
**Success Response (201):** Created book object.  
**Error Responses:**
- `400` — Validation error
- `409` — Duplicate ISBN
- `403` — Forbidden (not admin)

### PUT `/api/books/{id}`

**Description:** Update an existing book.  
**Auth Required:** Yes (Admin only)  
**Request Body:** Same as POST (all fields optional for partial update).  
**Success Response (200):** Updated book object.  
**Error Responses:** `404`, `409`, `400`, `403`

### DELETE `/api/books/{id}`

**Description:** Delete a book.  
**Auth Required:** Yes (Admin only)  
**Success Response (200):** `{ "detail": "Book deleted successfully" }`  
**Error Responses:**
- `404` — Not found
- `409` — Cannot delete (active borrows exist)
- `403` — Forbidden

---

## 4. Category Endpoints

### GET `/api/categories`

**Description:** List all categories.  
**Auth Required:** Yes (Admin, Student)  
**Success Response (200):** List of categories with book counts.

### POST `/api/categories`

**Description:** Create a new category.  
**Auth Required:** Yes (Admin only)  
**Request Body:**
```json
{
  "name": "Computer Science",
  "description": "Books related to CS and programming"
}
```
**Success Response (201):** Created category.  
**Error Response:** `409` — Duplicate name.

### PUT `/api/categories/{id}`

**Description:** Update a category.  
**Auth Required:** Yes (Admin only)  
**Success Response (200):** Updated category.

### DELETE `/api/categories/{id}`

**Description:** Delete a category.  
**Auth Required:** Yes (Admin only)  
**Error Response:** `409` — Category has books.

---

## 5. Member Endpoints

### GET `/api/members`

**Description:** List all members with optional search and pagination.  
**Auth Required:** Yes (Admin only)  
**Query Parameters:** `search` (name, student_id, email), `status`, `page`, `page_size`  
**Success Response (200):** Paginated list of members.

### GET `/api/members/{id}`

**Description:** Get member details with borrowing summary.  
**Auth Required:** Yes (Admin only)  
**Success Response (200):** Member object with active borrow count.

### POST `/api/members`

**Description:** Register a new member (also creates user account).  
**Auth Required:** Yes (Admin only)  
**Request Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@college.edu",
  "phone": "9876543210",
  "student_id": "CS2024001",
  "department": "Computer Science",
  "year": 2,
  "password": "student123"
}
```
**Success Response (201):** Created member.  
**Error Responses:** `409` — Duplicate email or student_id.

### PUT `/api/members/{id}`

**Description:** Update member details.  
**Auth Required:** Yes (Admin only)  
**Success Response (200):** Updated member.

### PATCH `/api/members/{id}/status`

**Description:** Activate or deactivate a member.  
**Auth Required:** Yes (Admin only)  
**Request Body:**
```json
{
  "status": "inactive"
}
```
**Success Response (200):** Updated member.

---

## 6. Borrow Endpoints

### POST `/api/borrow`

**Description:** Issue a book to a member.  
**Auth Required:** Yes (Admin only)  
**Request Body:**
```json
{
  "member_id": 1,
  "book_id": 5
}
```
**Success Response (201):**
```json
{
  "id": 1,
  "member_id": 1,
  "book_id": 5,
  "issue_date": "2026-10-02",
  "due_date": "2026-10-16",
  "status": "issued",
  "member": { "name": "Rahul Sharma", "student_id": "CS2024001" },
  "book": { "title": "The Pragmatic Programmer" }
}
```
**Error Responses:**
- `400` — Member inactive, borrow limit exceeded, or book unavailable
- `404` — Member or book not found

### GET `/api/borrow`

**Description:** List borrow transactions.  
**Auth Required:** Yes (Admin: all transactions, Student: own transactions)  
**Query Parameters:** `status` (issued, returned, overdue), `member_id`, `page`, `page_size`  
**Success Response (200):** Paginated transactions with member and book details.

### GET `/api/borrow/{id}`

**Description:** Get a single transaction's details.  
**Auth Required:** Yes  
**Success Response (200):** Transaction with full details.

### GET `/api/borrow/member/{member_id}`

**Description:** Get all transactions for a specific member.  
**Auth Required:** Yes (Admin or the member themselves)  
**Success Response (200):** List of transactions.

---

## 7. Return Endpoints

### POST `/api/return/{transaction_id}`

**Description:** Process a book return.  
**Auth Required:** Yes (Admin only)  
**Success Response (200):**
```json
{
  "transaction": {
    "id": 1,
    "return_date": "2026-10-20",
    "status": "returned"
  },
  "fine": {
    "amount": 20.0,
    "overdue_days": 4,
    "status": "unpaid"
  }
}
```
If on-time, `fine` is `null`.  
**Error Responses:**
- `404` — Transaction not found
- `400` — Already returned

---

## 8. Fine Endpoints

### GET `/api/fines`

**Description:** List fines.  
**Auth Required:** Yes (Admin: all fines, Student: own fines)  
**Query Parameters:** `status` (paid, unpaid), `member_id`, `page`, `page_size`  
**Success Response (200):** Paginated fines with transaction and member details.

### PATCH `/api/fines/{id}/pay`

**Description:** Mark a fine as paid.  
**Auth Required:** Yes (Admin only)  
**Success Response (200):** Updated fine.

---

## 9. Dashboard Endpoints

### GET `/api/dashboard/admin`

**Description:** Get admin dashboard statistics.  
**Auth Required:** Yes (Admin only)  
**Success Response (200):**
```json
{
  "total_books": 150,
  "available_books": 120,
  "issued_books": 30,
  "total_members": 50,
  "active_members": 48,
  "overdue_books": 5,
  "total_fines": 500.0,
  "unpaid_fines": 200.0,
  "books_by_category": [
    { "category": "Computer Science", "count": 45 },
    { "category": "Mathematics", "count": 30 }
  ],
  "recent_transactions": [...]
}
```

### GET `/api/dashboard/student`

**Description:** Get student dashboard data.  
**Auth Required:** Yes (Student only)  
**Success Response (200):**
```json
{
  "borrowed_books": 2,
  "overdue_books": 0,
  "total_fines": 10.0,
  "unpaid_fines": 10.0,
  "current_borrows": [...],
  "recent_history": [...]
}
```

---

## 10. Student Profile Endpoints

### GET `/api/profile`

**Description:** Get current student's profile.  
**Auth Required:** Yes (Student only)  
**Success Response (200):** Member profile object.

### PUT `/api/profile`

**Description:** Update current student's profile.  
**Auth Required:** Yes (Student only)  
**Request Body:**
```json
{
  "phone": "9876543210",
  "department": "Computer Science",
  "year": 3
}
```
**Success Response (200):** Updated profile.

---

## 11. HTTP Status Code Summary

| Code | Meaning | Used When |
|------|---------|-----------|
| `200` | OK | Successful read/update/delete |
| `201` | Created | Successful create |
| `400` | Bad Request | Business logic violation |
| `401` | Unauthorized | Missing or invalid token |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Resource doesn't exist |
| `409` | Conflict | Duplicate resource |
| `422` | Unprocessable Entity | Validation error |
| `500` | Internal Server Error | Unexpected server error |
