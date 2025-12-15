import os
import asyncio
from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.pool import StaticPool
from dotenv import load_dotenv
import structlog

load_dotenv()
logger = structlog.get_logger()

# Database URLs
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/omnilife_db"
)

ASYNC_DATABASE_URL = os.getenv(
    "ASYNC_DATABASE_URL",
    "postgresql+asyncpg://postgres:password@localhost:5432/omnilife_db"
)

# Fallback to SQLite if PostgreSQL is not available
SQLITE_URL = "sqlite:///./omnilife.db"

# Create engines
try:
    # Try PostgreSQL first
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=False
    )
    async_engine = create_async_engine(
        ASYNC_DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=False
    )
    logger.info("PostgreSQL database configured")
    USE_POSTGRES = True
except Exception as e:
    logger.warning(f"PostgreSQL not available: {e}. Falling back to SQLite")
    # Fallback to SQLite
    engine = create_engine(
        SQLITE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    async_engine = None
    USE_POSTGRES = False

# Create session factories
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Async dependency to get database session
async def get_async_db():
    if async_engine:
        async with AsyncSession(async_engine) as session:
            try:
                yield session
            finally:
                await session.close()
    else:
        # Fallback to sync session
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()

# Initialize database
def init_database():
    """Initialize the database with all tables"""
    try:
        if USE_POSTGRES:
            logger.info("Creating PostgreSQL tables...")
        else:
            logger.info("Creating SQLite tables...")
        
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
        raise

# Test database connection
def test_database_connection():
    """Test database connection"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            logger.info("Database connection successful")
            return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False

# Get database info
def get_database_info():
    """Get database information"""
    return {
        "type": "PostgreSQL" if USE_POSTGRES else "SQLite",
        "url": DATABASE_URL if USE_POSTGRES else SQLITE_URL,
        "connected": test_database_connection()
    }
