# UML Diagrams — Library Management System

This document contains all UML diagrams using Mermaid syntax for reproducibility.

---

## 1. Class Diagram

```mermaid
classDiagram
    class User {
        +int id
        +string email
        +string password_hash
        +string role
        +bool is_active
        +datetime created_at
        +datetime updated_at
        +verify_password(password) bool
    }

    class Member {
        +int id
        +int user_id
        +string name
        +string email
        +string phone
        +string student_id
        +string department
        +int year
        +string status
        +datetime created_at
        +datetime updated_at
        +is_active() bool
        +get_active_borrows_count() int
    }

    class Book {
        +int id
        +string isbn
        +string title
        +string author
        +int category_id
        +string publisher
        +int publication_year
        +string description
        +int total_copies
        +int available_copies
        +string shelf_location
        +datetime created_at
        +datetime updated_at
        +is_available() bool
        +decrement_available() void
        +increment_available() void
    }

    class Category {
        +int id
        +string name
        +string description
        +datetime created_at
        +datetime updated_at
    }

    class BorrowTransaction {
        +int id
        +int member_id
        +int book_id
        +date issue_date
        +date due_date
        +date return_date
        +string status
        +datetime created_at
        +datetime updated_at
        +is_overdue() bool
        +get_overdue_days() int
        +mark_returned(return_date) void
    }

    class Fine {
        +int id
        +int transaction_id
        +decimal amount
        +int overdue_days
        +string status
        +datetime created_at
        +datetime updated_at
        +mark_paid() void
    }

    class AuthService {
        +authenticate(email, password) Token
        +create_token(user_id, role) string
        +verify_token(token) UserPayload
        +hash_password(password) string
    }

    class BookService {
        +create_book(data) Book
        +update_book(id, data) Book
        +delete_book(id) void
        +get_books(filters) PaginatedList
        +get_book(id) Book
        +check_availability(book_id) bool
    }

    class BorrowService {
        +issue_book(member_id, book_id) BorrowTransaction
        +return_book(transaction_id) ReturnResult
        +get_transactions(filters) PaginatedList
        +check_eligibility(member_id) bool
    }

    class FineService {
        +calculate_fine(overdue_days) decimal
        +create_fine(transaction_id, overdue_days) Fine
        +get_fines(filters) PaginatedList
        +mark_paid(fine_id) Fine
    }

    User "1" -- "0..1" Member : has profile
    Category "1" -- "*" Book : contains
    Member "1" -- "*" BorrowTransaction : borrows
    Book "1" -- "*" BorrowTransaction : is borrowed in
    BorrowTransaction "1" -- "0..1" Fine : may incur

    BookService --> Book : manages
    BorrowService --> BorrowTransaction : manages
    BorrowService --> BookService : checks availability
    BorrowService --> FineService : calculates fines
    FineService --> Fine : manages
    AuthService --> User : authenticates
```

---

## 2. Activity Diagram — Issue Book

```mermaid
flowchart TD
    Start([Start]) --> SelectMember[Select Member]
    SelectMember --> ValidateMember{Member Active?}
    ValidateMember -->|No| MemberError[Show: Member is inactive]
    MemberError --> End1([End])
    ValidateMember -->|Yes| CheckLimit{Borrow Limit<br/>Exceeded?}
    CheckLimit -->|Yes| LimitError[Show: Borrow limit reached]
    LimitError --> End2([End])
    CheckLimit -->|No| SelectBook[Select Book]
    SelectBook --> CheckAvailability{Available<br/>Copies > 0?}
    CheckAvailability -->|No| AvailError[Show: No copies available]
    AvailError --> End3([End])
    CheckAvailability -->|Yes| CreateTransaction[Create Borrow Transaction]
    CreateTransaction --> SetDates[Set Issue Date = Today<br/>Set Due Date = Today + Loan Period]
    SetDates --> DecrementCopies[Decrement Available Copies]
    DecrementCopies --> ShowConfirmation[Show Confirmation<br/>with Due Date]
    ShowConfirmation --> End4([End])
```

---

## 3. Activity Diagram — Return Book

```mermaid
flowchart TD
    Start([Start]) --> FindTransaction[Find Active Transaction]
    FindTransaction --> TransExists{Transaction<br/>Found?}
    TransExists -->|No| NotFound[Show: Transaction not found]
    NotFound --> End1([End])
    TransExists -->|Yes| CheckReturned{Already<br/>Returned?}
    CheckReturned -->|Yes| AlreadyReturned[Show: Already returned]
    AlreadyReturned --> End2([End])
    CheckReturned -->|No| SetReturnDate[Set Return Date = Today]
    SetReturnDate --> CalcOverdue{Return Date ><br/>Due Date?}
    CalcOverdue -->|No| NoFine[Fine = 0]
    CalcOverdue -->|Yes| CalcFine[Calculate Overdue Days<br/>Fine = Days × Fine Rate]
    CalcFine --> StoreFine[Store Fine Record]
    StoreFine --> MarkReturned[Mark Transaction as Returned]
    NoFine --> MarkReturned
    MarkReturned --> IncrementCopies[Increment Available Copies]
    IncrementCopies --> ShowSummary[Show Return Summary<br/>Including Fine if any]
    ShowSummary --> End3([End])
```

