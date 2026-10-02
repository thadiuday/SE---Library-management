import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Library Management System API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    SECRET_KEY: str = os.getenv("JWT_SECRET", "super-secret-development-key-please-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days for dev convenience
    
    # SQLite URL by default
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./library.db")
    
    # Library Config
    FINE_PER_DAY: float = 5.0
    MAX_BORROW_LIMIT: int = 5
    LOAN_PERIOD_DAYS: int = 14

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
