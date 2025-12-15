from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta
import jwt
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv
import structlog

from app.database import get_db, engine, init_db
from app.cache import redis_cache
from app.models import user
from app.models import data_models
from app.schemas import auth_schemas
from app.schemas import data_schemas
from app.services import auth_service
from app.services import data_service
from app.config import settings

load_dotenv()

logger = structlog.get_logger()

# AI services - optional, import with error handling
try:
    from app.services.ai_insights_service import ai_insights_service
except ImportError as e:
    logger.warning(f"AI services not available: {e}")
    ai_insights_service = None

# Create database tables
user.Base.metadata.create_all(bind=engine)
data_models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="OmniLife Backend API",
    description="Backend API for OmniLife - AI-Powered Personal Platform",
    version="1.0.0"
)

# CORS middleware
# In development, allow all localhost origins for easier testing
if settings.ENVIRONMENT == "development" or settings.DEBUG:
    # Allow all origins in development for easier testing
    logger.info("CORS: Allowing all origins in development mode")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins in development
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
else:
    # Production: use configured origins
    allowed_origins = settings.allowed_origins_list
    # Add common localhost variations
    allowed_origins.extend([
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ])
    # Remove duplicates
    allowed_origins = list(set(allowed_origins))
    logger.info(f"CORS: Allowing origins: {allowed_origins}")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

# Security
security = HTTPBearer()

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    try:
        # Initialize Redis connection (optional)
        await redis_cache.connect()
        logger.info("Redis connection attempted")
        
        # Initialize database
        init_db()
        logger.info("Database initialized successfully")
        
    except Exception as e:
        logger.error(f"Startup error: {e}")
        raise

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    try:
        await redis_cache.disconnect()
        logger.info("Redis disconnected successfully")
    except Exception as e:
        logger.error(f"Shutdown error: {e}")

# Dependency to get current user from JWT
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[user.User]:
    """Get current user from JWT token"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        
        return auth_service.get_user_by_id(db, int(user_id))
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None

# Dependency to get current user or None (for guest mode)
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[user.User]:
    """Get current user from JWT token or None for guest mode"""
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        
        return auth_service.get_user_by_id(db, int(user_id))
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        db = next(get_db())
        db.execute(text("SELECT 1"))
        db.close()
        
        # Check Redis connection (optional)
        redis_status = "disconnected"
        if redis_cache.aioredis_client:
            try:
                await redis_cache.aioredis_client.ping()
                redis_status = "connected"
            except:
                redis_status = "disconnected"
        
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "service": "main-api",
            "version": "1.0.0",
            "database": "connected",
            "redis": redis_status
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service unhealthy"
        )

# Authentication endpoints
@app.post("/auth/signup", response_model=auth_schemas.UserResponse)
async def signup(user_data: auth_schemas.UserCreate, db: Session = Depends(get_db)):
    """Create a new user account"""
    try:
        return auth_service.create_user(db, user_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/login", response_model=auth_schemas.LoginResponse)
async def login(login_data: auth_schemas.UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token"""
    try:
        return auth_service.authenticate_user(db, login_data)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/auth/me", response_model=auth_schemas.UserResponse)
async def get_current_user_profile(current_user: user.User = Depends(get_current_user)):
    """Get current user profile"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user

@app.post("/auth/guest-login", response_model=auth_schemas.LoginResponse)
async def guest_login(db: Session = Depends(get_db)):
    """Create a temporary guest user account"""
    try:
        return auth_service.create_guest_user(db)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Data endpoints (with caching)
@app.get("/data/fitness/dashboard")
async def get_fitness_dashboard(
    current_user: Optional[user.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get fitness dashboard data with caching"""
    try:
        # Try to get from cache first
        cache_key = f"fitness_dashboard_{current_user.id if current_user else 'guest'}"
        cached_data = await redis_cache.get_cache(cache_key)
        
        if cached_data:
            return cached_data
        
        # Get fresh data
        data = data_service.get_user_fitness_data(db, current_user.id if current_user else None)
        
        # Cache the data for 5 minutes
        await redis_cache.set_cache(cache_key, data, expire=300)
        
        return data
    except Exception as e:
        logger.error(f"Error getting fitness dashboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get fitness data")

@app.get("/data/finance/dashboard")
async def get_finance_dashboard(
    current_user: Optional[user.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get finance dashboard data with caching"""
    try:
        # Try to get from cache first
        cache_key = f"finance_dashboard_{current_user.id if current_user else 'guest'}"
        cached_data = await redis_cache.get_cache(cache_key)
        
        if cached_data:
            return cached_data
        
        # Get fresh data
        data = data_service.get_user_finance_data(db, current_user.id if current_user else None)
        
        # Cache the data for 5 minutes
        await redis_cache.set_cache(cache_key, data, expire=300)
        
        return data
    except Exception as e:
        logger.error(f"Error getting finance dashboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to get finance data")

@app.get("/data/fitness/goals")
async def get_fitness_goals(
    current_user: Optional[user.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get fitness goals"""
    try:
        data = data_service.get_user_fitness_goals(db, current_user.id if current_user else None)
        return data
    except Exception as e:
        logger.error(f"Error getting fitness goals: {e}")
        raise HTTPException(status_code=500, detail="Failed to get fitness goals")

@app.get("/data/finance/accounts")
async def get_finance_accounts(
    current_user: Optional[user.User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get finance accounts"""
    try:
        data = data_service.get_user_finance_accounts(db, current_user.id if current_user else None)
        return data
    except Exception as e:
        logger.error(f"Error getting finance accounts: {e}")
        raise HTTPException(status_code=500, detail="Failed to get finance accounts")

# Protected endpoints (require authentication)
@app.post("/data/fitness/goals", response_model=data_schemas.FitnessGoal)
async def create_fitness_goal(
    goal_data: data_schemas.FitnessGoalCreate,
    current_user: user.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new fitness goal"""
    try:
        goal = data_service.create_fitness_goal(db, goal_data, current_user.id)
        
        # Invalidate cache
        await redis_cache.invalidate_cache("fitness_dashboard_*")
        
        return goal
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/data/finance/accounts", response_model=data_schemas.FinanceAccount)
async def create_finance_account(
    account_data: data_schemas.FinanceAccountCreate,
    current_user: user.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new finance account"""
    try:
        account = data_service.create_finance_account(db, account_data, current_user.id)
        
        # Invalidate cache
        await redis_cache.invalidate_cache("finance_dashboard_*")
        
        return account
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Include routers
from app.routers.ai_insights import router as ai_insights_router
from app.routers.ai import router as ai_router
from app.routers.finance import router as finance_router
from app.routers.marketplace_db import router as marketplace_router
from app.routers.travel import router as travel_router
from app.routers.health import router as fitness_router
from app.routers.dashboard import router as dashboard_router

app.include_router(ai_insights_router)
app.include_router(ai_router, prefix="/api/ai", tags=["ai"])
app.include_router(finance_router, prefix="/api/finance", tags=["finance"])
app.include_router(marketplace_router, prefix="/api/marketplace", tags=["marketplace"])
app.include_router(travel_router, prefix="/api/travel", tags=["travel"])
app.include_router(fitness_router, prefix="/api/fitness", tags=["fitness"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["dashboard"])

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
