from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./omnilife.db"
    
    # JWT Settings
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3001,http://localhost:3000"
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    @property
    def allowed_origins_list(self) -> list:
        """Convert ALLOWED_ORIGINS string to list"""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    model_config = {
        "env_file": ".env"
    }

settings = Settings()
