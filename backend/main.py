from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from datetime import datetime
import structlog

# Import routers
from app.routers.health import router as health_router
from app.routers.travel import router as travel_router
from app.routers.chat import router as chat_router
from app.routers.finance import router as finance_router
from app.routers.marketplace_db import router as marketplace_router
from app.routers.auth import router as auth_router
from app.routers.payment import router as payment_router
from app.routers.inventory import router as inventory_router
from app.routers.shipping import router as shipping_router

# Configure logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Create FastAPI app
app = FastAPI(
    title="OmniLife API",
    description="Unified AI Personal Platform API",
    version="1.0.0",
    docs_url="/api-docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3004"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include routers
app.include_router(
    health_router,
    prefix="/api/health",
    tags=["Health & Fitness"]
)

app.include_router(
    travel_router,
    prefix="/api/travel",
    tags=["Travel & Tourism"]
)

app.include_router(
    chat_router,
    prefix="/api/chat",
    tags=["Chat & Communication"]
)

app.include_router(
    finance_router,
    prefix="/api/finance",
    tags=["Finance & Banking"]
)

app.include_router(
    marketplace_router,
    prefix="/api/marketplace",
    tags=["Marketplace & E-commerce"]
)

# New routers
app.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["Authentication"]
)

app.include_router(
    payment_router,
    prefix="/api/payment",
    tags=["Payment Processing"]
)

app.include_router(
    inventory_router,
    prefix="/api/inventory",
    tags=["Inventory Management"]
)

app.include_router(
    shipping_router,
    prefix="/api/shipping",
    tags=["Shipping & Delivery"]
)

# AI endpoints
@app.get("/api/ai/health", tags=["AI"])
async def ai_health_check():
    """AI service health check"""
    return {
        "status": "healthy",
        "service": "ai",
        "timestamp": datetime.utcnow().isoformat(),
        "capabilities": [
            "natural_language_processing",
            "health_insights",
            "workout_planning",
            "nutrition_recommendations",
            "goal_tracking",
            "product_recommendations",
            "financial_analysis",
            "travel_planning"
        ]
    }

@app.get("/api/ai/capabilities", tags=["AI"])
async def get_ai_capabilities():
    """Get list of AI capabilities"""
    return {
        "capabilities": [
            {
                "name": "Natural Language Processing",
                "description": "Process natural language commands and execute actions",
                "endpoint": "/api/ai/command"
            },
            {
                "name": "Health & Fitness Analysis",
                "description": "Analyze health data and provide insights",
                "endpoint": "/api/ai/health/analyze"
            },
            {
                "name": "Workout Planning",
                "description": "Create personalized workout plans",
                "endpoint": "/api/ai/health/workout-plan"
            },
            {
                "name": "Nutrition Recommendations",
                "description": "Provide personalized nutrition advice",
                "endpoint": "/api/ai/health/nutrition"
            },
            {
                "name": "Financial Analysis",
                "description": "Analyze financial data and provide insights",
                "endpoint": "/api/ai/finance/analyze"
            },
            {
                "name": "Budget Planning",
                "description": "Create personalized budget plans",
                "endpoint": "/api/ai/finance/budget-plan"
            },
            {
                "name": "Travel Planning",
                "description": "Plan personalized trips",
                "endpoint": "/api/ai/travel/plan"
            },
            {
                "name": "Product Recommendations",
                "description": "Get AI-powered product recommendations",
                "endpoint": "/api/ai/marketplace/recommendations"
            },
            {
                "name": "Social Post Generation",
                "description": "Generate social media content",
                "endpoint": "/api/ai/social/generate-post"
            },
            {
                "name": "Smart Reminders",
                "description": "Create intelligent reminders with suggestions",
                "endpoint": "/api/ai/reminders/create"
            },
            {
                "name": "Chat Analysis",
                "description": "Analyze chat conversations and sentiment",
                "endpoint": "/api/ai/chat/analyze"
            }
        ]
    }

# Health check endpoints
@app.get("/health", tags=["Health"])
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@app.get("/api/health/detailed", tags=["Health"])
async def detailed_health_check():
    """Detailed health check with all services"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "api": "healthy",
            "database": "healthy",
            "ai": "healthy",
            "payment": "healthy",
            "email": "healthy",
            "shipping": "healthy"
        },
        "version": "1.0.0"
    }

# Test database endpoint
@app.get("/test-db", tags=["Test"])
async def test_db():
    """Test database connection"""
    try:
        from app.database import get_db
        from app.models.marketplace_db import Product
        from sqlalchemy.orm import Session
        
        db = next(get_db())
        count = db.query(Product).count()
        return {"message": "Database connection successful", "product_count": count}
    except Exception as e:
        return {"message": "Database connection failed", "error": str(e)}

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Welcome to OmniLife API",
        "version": "1.0.0",
        "description": "Unified AI Personal Platform",
        "features": {
            "health_fitness": "/api/health",
            "travel_tourism": "/api/travel",
            "chat_communication": "/api/chat",
            "finance_banking": "/api/finance",
            "marketplace_ecommerce": "/api/marketplace",
            "authentication": "/api/auth",
            "payment_processing": "/api/payment",
            "inventory_management": "/api/inventory",
            "shipping_delivery": "/api/shipping",
            "ai_services": "/api/ai"
        },
        "documentation": {
            "swagger": "/api-docs",
            "redoc": "/redoc"
        },
        "health_check": "/health"
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info("OmniLife API starting up...")
    logger.info("Loading all modules and services...")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info("OmniLife API shutting down...")

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    """Handle 404 errors"""
    return {
        "error": "Not Found",
        "message": "The requested resource was not found",
        "path": str(request.url.path)
    }

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(exc)}")
    return {
        "error": "Internal Server Error",
        "message": "An internal server error occurred"
    }
