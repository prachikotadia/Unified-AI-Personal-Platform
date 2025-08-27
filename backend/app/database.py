from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL - use PostgreSQL in production, SQLite for development
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:password@localhost:5432/omnilife_marketplace"
)

# For development, use SQLite if FORCE_SQLITE is set or PostgreSQL is not available
if os.getenv("FORCE_SQLITE") or not DATABASE_URL.startswith("postgresql://"):
    # Use SQLite for development
    DATABASE_URL = "sqlite:///./omnilife_marketplace.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    # Try PostgreSQL
    try:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=300,
        )
    except Exception:
        # Fallback to SQLite
        DATABASE_URL = "sqlite:///./omnilife_marketplace.db"
        engine = create_engine(
            DATABASE_URL,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
