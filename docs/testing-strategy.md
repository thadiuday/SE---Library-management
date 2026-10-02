# Testing Strategy — Library Management System

## 1. Testing Approach

We use a multi-level testing strategy:

| Level | What is Tested | Tools |
|-------|---------------|-------|
| **Unit Testing** | Individual functions, services, utilities | pytest (backend), Vitest (frontend) |
| **Integration Testing** | API endpoints with database | pytest + TestClient (FastAPI) |
| **System Testing** | End-to-end user workflows | Manual test cases |

## 2. Backend Testing (pytest)

### 2.1 Unit Tests

Test individual service/utility functions in isolation with mock repositories.

**Targets:**
- `FineService.calculate_fine()` — correct fine calculation
- `BorrowService.check_eligibility()` — borrow limit enforcement
- Due-date calculation logic
- Password hashing/verification
- JWT token creation/validation
- Input validation (ISBN format, required fields)

### 2.2 Integration Tests

Test API endpoints with an actual SQLite test database.

**Targets:**
- Auth endpoints (login, me)
- Book CRUD endpoints
- Member CRUD endpoints
- Borrow/return endpoints
- Dashboard endpoints
- Error responses for invalid input

### 2.3 Test Configuration

- Use SQLite in-memory database for test isolation
- Create fresh database for each test session
- Use fixtures for common test data (admin user, sample books, sample members)
- Test both success and error paths

## 3. Frontend Testing (Vitest)

### 3.1 Unit Tests

- Utility functions (date formatting, fine calculation display)
- Custom hooks (with mock API responses)

### 3.2 Component Tests

- Form validation behavior
- Conditional rendering based on role
- Loading/error/empty states

## 4. Manual System Test Cases

The following 25 test cases cover major system workflows. Each test case references a functional requirement.

---

### TC-01: Admin Login — Valid Credentials

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-01 |
| **Requirement ID** | FR-01 |
| **Description** | Admin can log in with valid email and password. |
| **Preconditions** | Admin account exists (admin@library.com / admin123). |
| **Test Data** | Email: admin@library.com, Password: admin123 |
| **Steps** | 1. Navigate to /login. 2. Enter email. 3. Enter password. 4. Click "Login". |
| **Expected Result** | User is redirected to /admin/dashboard. Dashboard displays statistics. |
| **Actual Result** | |
| **Status** | |

---

### TC-02: Login — Invalid Credentials

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-02 |
| **Requirement ID** | FR-01 |
| **Description** | Login fails with invalid password. |
| **Preconditions** | Admin account exists. |
| **Test Data** | Email: admin@library.com, Password: wrongpassword |
| **Steps** | 1. Navigate to /login. 2. Enter email. 3. Enter wrong password. 4. Click "Login". |
| **Expected Result** | Error message "Invalid email or password" is displayed. User stays on login page. |
| **Actual Result** | |
| **Status** | |

---

### TC-03: Login — Empty Fields

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-03 |
| **Requirement ID** | FR-01 |
| **Description** | Login form validates required fields. |
| **Preconditions** | None. |
| **Test Data** | Empty email and password. |
| **Steps** | 1. Navigate to /login. 2. Click "Login" without entering data. |
| **Expected Result** | Validation errors shown for email and password fields. |
| **Actual Result** | |
| **Status** | |

---

### TC-04: Student Login

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-04 |
| **Requirement ID** | FR-01 |
| **Description** | Student can log in and sees student dashboard. |
| **Preconditions** | Student account exists. |
| **Test Data** | Email: rahul@college.edu, Password: student123 |
| **Steps** | 1. Navigate to /login. 2. Enter credentials. 3. Click "Login". |
| **Expected Result** | User is redirected to /student/dashboard. Student sees personal borrowing data. |
| **Actual Result** | |
| **Status** | |

---

### TC-05: Add Book — Valid Data

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-05 |
| **Requirement ID** | FR-03 |
| **Description** | Admin can add a new book with valid data. |
| **Preconditions** | Admin is logged in. Category "Computer Science" exists. |
| **Test Data** | Title: "Clean Code", Author: "Robert C. Martin", ISBN: "978-0-13-235088-4", Category: CS, Copies: 3 |
| **Steps** | 1. Navigate to /admin/books. 2. Click "Add Book". 3. Fill all required fields. 4. Click "Save". |
| **Expected Result** | Book is created. Success message shown. Book appears in the list. Available copies = total copies. |
| **Actual Result** | |
| **Status** | |

---

### TC-06: Add Book — Duplicate ISBN

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-06 |
| **Requirement ID** | FR-03 |
| **Description** | System rejects a book with duplicate ISBN. |
| **Preconditions** | Admin logged in. A book with ISBN "978-0-13-235088-4" exists. |
| **Test Data** | Same ISBN as existing book. |
| **Steps** | 1. Navigate to /admin/books/new. 2. Enter data with existing ISBN. 3. Click "Save". |
| **Expected Result** | Error: "A book with this ISBN already exists." |
| **Actual Result** | |
| **Status** | |

