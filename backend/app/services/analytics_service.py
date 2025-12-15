import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.cache import redis_cache

logger = structlog.get_logger()

class AnalyticsService:
    """Analytics service for user behavior, feature usage, and business metrics"""
    
    def __init__(self):
        pass
    
    async def track_user_action(
        self,
        user_id: int,
        action: str,
        module: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Track user action"""
        try:
            event = {
                "user_id": user_id,
                "action": action,
                "module": module,
                "metadata": metadata or {},
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Store in cache/queue for processing
            today = datetime.utcnow().strftime("%Y%m%d")
            key = f"analytics_events_{today}"
            events = await redis_cache.get_cache(key) or []
            events.append(event)
            await redis_cache.set_cache(key, events, expire=86400 * 7)  # 7 days
            
        except Exception as e:
            logger.error(f"Error tracking action: {e}")
    
    async def get_user_analytics(
        self,
        user_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get user analytics"""
        try:
            if not start_date:
                start_date = datetime.utcnow() - timedelta(days=30)
            if not end_date:
                end_date = datetime.utcnow()
            
            analytics = {
                "user_id": user_id,
                "period": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat()
                },
                "modules_used": {},
                "actions_count": {},
                "most_active_day": None,
                "total_actions": 0
            }
            
            # Aggregate events from cache
            current_date = start_date
            while current_date <= end_date:
                date_key = current_date.strftime("%Y%m%d")
                events_key = f"analytics_events_{date_key}"
                events = await redis_cache.get_cache(events_key) or []
                
                user_events = [e for e in events if e.get("user_id") == user_id]
                
                for event in user_events:
                    module = event.get("module", "unknown")
                    action = event.get("action", "unknown")
                    
                    analytics["modules_used"][module] = analytics["modules_used"].get(module, 0) + 1
                    analytics["actions_count"][action] = analytics["actions_count"].get(action, 0) + 1
                    analytics["total_actions"] += 1
                
                current_date += timedelta(days=1)
            
            return analytics
            
        except Exception as e:
            logger.error(f"Error getting user analytics: {e}")
            return {}
    
    async def get_feature_usage_analytics(
        self,
        module: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get feature usage analytics"""
        try:
            if not start_date:
                start_date = datetime.utcnow() - timedelta(days=7)
            if not end_date:
                end_date = datetime.utcnow()
            
            analytics = {
                "module": module or "all",
                "period": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat()
                },
                "feature_usage": {},
                "user_count": set(),
                "total_actions": 0
            }
            
            # Aggregate events
            current_date = start_date
            while current_date <= end_date:
                date_key = current_date.strftime("%Y%m%d")
                events_key = f"analytics_events_{date_key}"
                events = await redis_cache.get_cache(events_key) or []
                
                for event in events:
                    event_module = event.get("module", "unknown")
                    if module and event_module != module:
                        continue
                    
                    action = event.get("action", "unknown")
                    feature_key = f"{event_module}.{action}"
                    
                    analytics["feature_usage"][feature_key] = analytics["feature_usage"].get(feature_key, 0) + 1
                    analytics["user_count"].add(event.get("user_id"))
                    analytics["total_actions"] += 1
                
                current_date += timedelta(days=1)
            
            analytics["user_count"] = len(analytics["user_count"])
            
            return analytics
            
        except Exception as e:
            logger.error(f"Error getting feature usage analytics: {e}")
            return {}
    
    async def get_performance_analytics(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get performance analytics"""
        try:
            # In production, collect from monitoring tools
            return {
                "average_response_time": 0.25,  # seconds
                "error_rate": 0.01,  # 1%
                "requests_per_minute": 100,
                "database_query_time": 0.05,
                "cache_hit_rate": 0.85
            }
            
        except Exception as e:
            logger.error(f"Error getting performance analytics: {e}")
            return {}
    
    async def get_business_metrics(
        self,
        db: Session,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Get business metrics"""
        try:
            if not start_date:
                start_date = datetime.utcnow() - timedelta(days=30)
            if not end_date:
                end_date = datetime.utcnow()
            
            # Get user counts
            try:
                from app.models.user import User
                total_users = db.query(User).count()
                active_users = db.query(User).filter(
                    and_(
                        User.last_login >= start_date,
                        User.is_active == True
                    )
                ).count()
            except ImportError:
                total_users = 0
                active_users = 0
            
            # Get feature usage
            feature_usage = await self.get_feature_usage_analytics(None, start_date, end_date)
            
            return {
                "total_users": total_users,
                "active_users": active_users,
                "user_growth": active_users / max(total_users, 1) * 100,
                "feature_usage": feature_usage.get("feature_usage", {}),
                "period": {
                    "start": start_date.isoformat(),
                    "end": end_date.isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting business metrics: {e}")
            return {}
    
    async def track_error(
        self,
        error_type: str,
        error_message: str,
        module: str,
        user_id: Optional[int] = None
    ):
        """Track errors"""
        try:
            error = {
                "type": error_type,
                "message": error_message,
                "module": module,
                "user_id": user_id,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            today = datetime.utcnow().strftime("%Y%m%d")
            key = f"analytics_errors_{today}"
            errors = await redis_cache.get_cache(key) or []
            errors.append(error)
            await redis_cache.set_cache(key, errors, expire=86400 * 30)  # 30 days
            
        except Exception as e:
            logger.error(f"Error tracking error: {e}")

# Global service instance
analytics_service = AnalyticsService()

