from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Dict, Any, Optional
import structlog
from app.services.analytics_service import analytics_service

logger = structlog.get_logger()
router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.post("/session/start")
async def start_session(
    user_id: str,
    device_type: str = "desktop",
    browser: str = "unknown",
    os: str = "unknown",
    ip_address: str = "unknown",
    user_agent: str = "unknown"
):
    """Start a new user session"""
    try:
        session_id = await analytics_service.start_session(
            user_id=user_id,
            device_type=device_type,
            browser=browser,
            os=os,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        if session_id:
            return {"session_id": session_id, "message": "Session started successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to start session")
            
    except Exception as e:
        logger.error(f"Error starting session: {e}")
        raise HTTPException(status_code=500, detail="Failed to start session")

@router.post("/session/end")
async def end_session(session_id: str):
    """End a user session"""
    try:
        success = await analytics_service.end_session(session_id)
        if success:
            return {"message": "Session ended successfully"}
        else:
            raise HTTPException(status_code=404, detail="Session not found or already ended")
            
    except Exception as e:
        logger.error(f"Error ending session: {e}")
        raise HTTPException(status_code=500, detail="Failed to end session")

@router.post("/page-view")
async def track_page_view(
    session_id: str,
    user_id: str,
    page_url: str,
    page_title: str = "",
    referrer: str = "",
    time_spent: int = 0,
    scroll_depth: int = 0
):
    """Track a page view"""
    try:
        success = await analytics_service.track_page_view(
            session_id=session_id,
            user_id=user_id,
            page_url=page_url,
            page_title=page_title,
            referrer=referrer,
            time_spent=time_spent,
            scroll_depth=scroll_depth
        )
        
        if success:
            return {"message": "Page view tracked successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to track page view")
            
    except Exception as e:
        logger.error(f"Error tracking page view: {e}")
        raise HTTPException(status_code=500, detail="Failed to track page view")

@router.post("/interaction")
async def track_interaction(
    session_id: str,
    user_id: str,
    event_type: str,
    event_data: Optional[Dict[str, Any]] = None,
    element_id: str = "",
    element_class: str = "",
    element_text: str = ""
):
    """Track a user interaction"""
    try:
        success = await analytics_service.track_interaction(
            session_id=session_id,
            user_id=user_id,
            event_type=event_type,
            event_data=event_data,
            element_id=element_id,
            element_class=element_class,
            element_text=element_text
        )
        
        if success:
            return {"message": "Interaction tracked successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to track interaction")
            
    except Exception as e:
        logger.error(f"Error tracking interaction: {e}")
        raise HTTPException(status_code=500, detail="Failed to track interaction")

@router.post("/marketplace-event")
async def track_marketplace_event(
    user_id: str,
    event_type: str,
    session_id: Optional[str] = None,
    product_id: Optional[int] = None,
    category_id: Optional[int] = None,
    search_query: Optional[str] = None,
    price_range: Optional[str] = None
):
    """Track marketplace-specific events"""
    try:
        success = await analytics_service.track_marketplace_event(
            user_id=user_id,
            event_type=event_type,
            session_id=session_id,
            product_id=product_id,
            category_id=category_id,
            search_query=search_query,
            price_range=price_range
        )
        
        if success:
            return {"message": "Marketplace event tracked successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to track marketplace event")
            
    except Exception as e:
        logger.error(f"Error tracking marketplace event: {e}")
        raise HTTPException(status_code=500, detail="Failed to track marketplace event")

@router.post("/conversion")
async def track_conversion(
    user_id: str,
    event_type: str,
    order_id: str,
    order_value: float,
    products: Optional[List[Dict[str, Any]]] = None,
    session_id: Optional[str] = None
):
    """Track conversion events (purchases, etc.)"""
    try:
        success = await analytics_service.track_conversion(
            user_id=user_id,
            event_type=event_type,
            order_id=order_id,
            order_value=order_value,
            products=products,
            session_id=session_id
        )
        
        if success:
            return {"message": "Conversion tracked successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to track conversion")
            
    except Exception as e:
        logger.error(f"Error tracking conversion: {e}")
        raise HTTPException(status_code=500, detail="Failed to track conversion")

@router.get("/user/{user_id}")
async def get_user_analytics(
    user_id: str,
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze")
):
    """Get analytics for a specific user"""
    try:
        analytics = await analytics_service.get_user_analytics(user_id, days)
        return analytics
        
    except Exception as e:
        logger.error(f"Error getting user analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user analytics")

@router.get("/platform")
async def get_platform_analytics(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze")
):
    """Get platform-wide analytics"""
    try:
        analytics = await analytics_service.get_platform_analytics(days)
        return analytics
        
    except Exception as e:
        logger.error(f"Error getting platform analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to get platform analytics")

@router.get("/real-time")
async def get_real_time_stats():
    """Get real-time statistics"""
    try:
        stats = await analytics_service.get_real_time_stats()
        return stats
        
    except Exception as e:
        logger.error(f"Error getting real-time stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get real-time stats")

@router.get("/insights")
async def generate_insights(user_id: Optional[str] = None):
    """Generate actionable insights from analytics data"""
    try:
        insights = await analytics_service.generate_insights(user_id)
        return {"insights": insights}
        
    except Exception as e:
        logger.error(f"Error generating insights: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate insights")