---

### TC-07: Edit Book

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-07 |
| **Requirement ID** | FR-04 |
| **Description** | Admin can edit a book's details. |
| **Preconditions** | Admin logged in. Book exists. |
| **Test Data** | Change title from "Clean Code" to "Clean Code: A Handbook". |
| **Steps** | 1. Navigate to book details. 2. Click "Edit". 3. Modify title. 4. Click "Save". |
| **Expected Result** | Book is updated. Success message shown. Updated title is reflected in the list. |
| **Actual Result** | |
| **Status** | |

---

### TC-08: Delete Book — No Active Borrows

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-08 |
| **Requirement ID** | FR-05 |
| **Description** | Admin can delete a book with no active borrows. |
| **Preconditions** | Admin logged in. Book exists. No active borrows for this book. |
| **Steps** | 1. Navigate to book list. 2. Click "Delete" on a book. 3. Confirm deletion. |
| **Expected Result** | Book is deleted. Success message shown. Book is removed from the list. |
| **Actual Result** | |
| **Status** | |

---

### TC-09: Delete Book — With Active Borrows

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-09 |
| **Requirement ID** | FR-05 |
| **Description** | System prevents deleting a book with active borrows. |
| **Preconditions** | Admin logged in. Book has at least one active borrow. |
| **Steps** | 1. Navigate to book list. 2. Click "Delete" on a borrowed book. 3. Confirm deletion. |
| **Expected Result** | Error: "Cannot delete a book with active borrow transactions." |
| **Actual Result** | |
| **Status** | |

---

### TC-10: Search Books by Title

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-10 |
| **Requirement ID** | FR-06 |
| **Description** | Users can search books by title. |
| **Preconditions** | User logged in. Books exist in the system. |
| **Test Data** | Search query: "Python" |
| **Steps** | 1. Navigate to books page. 2. Enter "Python" in search bar. |
| **Expected Result** | Only books with "Python" in the title are displayed. |
| **Actual Result** | |
| **Status** | |

---

### TC-11: Register Member — Valid Data

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-11 |
| **Requirement ID** | FR-07 |
| **Description** | Admin can register a new member. |
| **Preconditions** | Admin logged in. |
| **Test Data** | Name: "Priya Kumar", Email: priya@college.edu, Student ID: CS2024005, Dept: CS, Year: 1, Password: student123 |
| **Steps** | 1. Navigate to /admin/members. 2. Click "Add Member". 3. Fill form. 4. Click "Save". |
| **Expected Result** | Member is created. Success message shown. Member appears in the list. |
| **Actual Result** | |
| **Status** | |

---

### TC-12: Register Member — Duplicate Student ID

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-12 |
| **Requirement ID** | FR-07 |
| **Description** | System rejects duplicate student ID. |
| **Preconditions** | Admin logged in. Member with student ID "CS2024001" exists. |
| **Test Data** | Student ID: CS2024001 |
| **Steps** | 1. Navigate to add member. 2. Enter existing student ID. 3. Submit. |
| **Expected Result** | Error: "A member with this student ID already exists." |
| **Actual Result** | |
| **Status** | |

---

### TC-13: Issue Book — Successful

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-13 |
| **Requirement ID** | FR-08 |
| **Description** | Admin can issue an available book to an active member. |
| **Preconditions** | Admin logged in. Member is active. Book has available copies. Member below borrow limit. |
| **Test Data** | Member: Rahul Sharma (CS2024001), Book: "The Pragmatic Programmer" |
| **Steps** | 1. Navigate to issue book page. 2. Select member. 3. Select book. 4. Click "Issue". |
| **Expected Result** | Transaction created. Due date = today + 14 days. Available copies decremented by 1. Confirmation shown. |
| **Actual Result** | |
| **Status** | |

---

### TC-14: Issue Book — No Available Copies

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-14 |
| **Requirement ID** | FR-08 |
| **Description** | System prevents issuing a book with no available copies. |
| **Preconditions** | Admin logged in. Book has available_copies = 0. |
| **Steps** | 1. Try to issue a book with 0 available copies. |
| **Expected Result** | Error: "No copies available for this book." |
| **Actual Result** | |
| **Status** | |

---

### TC-15: Issue Book — Borrow Limit Exceeded

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-15 |
| **Requirement ID** | FR-08 |
| **Description** | System prevents issuing when member has reached borrow limit. |
| **Preconditions** | Admin logged in. Member has 5 active borrows (limit = 5). |
| **Steps** | 1. Try to issue another book to the member. |
| **Expected Result** | Error: "Member has reached the borrowing limit of 5 books." |
| **Actual Result** | |
| **Status** | |

---

### TC-16: Return Book — On Time

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-16 |
| **Requirement ID** | FR-09 |
| **Description** | Admin returns a book that is on time (no fine). |
| **Preconditions** | Admin logged in. Active borrow exists. Due date is in the future. |
| **Steps** | 1. Navigate to transactions. 2. Find active transaction. 3. Click "Return". 4. Confirm. |
| **Expected Result** | Transaction marked returned. Return date = today. Fine = 0. Available copies incremented. |
| **Actual Result** | |
| **Status** | |

