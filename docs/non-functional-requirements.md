# Non-Functional Requirements — Library Management System

## Overview

Non-functional requirements define quality attributes of the system. Each is identified with NFR-XX.

---

## NFR-01: Performance

| Field | Description |
|-------|-------------|
| **Requirement ID** | NFR-01 |
| **Category** | Performance |
| **Description** | The system should respond to user requests within acceptable time frames. |
| **Measurable Criteria** | - API responses should complete within 500ms under normal load. - Pages should render within 2 seconds on a standard broadband connection. - Search results should return within 1 second. - Dashboard should load within 3 seconds. |

---

## NFR-02: Security

| Field | Description |
|-------|-------------|
| **Requirement ID** | NFR-02 |
| **Category** | Security |
| **Description** | The system must protect user data and enforce access control. |
| **Measurable Criteria** | - All passwords must be hashed using bcrypt (minimum 12 rounds). - Authentication via JWT tokens with configurable expiration (default: 60 minutes). - Role-based access control enforced on every API endpoint. - SQL injection protection via ORM (SQLAlchemy parameterized queries). - CORS restricted to allowed origins. - No secrets committed to version control. - Input validation on both frontend and backend. |

---

## NFR-03: Usability

| Field | Description |
|-------|-------------|
| **Requirement ID** | NFR-03 |
| **Category** | Usability |
| **Description** | The system should be easy to use without training. |
| **Measurable Criteria** | - A new user can complete the demo flow (login → issue → return) within 5 minutes. - All forms display clear validation error messages. - Navigation is consistent and intuitive across all pages. - The system provides loading indicators for async operations. - Empty states provide helpful guidance. - Confirmation dialogs are shown before destructive actions. |

---

## NFR-04: Reliability

| Field | Description |
|-------|-------------|
| **Requirement ID** | NFR-04 |
| **Category** | Reliability |
| **Description** | The system should handle errors gracefully and maintain data integrity. |
| **Measurable Criteria** | - Database transactions ensure atomicity (e.g., issuing a book updates both transaction and inventory). - The system gracefully handles and displays errors without crashing. - No data corruption on concurrent operations. - API returns appropriate HTTP error codes with descriptive messages. |

---

## NFR-05: Maintainability

| Field | Description |
|-------|-------------|
| **Requirement ID** | NFR-05 |
| **Category** | Maintainability |
| **Description** | The codebase should be easy to understand, modify, and extend. |
| **Measurable Criteria** | - Layered architecture (API → Service → Repository → Database). - Separation of frontend and backend codebases. - Reusable UI components. - TypeScript for type safety on the frontend. - Pydantic schemas for data validation on the backend. - Meaningful file and function names. - Maximum function length: ~50 lines (guideline). - Configurable values (fine rate, borrow limit) are centralized, not hardcoded. |

---

## NFR-06: Scalability

| Field | Description |
|-------|-------------|
| **Requirement ID** | NFR-06 |
| **Category** | Scalability |
| **Description** | The architecture should support reasonable growth. |
| **Measurable Criteria** | - Database uses proper indexing for searchable columns. - Server-side pagination for list endpoints (default page size: 20). - Database abstraction layer allows switching from SQLite to PostgreSQL without code changes. - Stateless authentication (JWT) allows horizontal scaling of the backend. |

---

## NFR-07: Availability

| Field | Description |
|-------|-------------|
| **Requirement ID** | NFR-07 |
| **Category** | Availability |
| **Description** | The system should be available during expected usage hours. |
| **Measurable Criteria** | - For this academic project, availability is limited to the development/demo environment. - The application can be started with a single command per service (backend, frontend). - Docker Compose provides a one-command deployment option. |

---

## NFR-08: Portability

| Field | Description |
|-------|-------------|
| **Requirement ID** | NFR-08 |
| **Category** | Portability |
| **Description** | The system should run on different environments. |
| **Measurable Criteria** | - Configuration via environment variables (.env file). - Docker support for containerized deployment. - SQLite support for local development without PostgreSQL installation. - Works on Windows, macOS, and Linux development environments. |

---

## NFR-09: Compatibility

| Field | Description |
|-------|-------------|
| **Requirement ID** | NFR-09 |
| **Category** | Compatibility |
| **Description** | The frontend should work across modern browsers. |
| **Measurable Criteria** | - Supports latest versions of Chrome, Firefox, Edge, and Safari. - Responsive design supports screens ≥ 1024px width (desktop-first, tablet-compatible). |
