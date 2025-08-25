from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import QueuePool
import os
import structlog
from contextlib import contextmanager

logger = structlog.get_logger()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL")
FORCE_SQLITE = os.getenv("FORCE_SQLITE", "false").lower() == "true"

# PostgreSQL configuration
POSTGRES_CONFIG = {
    "host": os.getenv("POSTGRES_HOST", "localhost"),
    "port": os.getenv("POSTGRES_PORT", "5432"),
    "database": os.getenv("POSTGRES_DB", "omnilife_marketplace"),
    "user": os.getenv("POSTGRES_USER", "postgres"),
    "password": os.getenv("POSTGRES_PASSWORD", ""),
    "sslmode": os.getenv("POSTGRES_SSLMODE", "prefer"),
}

# SQLite configuration (fallback)
SQLITE_DATABASE_URL = "sqlite:///./omnilife_marketplace.db"

def get_database_url():
    """Get the appropriate database URL based on configuration"""
    if FORCE_SQLITE:
        logger.info("Using SQLite database (forced)")
        return SQLITE_DATABASE_URL
    
    if DATABASE_URL:
        logger.info("Using DATABASE_URL from environment")
        return DATABASE_URL
    
    # Try to construct PostgreSQL URL
    if POSTGRES_CONFIG["password"]:
        postgres_url = f"postgresql://{POSTGRES_CONFIG['user']}:{POSTGRES_CONFIG['password']}@{POSTGRES_CONFIG['host']}:{POSTGRES_CONFIG['port']}/{POSTGRES_CONFIG['database']}"
        if POSTGRES_CONFIG["sslmode"] != "disable":
            postgres_url += f"?sslmode={POSTGRES_CONFIG['sslmode']}"
        logger.info("Using PostgreSQL database")
        return postgres_url
    
    logger.warning("No database configuration found, falling back to SQLite")
    return SQLITE_DATABASE_URL

# Database engine configuration
def create_database_engine():
    """Create database engine with appropriate configuration"""
    database_url = get_database_url()
    
    if database_url.startswith("sqlite"):
        # SQLite configuration
        engine = create_engine(
            database_url,
            connect_args={"check_same_thread": False},
            echo=os.getenv("SQL_ECHO", "false").lower() == "true"
        )
    else:
        # PostgreSQL configuration with connection pooling
        engine = create_engine(
            database_url,
            poolclass=QueuePool,
            pool_size=int(os.getenv("DB_POOL_SIZE", "10")),
            max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "20")),
            pool_pre_ping=True,
            pool_recycle=int(os.getenv("DB_POOL_RECYCLE", "3600")),
            echo=os.getenv("SQL_ECHO", "false").lower() == "true",
            # SSL configuration for production
            connect_args={
                "sslmode": POSTGRES_CONFIG["sslmode"],
                "application_name": "omnilife_marketplace"
            } if POSTGRES_CONFIG["sslmode"] != "disable" else {}
        )
    
    return engine

# Create engine and session
engine = create_database_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Metadata for migrations
metadata = MetaData()

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@contextmanager
def get_db_context():
    """Context manager for database sessions"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    try:
        # Import all models to ensure they are registered
        from app.models.marketplace_db import (
            Category, Product, Review, CartItem, WishlistItem, 
            Order, OrderItem, Return, InventoryLog, ShippingZone,
            ShippingRate, TaxRate, LoyaltyProgram, LoyaltyTransaction,
            AIRecommendation, PriceAlert, ProductComparison,
            RecentlyViewed, ProductQuestion, ProductAnswer
        )
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
        
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise

def check_db_connection():
    """Check database connection health"""
    try:
        with engine.connect() as connection:
            connection.execute("SELECT 1")
        logger.info("Database connection successful")
        return True
    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return False

def get_db_stats():
    """Get database statistics"""
    try:
        with engine.connect() as connection:
            # Get table counts
            tables = [
                "categories", "products", "reviews", "cart_items",
                "wishlist_items", "orders", "order_items", "returns"
            ]
            stats = {}
            
            for table in tables:
                result = connection.execute(f"SELECT COUNT(*) FROM {table}")
                stats[table] = result.scalar()
            
            return stats
    except Exception as e:
        logger.error(f"Error getting database stats: {e}")
        return {}

# Database migration utilities
def create_migration(description: str):
    """Create a new migration file"""
    import datetime
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"migration_{timestamp}_{description.lower().replace(' ', '_')}.py"
    
    migration_content = f'''"""
Migration: {description}
Created: {datetime.datetime.now().isoformat()}
"""

def upgrade(engine):
    """Upgrade database schema"""
    # Add your migration code here
    pass

def downgrade(engine):
    """Downgrade database schema"""
    # Add your rollback code here
    pass
'''
    
    migrations_dir = "migrations"
    if not os.path.exists(migrations_dir):
        os.makedirs(migrations_dir)
    
    with open(os.path.join(migrations_dir, filename), "w") as f:
        f.write(migration_content)
    
    logger.info(f"Migration file created: {filename}")
    return filename