---

## 4. Activity Diagram — Login

```mermaid
flowchart TD
    Start([Start]) --> EnterCredentials[Enter Email & Password]
    EnterCredentials --> ValidateInput{Fields<br/>Valid?}
    ValidateInput -->|No| ShowValidation[Show Validation Errors]
    ShowValidation --> EnterCredentials
    ValidateInput -->|Yes| SendRequest[Send Login Request to API]
    SendRequest --> CheckCredentials{Credentials<br/>Valid?}
    CheckCredentials -->|No| ShowError[Show: Invalid email or password]
    ShowError --> EnterCredentials
    CheckCredentials -->|Yes| CheckActive{Account<br/>Active?}
    CheckActive -->|No| ShowInactive[Show: Account is inactive]
    ShowInactive --> End1([End])
    CheckActive -->|Yes| GenerateToken[Generate JWT Token]
    GenerateToken --> StoreToken[Store Token in Client]
    StoreToken --> CheckRole{User Role?}
    CheckRole -->|Admin| AdminDash[Redirect to Admin Dashboard]
    CheckRole -->|Student| StudentDash[Redirect to Student Dashboard]
    AdminDash --> End2([End])
    StudentDash --> End3([End])
```

---

## 5. Activity Diagram — Search Book

```mermaid
flowchart TD
    Start([Start]) --> EnterQuery[Enter Search Query / Filters]
    EnterQuery --> SendSearch[Send Search Request to API]
    SendSearch --> QueryDB[Query Database with Filters]
    QueryDB --> Results{Results<br/>Found?}
    Results -->|No| ShowEmpty[Show: No books found]
    ShowEmpty --> End1([End])
    Results -->|Yes| DisplayResults[Display Paginated Results]
    DisplayResults --> UserAction{User Action?}
    UserAction -->|View Details| ShowDetails[Navigate to Book Details]
    UserAction -->|Next Page| ChangePage[Load Next Page]
    UserAction -->|Refine Search| EnterQuery
    UserAction -->|Done| End2([End])
    ShowDetails --> End3([End])
    ChangePage --> QueryDB
```

---

## 6. Sequence Diagram — Login

```mermaid
sequenceDiagram
    actor U as User
    participant FE as React Frontend
    participant API as FastAPI Router
    participant SVC as AuthService
    participant DB as Database

    U->>FE: Enter email & password
    FE->>FE: Validate form fields
    FE->>API: POST /api/auth/login {email, password}
    API->>SVC: authenticate(email, password)
    SVC->>DB: SELECT user WHERE email = ?
    DB-->>SVC: User record (or null)

    alt User not found
        SVC-->>API: raise 401 Unauthorized
        API-->>FE: 401 {detail: "Invalid credentials"}
        FE-->>U: Show error message
    else User found
        SVC->>SVC: verify_password(password, hash)
        alt Password invalid
            SVC-->>API: raise 401 Unauthorized
            API-->>FE: 401 {detail: "Invalid credentials"}
            FE-->>U: Show error message
        else Password valid
            alt Account inactive
                SVC-->>API: raise 403 Forbidden
                API-->>FE: 403 {detail: "Account inactive"}
                FE-->>U: Show error message
            else Account active
                SVC->>SVC: create_token(user_id, role)
                SVC-->>API: {access_token, role}
                API-->>FE: 200 {access_token, role, user_id}
                FE->>FE: Store token in localStorage
                FE-->>U: Redirect to dashboard
            end
        end
    end
```

---

## 7. Sequence Diagram — Issue Book

