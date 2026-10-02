# Functional Requirements — Library Management System

## Overview

Each functional requirement is identified with a unique ID (FR-XX) and specifies the actor, preconditions, main flow, alternative flows, and postconditions.

---

## FR-01: User Login

| Field | Description |
|-------|-------------|
| **Requirement ID** | FR-01 |
| **Name** | User Login |
| **Description** | Users (Admin/Librarian or Student/Member) can log in using email and password. The system authenticates credentials and returns a JWT token with role information. |
| **Actor** | Admin, Student |
| **Preconditions** | User account exists in the system. |
| **Main Flow** | 1. User navigates to login page. 2. User enters email and password. 3. System validates credentials. 4. System generates JWT token. 5. System redirects user to role-appropriate dashboard. |
| **Alternative Flow** | 3a. Invalid credentials → System displays "Invalid email or password" error. 3b. Account deactivated → System displays "Account is inactive" error. |
| **Postconditions** | User is authenticated; JWT token is stored in client; user sees their dashboard. |

---

## FR-02: User Logout

| Field | Description |
|-------|-------------|
| **Requirement ID** | FR-02 |
| **Name** | User Logout |
| **Description** | Authenticated users can log out, clearing their session/token. |
| **Actor** | Admin, Student |
| **Preconditions** | User is logged in. |
| **Main Flow** | 1. User clicks logout. 2. System clears JWT token from client storage. 3. System redirects to login page. |
| **Alternative Flow** | None. |
| **Postconditions** | User is logged out; protected routes are inaccessible. |

---

## FR-03: Add Book

| Field | Description |
|-------|-------------|
| **Requirement ID** | FR-03 |
| **Name** | Add Book |
| **Description** | Admin can add a new book to the library catalog with all required details. |
| **Actor** | Admin |
| **Preconditions** | Admin is authenticated. At least one category exists. |
| **Main Flow** | 1. Admin navigates to "Add Book" page. 2. Admin fills in book details (title, author, ISBN, category, publisher, year, copies, shelf location, description). 3. Admin submits the form. 4. System validates input. 5. System creates the book record. 6. System shows success confirmation. |
| **Alternative Flow** | 4a. Validation fails (missing required fields, invalid ISBN, negative copies) → System displays specific validation errors. 4b. Duplicate ISBN → System displays "A book with this ISBN already exists" error. |
| **Postconditions** | Book record is created. Available copies equals total copies. |

---

## FR-04: Update Book

| Field | Description |
|-------|-------------|
| **Requirement ID** | FR-04 |
| **Name** | Update Book |
| **Description** | Admin can edit an existing book's details. |
| **Actor** | Admin |
| **Preconditions** | Admin is authenticated. Book exists. |
| **Main Flow** | 1. Admin navigates to book details. 2. Admin clicks "Edit". 3. Admin modifies fields. 4. Admin submits. 5. System validates input. 6. System updates the record. 7. System shows success confirmation. |
| **Alternative Flow** | 5a. Validation fails → Display errors. 5b. Total copies reduced below issued count → "Cannot reduce total copies below currently issued count" error. |
| **Postconditions** | Book record is updated with new data. |

---

## FR-05: Delete Book

| Field | Description |
|-------|-------------|
| **Requirement ID** | FR-05 |
| **Name** | Delete Book |
| **Description** | Admin can delete a book from the catalog. |
| **Actor** | Admin |
| **Preconditions** | Admin is authenticated. Book exists. |
| **Main Flow** | 1. Admin clicks "Delete" on a book. 2. System shows confirmation dialog. 3. Admin confirms. 4. System checks for active borrow transactions. 5. System deletes the book. 6. System shows success message. |
| **Alternative Flow** | 3a. Admin cancels → No action taken. 4a. Active borrow transactions exist → "Cannot delete a book with active borrows" error. |
| **Postconditions** | Book record is removed from the database. |

---

## FR-06: Search and Filter Books

| Field | Description |
|-------|-------------|
| **Requirement ID** | FR-06 |
| **Name** | Search and Filter Books |
| **Description** | Users can search books by title, author, or ISBN. Users can filter by category and availability. Results are paginated. |
| **Actor** | Admin, Student |
| **Preconditions** | User is authenticated. |
| **Main Flow** | 1. User enters search query and/or selects filters. 2. System queries the database with filters. 3. System returns paginated results. 4. User can navigate pages. |
| **Alternative Flow** | 3a. No results → System displays "No books found" empty state. |
| **Postconditions** | Matching books are displayed. |

---

## FR-07: Register Member

| Field | Description |
|-------|-------------|
| **Requirement ID** | FR-07 |
| **Name** | Register Member |
| **Description** | Admin can register a new student/member with their details. A user account is created automatically. |
| **Actor** | Admin |
| **Preconditions** | Admin is authenticated. |
| **Main Flow** | 1. Admin navigates to "Add Member". 2. Admin fills in member details (name, email, phone, student ID, department, year, password). 3. Admin submits. 4. System validates input. 5. System creates member record and associated user account. 6. System shows success confirmation. |
| **Alternative Flow** | 4a. Validation fails → Display errors. 4b. Duplicate email → "Email already registered" error. 4c. Duplicate student ID → "Student ID already exists" error. |
| **Postconditions** | Member and user records are created. Member status is "active". |

---

## FR-08: Issue Book

