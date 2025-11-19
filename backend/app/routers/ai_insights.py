from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
import structlog

from app.database import get_db
from app.middleware.auth_middleware import get_current_user_optional
from app.models.user import UserResponse
from app.services.ai_insights_service import ai_insights_service

logger = structlog.get_logger()

router = APIRouter(prefix="/ai-insights", tags=["AI Insights"])

@router.get("/generate")
async def generate_ai_insights(
    module: Optional[str] = Query(None, description="Module to generate insights for (finance, fitness, travel, marketplace)"),
    count: int = Query(3, ge=1, le=10, description="Number of insights to generate"),
    current_user: Optional[UserResponse] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Generate new AI insights for the user"""
    try:
        user_id = current_user.id if current_user else 1  # Default to user 1 for demo
        
        # Generate dynamic insights
        insights = await ai_insights_service.generate_dynamic_insights(
            user_id=user_id,
            module=module,
            count=count
        )
        
        logger.info(f"Generated {len(insights)} AI insights for user {user_id}")
        
        return {
            "success": True,
            "insights": insights,
            "count": len(insights),
            "module": module or "all",
            "timestamp": insights[0]["timestamp"] if insights else None
        }
        
    except Exception as e:
        logger.error(f"Error generating AI insights: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI insights")

@router.get("/refresh")
async def refresh_ai_insights(
    module: Optional[str] = Query(None, description="Module to refresh insights for"),
    current_user: Optional[UserResponse] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Refresh AI insights (same as generate but with different endpoint name)"""
    try:
        user_id = current_user.id if current_user else 1
        
        # Generate fresh insights
        insights = await ai_insights_service.generate_dynamic_insights(
            user_id=user_id,
            module=module,
            count=3
        )
        
        logger.info(f"Refreshed AI insights for user {user_id}")
        
        return {
            "success": True,
            "insights": insights,
            "refreshed": True,
            "module": module or "all",
            "timestamp": insights[0]["timestamp"] if insights else None
        }
        
    except Exception as e:
        logger.error(f"Error refreshing AI insights: {e}")
        raise HTTPException(status_code=500, detail="Failed to refresh AI insights")

@router.get("/finance")
async def get_finance_insights(
    count: int = Query(3, ge=1, le=10, description="Number of insights to generate"),
    current_user: Optional[UserResponse] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Generate finance-specific AI insights"""
    try:
        user_id = current_user.id if current_user else 1
        
        insights = await ai_insights_service.generate_dynamic_insights(
            user_id=user_id,
            module="finance",
            count=count
        )
        
        return {
            "success": True,
            "insights": insights,
            "module": "finance",
            "count": len(insights)
        }
        
    except Exception as e:
        logger.error(f"Error generating finance insights: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate finance insights")

@router.get("/fitness")
async def get_fitness_insights(
    count: int = Query(3, ge=1, le=10, description="Number of insights to generate"),
    current_user: Optional[UserResponse] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Generate fitness-specific AI insights"""
    try:
        user_id = current_user.id if current_user else 1
        
        insights = await ai_insights_service.generate_dynamic_insights(
            user_id=user_id,
            module="fitness",
            count=count
        )
        
        return {
            "success": True,
            "insights": insights,
            "module": "fitness",
            "count": len(insights)
        }
        
    except Exception as e:
        logger.error(f"Error generating fitness insights: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate fitness insights")

@router.get("/travel")
async def get_travel_insights(
    count: int = Query(3, ge=1, le=10, description="Number of insights to generate"),
    current_user: Optional[UserResponse] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Generate travel-specific AI insights"""
    try:
        user_id = current_user.id if current_user else 1
        
        insights = await ai_insights_service.generate_dynamic_insights(
            user_id=user_id,
            module="travel",
            count=count
        )
        
        return {
            "success": True,
            "insights": insights,
            "module": "travel",
            "count": len(insights)
        }
        
    except Exception as e:
        logger.error(f"Error generating travel insights: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate travel insights")

@router.get("/marketplace")
async def get_marketplace_insights(
    count: int = Query(3, ge=1, le=10, description="Number of insights to generate"),
    current_user: Optional[UserResponse] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Generate marketplace-specific AI insights"""
    try:
        user_id = current_user.id if current_user else 1
        
        insights = await ai_insights_service.generate_dynamic_insights(
            user_id=user_id,
            module="marketplace",
            count=count
        )
        
        return {
            "success": True,
            "insights": insights,
            "module": "marketplace",
            "count": len(insights)
        }
        
    except Exception as e:
        logger.error(f"Error generating marketplace insights: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate marketplace insights")

@router.get("/history")
async def get_insights_history(
    module: Optional[str] = Query(None, description="Module to get history for"),
    limit: int = Query(10, ge=1, le=50, description="Number of historical insights to retrieve"),
    current_user: Optional[UserResponse] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Get user's AI insights history"""
    try:
        user_id = current_user.id if current_user else 1
        
        history = await ai_insights_service.get_insights_history(
            user_id=user_id,
            module=module,
            limit=limit
        )
        
        return {
            "success": True,
            "history": history,
            "module": module or "all",
            "count": len(history)
        }
        
    except Exception as e:
        logger.error(f"Error getting insights history: {e}")
        raise HTTPException(status_code=500, detail="Failed to get insights history")

@router.get("/demo")
async def get_demo_insights():
    """Get demo AI insights without authentication"""
    try:
        # Generate demo insights
        insights = await ai_insights_service.generate_dynamic_insights(
            user_id=1,
            module=None,
            count=3
        )
        
        return {
            "success": True,
            "insights": insights,
            "demo": True,
            "count": len(insights)
        }
        
    except Exception as e:
        logger.error(f"Error generating demo insights: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate demo insights")

@router.get("/modules")
async def get_available_modules():
    """Get available modules for AI insights"""
    return {
        "success": True,
        "modules": {
            "finance": {
                "name": "Finance",
                "categories": ["spending_patterns", "savings", "investments", "budget"],
                "description": "Financial insights and recommendations"
            },
            "fitness": {
                "name": "Fitness",
                "categories": ["workout_performance", "goals", "nutrition", "recovery"],
                "description": "Fitness and health insights"
            },
            "travel": {
                "name": "Travel",
                "categories": ["destinations", "budget", "planning"],
                "description": "Travel planning and recommendations"
            },
            "marketplace": {
                "name": "Marketplace",
                "categories": ["purchases", "recommendations", "savings"],
                "description": "Shopping and product insights"
            }
        }
    }