```mermaid
sequenceDiagram
    actor A as Admin
    participant FE as React Frontend
    participant API as FastAPI Router
    participant BS as BorrowService
    participant MR as MemberRepo
    participant BR as BookRepo
    participant TR as TransactionRepo
    participant DB as Database

    A->>FE: Select member & book, click "Issue"
    FE->>API: POST /api/borrow {member_id, book_id}
    API->>BS: issue_book(member_id, book_id)

    BS->>MR: get_member(member_id)
    MR->>DB: SELECT member WHERE id = ?
    DB-->>MR: Member record
    MR-->>BS: Member

    alt Member inactive
        BS-->>API: raise 400 "Member is inactive"
        API-->>FE: 400 error
        FE-->>A: Show error
    end

    BS->>TR: count_active_borrows(member_id)
    TR->>DB: SELECT COUNT(*) WHERE member_id = ? AND status = 'issued'
    DB-->>TR: Count
    TR-->>BS: active_count

    alt Limit exceeded
        BS-->>API: raise 400 "Borrow limit exceeded"
        API-->>FE: 400 error
        FE-->>A: Show error
    end

    BS->>BR: get_book(book_id)
    BR->>DB: SELECT book WHERE id = ?
    DB-->>BR: Book record
    BR-->>BS: Book

    alt No copies available
        BS-->>API: raise 400 "No copies available"
        API-->>FE: 400 error
        FE-->>A: Show error
    end

    BS->>BS: Calculate due_date = today + loan_period
    BS->>TR: create_transaction(member_id, book_id, issue_date, due_date)
    TR->>DB: INSERT INTO borrow_transactions
    DB-->>TR: Transaction record
    BS->>BR: decrement_available(book_id)
    BR->>DB: UPDATE books SET available_copies = available_copies - 1
    DB-->>BR: OK

    BS-->>API: Transaction with details
    API-->>FE: 201 {transaction data}
    FE-->>A: Show confirmation with due date
```

---

## 8. Sequence Diagram — Return Book

```mermaid
sequenceDiagram
    actor A as Admin
    participant FE as React Frontend
    participant API as FastAPI Router
    participant BS as BorrowService
    participant FS as FineService
    participant TR as TransactionRepo
    participant BR as BookRepo
    participant FR as FineRepo
    participant DB as Database

    A->>FE: Select transaction, click "Return"
    FE->>API: POST /api/return/{transaction_id}
    API->>BS: return_book(transaction_id)

    BS->>TR: get_transaction(transaction_id)
    TR->>DB: SELECT transaction WHERE id = ?
    DB-->>TR: Transaction record
    TR-->>BS: Transaction

    alt Not found
        BS-->>API: raise 404 "Transaction not found"
        API-->>FE: 404 error
        FE-->>A: Show error
    end

    alt Already returned
        BS-->>API: raise 400 "Already returned"
        API-->>FE: 400 error
        FE-->>A: Show error
    end

    BS->>BS: return_date = today
    BS->>BS: overdue_days = max(0, return_date - due_date)

    alt overdue_days > 0
        BS->>FS: calculate_fine(overdue_days)
        FS-->>BS: fine_amount
        BS->>FR: create_fine(transaction_id, amount, overdue_days)
        FR->>DB: INSERT INTO fines
        DB-->>FR: Fine record
    end

    BS->>TR: mark_returned(transaction_id, return_date)
    TR->>DB: UPDATE transaction SET status='returned', return_date=?
    DB-->>TR: OK

    BS->>BR: increment_available(book_id)
    BR->>DB: UPDATE books SET available_copies = available_copies + 1
    DB-->>BR: OK

    BS-->>API: {transaction, fine}
    API-->>FE: 200 {transaction, fine or null}
    FE-->>A: Show return summary with fine
```

---

## 9. Sequence Diagram — Search Books

```mermaid
sequenceDiagram
    actor U as User
    participant FE as React Frontend
    participant API as FastAPI Router
    participant SVC as BookService
    participant REPO as BookRepo
    participant DB as Database

    U->>FE: Type search query / select filters
    FE->>FE: Debounce input (300ms)
    FE->>API: GET /api/books?search=python&category_id=1&page=1
    API->>SVC: get_books(search, category_id, page)
    SVC->>REPO: find_books(filters, pagination)
    REPO->>DB: SELECT books WHERE title LIKE ? OR author LIKE ? ...
    DB-->>REPO: Results + total count
    REPO-->>SVC: PaginatedResult
    SVC-->>API: PaginatedResult
    API-->>FE: 200 {items, total, page, page_size, total_pages}
    FE-->>U: Display book list with pagination
```

---

## 10. Component Diagram

```mermaid
graph TB
    subgraph "Frontend Components"
        App[App.tsx]
        Auth[AuthProvider]
        Router[Router]

        subgraph "Admin Pages"
            AD[AdminDashboard]
            BL[BookList]
            BF[BookForm]
            ML[MemberList]
            MF[MemberForm]
            TL[TransactionList]
            IB[IssueBook]
            FL[FineList]
        end

        subgraph "Student Pages"
            SD[StudentDashboard]
            SB[StudentBooks]
            SBR[StudentBorrowed]
            SH[StudentHistory]
            SP[StudentProfile]
        end

        subgraph "Shared Components"
            TBL[DataTable]
            SRC[SearchBar]
            MOD[Modal]
            LOAD[LoadingSpinner]
            STAT[StatCard]
            PAG[Pagination]
        end
    end

    App --> Auth
    Auth --> Router
    Router --> AD & BL & BF & ML & MF & TL & IB & FL
    Router --> SD & SB & SBR & SH & SP
    AD & BL & ML & TL & FL --> TBL
    BL & ML & SB --> SRC
    BL & ML & TL --> PAG
    AD & SD --> STAT
```
