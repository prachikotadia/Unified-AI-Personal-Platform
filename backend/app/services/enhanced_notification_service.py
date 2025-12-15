import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class EnhancedNotificationService:
    """Enhanced notification service with email, push, and real-time support"""
    
    def __init__(self):
        self.email_enabled = os.getenv("EMAIL_ENABLED", "false").lower() == "true"
        self.push_enabled = os.getenv("PUSH_ENABLED", "false").lower() == "true"
        self.smtp_server = os.getenv("SMTP_SERVER")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
    
    async def send_notification(
        self,
        db: Session,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]] = None,
        channels: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Send notification via multiple channels"""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return {"success": False, "message": "User not found"}
            
            # Get user preferences
            preferences = await self._get_notification_preferences(db, user_id)
            
            channels = channels or ["in_app"]
            results = {}
            
            # In-app notification
            if "in_app" in channels and preferences.get("in_app", True):
                in_app_result = await self._send_in_app_notification(user_id, notification_type, title, message, data)
                results["in_app"] = in_app_result
            
            # Email notification
            if "email" in channels and preferences.get("email", True) and self.email_enabled:
                email_result = await self._send_email_notification(user.email, title, message, data)
                results["email"] = email_result
            
            # Push notification
            if "push" in channels and preferences.get("push", True) and self.push_enabled:
                push_result = await self._send_push_notification(user_id, title, message, data)
                results["push"] = push_result
            
            # Store notification history
            await self._store_notification_history(user_id, notification_type, title, message, data)
            
            return {
                "success": True,
                "channels": results,
                "notification_id": f"notif_{user_id}_{datetime.utcnow().timestamp()}"
            }
            
        except Exception as e:
            logger.error(f"Error sending notification: {e}")
            return {"success": False, "message": f"Error: {str(e)}"}
    
    async def _send_in_app_notification(
        self,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Send in-app notification"""
        try:
            notification = {
                "user_id": user_id,
                "type": notification_type,
                "title": title,
                "message": message,
                "data": data or {},
                "read": False,
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Store in cache/queue
            cache_key = f"notification_{user_id}_{datetime.utcnow().timestamp()}"
            await redis_cache.set_cache(cache_key, notification, expire=86400 * 7)  # 7 days
            
            return {"success": True, "stored": True}
            
        except Exception as e:
            logger.error(f"Error sending in-app notification: {e}")
            return {"success": False, "message": str(e)}
    
    async def _send_email_notification(
        self,
        email: str,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Send email notification"""
        try:
            # In production, use email service (SendGrid, AWS SES, etc.)
            logger.info(f"Email notification to {email}: {title} - {message}")
            return {"success": True, "sent": True}
            
        except Exception as e:
            logger.error(f"Error sending email: {e}")
            return {"success": False, "message": str(e)}
    
    async def _send_push_notification(
        self,
        user_id: int,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Send push notification"""
        try:
            # In production, use FCM, APNS, etc.
            logger.info(f"Push notification to user {user_id}: {title} - {message}")
            return {"success": True, "sent": True}
            
        except Exception as e:
            logger.error(f"Error sending push: {e}")
            return {"success": False, "message": str(e)}
    
    async def _get_notification_preferences(
        self,
        db: Session,
        user_id: int
    ) -> Dict[str, bool]:
        """Get user notification preferences"""
        try:
            # In production, fetch from database
            cache_key = f"notif_prefs_{user_id}"
            prefs = await redis_cache.get_cache(cache_key)
            if prefs:
                return prefs
            
            # Default preferences
            default_prefs = {
                "in_app": True,
                "email": True,
                "push": True,
                "sms": False
            }
            
            await redis_cache.set_cache(cache_key, default_prefs, expire=86400)
            return default_prefs
            
        except Exception as e:
            logger.error(f"Error getting preferences: {e}")
            return {"in_app": True, "email": True, "push": True, "sms": False}
    
    async def _store_notification_history(
        self,
        user_id: int,
        notification_type: str,
        title: str,
        message: str,
        data: Optional[Dict[str, Any]]
    ):
        """Store notification in history"""
        try:
            history_key = f"notif_history_{user_id}"
            history = await redis_cache.get_cache(history_key) or []
            
            notification = {
                "type": notification_type,
                "title": title,
                "message": message,
                "data": data,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            history.append(notification)
            # Keep only last 100 notifications
            history = history[-100:]
            
            await redis_cache.set_cache(history_key, history, expire=86400 * 30)  # 30 days
            
        except Exception as e:
            logger.error(f"Error storing notification history: {e}")
    
    async def get_notification_history(
        self,
        user_id: int,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get user's notification history"""
        try:
            history_key = f"notif_history_{user_id}"
            history = await redis_cache.get_cache(history_key) or []
            return history[-limit:]
            
        except Exception as e:
            logger.error(f"Error getting notification history: {e}")
            return []

# Global service instance
enhanced_notification_service = EnhancedNotificationService()

