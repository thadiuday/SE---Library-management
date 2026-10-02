# Library Management System — Project Plan

## 1. Project Overview

**Project Name:** Library Management System (LMS)  
**Project Type:** Academic Software Engineering Project  
**Development Methodology:** Iterative & Incremental  
**Start Date:** October 2026  

## 2. Problem Statement

Traditional library management relies on manual processes — handwritten registers, physical card catalogs, and paper-based borrowing records. These systems suffer from:

- **Data loss and inconsistency** — Paper records are easily damaged, lost, or duplicated.
- **Slow search** — Finding a book in a manual catalog is time-consuming.
- **No real-time tracking** — Librarians cannot instantly know book availability.
- **Overdue management failures** — Tracking due dates and calculating fines manually is error-prone.
- **Poor reporting** — Generating statistics (popular books, active borrowers) requires manual counting.
- **No member self-service** — Students cannot check availability or their borrowing status without visiting the library.

### Proposed Solution

A web-based Library Management System that automates:
- Book catalog management with search and filtering
- Member registration and management
- Book issuing and returning with automatic due-date and fine calculation
- Real-time dashboard with library statistics
- Role-based access for librarians and students

## 3. Objectives

1. Automate book cataloging, issuing, and returning processes.
2. Provide real-time tracking of book availability.
3. Automatically calculate overdue fines based on configurable policies.
4. Provide dashboards for librarians (operational overview) and students (personal borrowing status).
5. Implement role-based access control for security.
6. Demonstrate complete Software Engineering lifecycle through documentation and implementation.

## 4. Scope

### In Scope
- User authentication (login/logout with JWT)
- Book management (CRUD, search, filter, pagination)
- Category management
- Member management (CRUD, search)
- Book issuing workflow
- Book return workflow with fine calculation
- Dashboard with statistics and charts
- Borrowing history
- Fine tracking
- Role-based access (Admin/Librarian, Student/Member)
- Seed data for demonstration
- SE documentation (SRS, UML diagrams, test cases, traceability)

### Out of Scope
- Online book reservation/hold system
- Email/SMS notifications
- E-book or digital content management
- Payment gateway integration
- Multi-branch library support
- Barcode/QR scanning
- Mobile native applications
- Advanced analytics/ML recommendations

## 5. Development Iterations

### Iteration 1 — Requirements & Architecture (Phase 1)
**Goals:** Complete analysis and planning  
**Deliverables:**
- Project plan
- Functional & non-functional requirements
- Use case definitions
- System architecture document
- Database design
- API design
- UML diagrams (use case, class, ER, activity, sequence)
- Testing strategy
- Traceability matrix

### Iteration 2 — Foundation (Phase 2)
**Goals:** Project setup + Authentication + Database  
**Deliverables:**
- Project structure (frontend + backend)
- Database models and migrations
- Seed data
- Authentication system (login, JWT, role-based auth)
- Protected routes (frontend + backend)
- Login page

### Iteration 3 — Book & Member Management (Phase 3)
**Goals:** Core CRUD operations  
**Deliverables:**
- Book CRUD APIs + frontend pages
- Category management
- Member CRUD APIs + frontend pages
- Search and filtering
- Pagination
- Form validation (frontend + backend)

### Iteration 4 — Issue/Return/Fine System (Phase 4)
**Goals:** Core business logic  
**Deliverables:**
- Book issuing workflow (API + UI)
- Book return workflow (API + UI)
- Fine calculation engine
- Transaction history
- Overdue tracking
- Configurable policies (borrow limit, fine rate, loan period)

### Iteration 5 — Dashboard & UI Polish (Phase 5)
**Goals:** Dashboards + UX improvements  
**Deliverables:**
- Admin dashboard with statistics and charts
- Student dashboard with personal data
- Loading states, error states, empty states
- Confirmation dialogs
- Responsive design refinement
- UI consistency pass

### Iteration 6 — Testing, Documentation & Deployment (Phase 6)
**Goals:** Quality assurance + final documentation  
**Deliverables:**
- Unit tests (backend services)
- Integration tests
- System test cases (20+ test cases)
- Final report
- README
- Docker Compose configuration
- Demo flow verification
- Documentation consistency check

## 6. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18+ with TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Charts | Recharts |
| Backend Framework | FastAPI (Python) |
| ORM | SQLAlchemy 2.0 |
| Validation | Pydantic v2 |
| Authentication | JWT (python-jose) |
| Password Hashing | passlib with bcrypt |
| Database | PostgreSQL (production), SQLite (development) |
| Testing | pytest (backend), Vitest (frontend) |
| API Docs | FastAPI auto-generated OpenAPI/Swagger |
| Version Control | Git |
| Containerization | Docker + Docker Compose |

## 7. Team & Roles

For this academic project, a single developer handles all roles:
- Requirements Analyst
- System Architect
- Backend Developer
- Frontend Developer
- Database Designer
- Tester
- Technical Writer

## 8. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Database schema changes mid-development | Medium | Use migrations; design schema carefully upfront |
| Scope creep | High | Strict scope definition; defer non-essential features |
| Authentication complexity | Medium | Use well-tested libraries (python-jose, passlib) |
| Frontend-backend API mismatch | Medium | Define API contract early; use TypeScript types |
| Time constraints | High | Iterative approach; prioritize core features |

## 9. Success Criteria

1. All core features (auth, books, members, issue, return, fines, dashboard) work correctly.
2. The demo flow completes without errors.
3. Documentation is consistent with implementation.
4. At least 20 test cases are documented and executed.
5. The traceability matrix covers all major requirements.
6. The application runs from a single setup process.