| Field | Description |
|-------|-------------|
| **Requirement ID** | FR-08 |
| **Name** | Issue Book |
| **Description** | Admin can issue a book to a member. The system checks eligibility, availability, and creates a borrow transaction. |
| **Actor** | Admin |
| **Preconditions** | Admin is authenticated. Member exists and is active. Book exists and has available copies. |
| **Main Flow** | 1. Admin selects/searches for a member. 2. Admin selects/searches for a book. 3. System checks member eligibility (active status, not exceeding borrow limit). 4. System checks book availability (available copies > 0). 5. System creates a borrow transaction with issue date and calculated due date. 6. System decrements available copies. 7. System shows confirmation with due date. |
| **Alternative Flow** | 3a. Member inactive → "Member account is inactive" error. 3b. Borrow limit exceeded → "Member has reached the borrowing limit of N books" error. 4a. No copies available → "No copies available for this book" error. |
| **Postconditions** | Borrow transaction is created. Book available copies decreased by 1. |

---

## FR-09: Return Book

| Field | Description |
|-------|-------------|
| **Requirement ID** | FR-09 |
| **Name** | Return Book |
| **Description** | Admin can process a book return. The system calculates overdue days and fines if applicable. |
| **Actor** | Admin |
| **Preconditions** | Admin is authenticated. An active (unreturned) borrow transaction exists. |
| **Main Flow** | 1. Admin searches for the active borrow transaction (by member or book). 2. System displays transaction details. 3. Admin confirms return. 4. System records return date. 5. System calculates overdue days (if any). 6. System calculates fine (overdue days × fine per day). 7. System marks transaction as returned. 8. System increments available copies. 9. System shows return summary (including fine if applicable). |
| **Alternative Flow** | 1a. Transaction not found → "No active transaction found" error. 3a. Book already returned → "This book has already been returned" error. |
| **Postconditions** | Transaction is marked returned. Book available copies increased by 1. Fine record is created if overdue. |

---

## FR-10: Calculate Fine

| Field | Description |
|-------|-------------|
| **Requirement ID** | FR-10 |
| **Name** | Calculate Fine |
| **Description** | The system automatically calculates fines for overdue books using a configurable fine rate. |
| **Actor** | System (automatic) |
| **Preconditions** | A borrow transaction exists with return date after due date. |
| **Main Flow** | 1. System calculates overdue days = return date − due date. 2. System calculates fine = overdue days × fine per day (from configuration). 3. System stores the fine record. |
| **Alternative Flow** | 1a. Return date ≤ due date → No fine. Fine = 0. |
| **Postconditions** | Fine record is created and linked to the transaction. |

---

## FR-11: View Borrowing History

| Field | Description |
|-------|-------------|
| **Requirement ID** | FR-11 |
| **Name** | View Borrowing History |
| **Description** | Admin can view all borrowing transactions. Students can view their own borrowing history. |
| **Actor** | Admin, Student |
| **Preconditions** | User is authenticated. |
| **Main Flow** | 1. User navigates to history/transactions page. 2. System retrieves relevant transactions (all for admin, own for student). 3. System displays transactions with book title, issue date, due date, return date, status, and fine. |
| **Alternative Flow** | 2a. No transactions → Display "No borrowing history" empty state. |
| **Postconditions** | Transactions are displayed. |

---

## FR-12: View Dashboard

| Field | Description |
|-------|-------------|
| **Requirement ID** | FR-12 |
| **Name** | View Dashboard |
| **Description** | Admin sees library-wide statistics. Student sees personal borrowing summary. |
| **Actor** | Admin, Student |
| **Preconditions** | User is authenticated. |
| **Main Flow (Admin)** | 1. Admin navigates to dashboard. 2. System displays: total books, available books, issued books, total members, overdue books, total fines collected. 3. System shows charts (e.g., books by category, monthly transactions). |
| **Main Flow (Student)** | 1. Student navigates to dashboard. 2. System displays: currently borrowed books, upcoming due dates, outstanding fines, borrowing history count. |
| **Alternative Flow** | None. |
| **Postconditions** | Dashboard data is displayed. |

---

## FR-13: Manage Categories

| Field | Description |
|-------|-------------|
| **Requirement ID** | FR-13 |
| **Name** | Manage Categories |
| **Description** | Admin can create, update, and delete book categories. |
| **Actor** | Admin |
| **Preconditions** | Admin is authenticated. |
| **Main Flow** | 1. Admin navigates to categories. 2. Admin adds/edits/deletes a category. 3. System validates (name required, no duplicates). 4. System persists the change. |
| **Alternative Flow** | 4a. Category has associated books → Cannot delete; show error. |
| **Postconditions** | Category is created/updated/deleted. |

---

## FR-14: Update Student Profile

| Field | Description |
|-------|-------------|
| **Requirement ID** | FR-14 |
| **Name** | Update Student Profile |
| **Description** | Students can update their own profile information (phone, department, year). |
| **Actor** | Student |
| **Preconditions** | Student is authenticated. |
| **Main Flow** | 1. Student navigates to profile page. 2. Student edits allowed fields. 3. Student submits. 4. System validates and updates. |
| **Alternative Flow** | 4a. Validation fails → Display errors. |
| **Postconditions** | Member profile is updated. |

---

## FR-15: View Fines

| Field | Description |
|-------|-------------|
| **Requirement ID** | FR-15 |
| **Name** | View Fines |
| **Description** | Admin can view all fines. Students can view their own fines. |
| **Actor** | Admin, Student |
| **Preconditions** | User is authenticated. |
| **Main Flow** | 1. User navigates to fines page. 2. System retrieves relevant fine records. 3. System displays due date, return date, overdue days, fine amount, and status. |
| **Alternative Flow** | 2a. No fines → Display "No fines" empty state. |
| **Postconditions** | Fine records are displayed. |
