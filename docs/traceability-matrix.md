# Traceability Matrix — Library Management System

The Requirements Traceability Matrix maps Functional Requirements (FR) to Use Cases (UC), Design Components (API/UI), and Test Cases (TC) to ensure complete coverage.

| Requirement ID | Requirement Name | Use Case | API Endpoint | Frontend Component | Test Case | Status |
|----------------|------------------|----------|--------------|--------------------|-----------|--------|
| **FR-01** | User Login | UC-01 | `POST /api/auth/login`<br>`GET /api/auth/me` | `Login`<br>`AuthProvider` | TC-01, TC-02, TC-03, TC-04, TC-21, TC-22 | Planned |
| **FR-02** | User Logout | UC-02 | (Client-side) | `Navbar`<br>`AuthProvider` | TC-25 | Planned |
| **FR-03** | Add Book | UC-03 | `POST /api/books` | `BookForm` | TC-05, TC-06 | Planned |
| **FR-04** | Update Book | UC-03 | `PUT /api/books/{id}` | `BookForm` | TC-07 | Planned |
| **FR-05** | Delete Book | UC-03 | `DELETE /api/books/{id}` | `BookList` | TC-08, TC-09 | Planned |
| **FR-06** | Search/Filter Books | UC-06 | `GET /api/books` | `BookList`<br>`StudentBooks` | TC-10 | Planned |
| **FR-07** | Register Member | UC-05 | `POST /api/members` | `MemberForm` | TC-11, TC-12 | Planned |
| **FR-08** | Issue Book | UC-07 | `POST /api/borrow` | `IssueBook` | TC-13, TC-14, TC-15 | Planned |
| **FR-09** | Return Book | UC-08 | `POST /api/return/{id}` | `TransactionList` | TC-16, TC-17, TC-18 | Planned |
| **FR-10** | Calculate Fine | UC-09 | `POST /api/return/{id}` | `TransactionList` | TC-17 | Planned |
| **FR-11** | View History | UC-11 | `GET /api/borrow` | `TransactionList`<br>`StudentHistory` | TC-23 | Planned |
| **FR-12** | View Dashboard | UC-10 | `GET /api/dashboard/*` | `AdminDashboard`<br>`StudentDashboard` | TC-19, TC-20 | Planned |
| **FR-13** | Manage Categories | UC-04 | `POST/PUT/DELETE /api/categories` | `CategoryModal` | - | Planned |
| **FR-14** | Update Profile | UC-13 | `PUT /api/profile` | `StudentProfile` | - | Planned |
| **FR-15** | View Fines | UC-12 | `GET /api/fines` | `FineList`<br>`StudentDashboard` | TC-24 | Planned |
