from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, books, categories, members, transactions, settings as settings_api
from app.database.database import Base, engine
from app.core.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, configure specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(categories.router, prefix=f"{settings.API_V1_STR}/categories", tags=["categories"])
app.include_router(books.router, prefix=f"{settings.API_V1_STR}/books", tags=["books"])
app.include_router(members.router, prefix=f"{settings.API_V1_STR}/members", tags=["members"])
app.include_router(transactions.router, prefix=f"{settings.API_V1_STR}/transactions", tags=["transactions"])
app.include_router(settings_api.router, prefix=f"{settings.API_V1_STR}/settings", tags=["settings"])

@app.get("/")
def root():
    return {"message": "Welcome to Library Management System API"}