---

### TC-17: Return Book — Overdue (Fine)

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-17 |
| **Requirement ID** | FR-09, FR-10 |
| **Description** | Admin returns an overdue book; fine is calculated. |
| **Preconditions** | Admin logged in. Active borrow with due date 4 days ago. Fine rate = ₹5/day. |
| **Test Data** | Overdue by 4 days → Fine = ₹20 |
| **Steps** | 1. Find overdue transaction. 2. Click "Return". 3. Confirm. |
| **Expected Result** | Transaction marked returned. Fine = ₹20. Overdue days = 4. Fine status = unpaid. Available copies incremented. |
| **Actual Result** | |
| **Status** | |

---

### TC-18: Return Book — Already Returned

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-18 |
| **Requirement ID** | FR-09 |
| **Description** | System prevents returning an already returned book. |
| **Preconditions** | Transaction exists with status "returned". |
| **Steps** | 1. Attempt to return an already-returned transaction via API. |
| **Expected Result** | Error: "This book has already been returned." |
| **Actual Result** | |
| **Status** | |

---

### TC-19: View Admin Dashboard

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-19 |
| **Requirement ID** | FR-12 |
| **Description** | Admin dashboard displays correct statistics. |
| **Preconditions** | Admin logged in. System has books, members, and transactions. |
| **Steps** | 1. Navigate to /admin/dashboard. |
| **Expected Result** | Dashboard shows: total books, available books, issued books, total members, overdue count, total fines. Charts are rendered. |
| **Actual Result** | |
| **Status** | |

---

### TC-20: View Student Dashboard

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-20 |
| **Requirement ID** | FR-12 |
| **Description** | Student dashboard displays personal data. |
| **Preconditions** | Student logged in. Student has borrow history. |
| **Steps** | 1. Navigate to /student/dashboard. |
| **Expected Result** | Dashboard shows: currently borrowed books, due dates, outstanding fines, history summary. |
| **Actual Result** | |
| **Status** | |

---

### TC-21: Unauthorized Access — Student Accesses Admin Route

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-21 |
| **Requirement ID** | FR-01 (RBAC) |
| **Description** | Student cannot access admin-only routes. |
| **Preconditions** | Student is logged in. |
| **Steps** | 1. Try to navigate to /admin/dashboard. |
| **Expected Result** | Redirected to student dashboard or shown "Forbidden" error. |
| **Actual Result** | |
| **Status** | |

---

### TC-22: Unauthorized Access — API Without Token

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-22 |
| **Requirement ID** | FR-01 (Security) |
| **Description** | API returns 401 for requests without JWT token. |
| **Preconditions** | None. |
| **Steps** | 1. Send GET /api/books without Authorization header. |
| **Expected Result** | 401 Unauthorized response. |
| **Actual Result** | |
| **Status** | |

---

### TC-23: View Borrowing History

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-23 |
| **Requirement ID** | FR-11 |
| **Description** | Student can view their borrowing history. |
| **Preconditions** | Student logged in. Has past and current borrows. |
| **Steps** | 1. Navigate to /student/history. |
| **Expected Result** | List of all past and current transactions with book title, dates, status, and fine. |
| **Actual Result** | |
| **Status** | |

---

### TC-24: View Fines

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-24 |
| **Requirement ID** | FR-15 |
| **Description** | Student can view their fines. |
| **Preconditions** | Student logged in. Has at least one fine. |
| **Steps** | 1. Navigate to /student/dashboard or fines section. |
| **Expected Result** | Fine records displayed with amount, overdue days, and status. |
| **Actual Result** | |
| **Status** | |

---

### TC-25: Logout

| Field | Value |
|-------|-------|
| **Test Case ID** | TC-25 |
| **Requirement ID** | FR-02 |
| **Description** | User can log out. |
| **Preconditions** | User is logged in. |
| **Steps** | 1. Click "Logout". |
| **Expected Result** | User is redirected to login page. Protected routes are no longer accessible. |
| **Actual Result** | |
| **Status** | |

---

## 5. Test Coverage Summary

| Category | Test Cases | Coverage |
|----------|-----------|----------|
| Authentication | TC-01 to TC-04, TC-21, TC-22, TC-25 | Login (valid, invalid, empty), role-based access, logout |
| Book Management | TC-05 to TC-10 | Add, duplicate ISBN, edit, delete (with/without borrows), search |
| Member Management | TC-11, TC-12 | Register, duplicate student ID |
| Issue Book | TC-13, TC-14, TC-15 | Successful, no copies, borrow limit |
| Return Book | TC-16, TC-17, TC-18 | On-time, overdue with fine, already returned |
| Dashboard | TC-19, TC-20 | Admin and student dashboards |
| History & Fines | TC-23, TC-24 | View borrowing history, view fines |

**Total: 25 test cases (13 positive, 12 negative)**
