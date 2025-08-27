import asyncio
from typing import List, Dict, Any, Optional
from datetime import datetime
import structlog
from fastapi import WebSocket
import json

logger = structlog.get_logger()

class NotificationService:
    def __init__(self):
        self.websocket_connections: Dict[str, WebSocket] = {}
        self.notification_queue = asyncio.Queue()
        
    async def initialize(self, websocket_manager=None):
        """Initialize notification service"""
        self.websocket_manager = websocket_manager
        logger.info("Notification service initialized")
        
    async def add_websocket_connection(self, user_id: str, websocket: WebSocket):
        """Add a new WebSocket connection for a user"""
        self.websocket_connections[user_id] = websocket
        logger.info(f"Added WebSocket connection for user {user_id}")
        
    async def remove_websocket_connection(self, user_id: str):
        """Remove WebSocket connection for a user"""
        if user_id in self.websocket_connections:
            del self.websocket_connections[user_id]
            logger.info(f"Removed WebSocket connection for user {user_id}")
            
    async def send_notification(self, user_id: str, notification: Dict[str, Any]):
        """Send notification to a specific user via WebSocket"""
        try:
            if user_id in self.websocket_connections:
                websocket = self.websocket_connections[user_id]
                await websocket.send_text(json.dumps(notification))
                logger.info(f"Sent notification to user {user_id}")
            else:
                # Store notification for later delivery
                await self.store_notification(user_id, notification)
                logger.info(f"Stored notification for offline user {user_id}")
        except Exception as e:
            logger.error(f"Error sending notification to user {user_id}: {e}")
            
    async def send_broadcast_notification(self, notification: Dict[str, Any], user_ids: List[str] = None):
        """Send notification to multiple users"""
        if user_ids is None:
            # Send to all connected users
            user_ids = list(self.websocket_connections.keys())
            
        for user_id in user_ids:
            await self.send_notification(user_id, notification)
            
    async def store_notification(self, user_id: str, notification: Dict[str, Any]):
        """Store notification in database for later delivery"""
        try:
            from app.database import get_collection
            
            notifications_collection = get_collection("notifications")
            
            notification_data = {
                "user_id": user_id,
                "type": notification.get("type", "general"),
                "title": notification.get("title", ""),
                "message": notification.get("message", ""),
                "data": notification.get("data", {}),
                "read": False,
                "created_at": datetime.utcnow()
            }
            
            await notifications_collection.insert_one(notification_data)
            logger.info(f"Stored notification for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error storing notification: {e}")
            
    async def mark_notification_read(self, user_id: str, notification_id: str):
        """Mark a notification as read"""
        try:
            from app.database import get_collection
            
            notifications_collection = get_collection("notifications")
            
            await notifications_collection.update_one(
                {"_id": notification_id, "user_id": user_id},
                {"$set": {"read": True, "read_at": datetime.utcnow()}}
            )
            
            logger.info(f"Marked notification {notification_id} as read for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error marking notification as read: {e}")
            
    async def get_user_notifications(self, user_id: str, limit: int = 50, unread_only: bool = False):
        """Get notifications for a user"""
        try:
            from app.database import get_collection
            
            notifications_collection = get_collection("notifications")
            
            query = {"user_id": user_id}
            if unread_only:
                query["read"] = False
                
            cursor = notifications_collection.find(query).sort("created_at", -1).limit(limit)
            notifications = await cursor.to_list(length=limit)
            
            return notifications
            
        except Exception as e:
            logger.error(f"Error getting notifications for user {user_id}: {e}")
            return []
            
    async def create_notification(self, user_id: str, notification_type: str, title: str, 
                                message: str, data: Dict[str, Any] = None):
        """Create and send a notification"""
        notification = {
            "type": notification_type,
            "title": title,
            "message": message,
            "data": data or {},
            "timestamp": datetime.utcnow().isoformat()
        }
        
        await self.send_notification(user_id, notification)
        return notification
        
    async def send_finance_notification(self, user_id: str, notification_type: str, **kwargs):
        """Send finance-related notifications"""
        notifications = {
            "budget_alert": {
                "title": "Budget Alert",
                "message": f"You've reached {kwargs.get('percentage', 0)}% of your {kwargs.get('category', '')} budget."
            },
            "goal_achieved": {
                "title": "Goal Achieved!",
                "message": f"Congratulations! You've achieved your {kwargs.get('goal_name', 'financial')} goal."
            },
            "unusual_spending": {
                "title": "Unusual Spending Detected",
                "message": f"Unusual spending pattern detected in {kwargs.get('category', '')} category."
            }
        }
        
        if notification_type in notifications:
            notification = notifications[notification_type]
            await self.create_notification(user_id, "finance", notification["title"], notification["message"], kwargs)
            
    async def send_fitness_notification(self, user_id: str, notification_type: str, **kwargs):
        """Send fitness-related notifications"""
        notifications = {
            "workout_reminder": {
                "title": "Workout Reminder",
                "message": "Time for your scheduled workout!"
            },
            "goal_achieved": {
                "title": "Fitness Goal Achieved!",
                "message": f"Congratulations! You've achieved your {kwargs.get('goal_name', 'fitness')} goal."
            },
            "streak_milestone": {
                "title": "Streak Milestone",
                "message": f"Amazing! You've maintained a {kwargs.get('days', 0)}-day streak."
            }
        }
        
        if notification_type in notifications:
            notification = notifications[notification_type]
            await self.create_notification(user_id, "fitness", notification["title"], notification["message"], kwargs)
            
    async def send_marketplace_notification(self, user_id: str, notification_type: str, **kwargs):
        """Send marketplace-related notifications"""
        notifications = {
            "order_confirmed": {
                "title": "Order Confirmed",
                "message": f"Your order #{kwargs.get('order_number', '')} has been confirmed."
            },
            "order_shipped": {
                "title": "Order Shipped",
                "message": f"Your order #{kwargs.get('order_number', '')} has been shipped."
            },
            "price_drop": {
                "title": "Price Drop Alert",
                "message": f"Price dropped for {kwargs.get('product_name', '')} - now ${kwargs.get('new_price', 0)}"
            }
        }
        
        if notification_type in notifications:
            notification = notifications[notification_type]
            await self.create_notification(user_id, "marketplace", notification["title"], notification["message"], kwargs)
            
    async def send_social_notification(self, user_id: str, notification_type: str, **kwargs):
        """Send social-related notifications"""
        notifications = {
            "new_follower": {
                "title": "New Follower",
                "message": f"{kwargs.get('follower_name', 'Someone')} started following you."
            },
            "new_like": {
                "title": "New Like",
                "message": f"{kwargs.get('liker_name', 'Someone')} liked your post."
            },
            "new_comment": {
                "title": "New Comment",
                "message": f"{kwargs.get('commenter_name', 'Someone')} commented on your post."
            }
        }
        
        if notification_type in notifications:
            notification = notifications[notification_type]
            await self.create_notification(user_id, "social", notification["title"], notification["message"], kwargs)
            
    async def send_chat_notification(self, user_id: str, notification_type: str, **kwargs):
        """Send chat-related notifications"""
        notifications = {
            "new_message": {
                "title": "New Message",
                "message": f"New message from {kwargs.get('sender_name', 'Someone')}"
            },
            "mentioned": {
                "title": "You were mentioned",
                "message": f"{kwargs.get('sender_name', 'Someone')} mentioned you in a message."
            }
        }
        
        if notification_type in notifications:
            notification = notifications[notification_type]
            await self.create_notification(user_id, "chat", notification["title"], notification["message"], kwargs)
            
    async def send_ai_notification(self, user_id: str, notification_type: str, **kwargs):
        """Send AI-related notifications"""
        notifications = {
            "insight_generated": {
                "title": "New AI Insight",
                "message": "New personalized insight available for you."
            },
            "recommendation_ready": {
                "title": "AI Recommendation",
                "message": f"New {kwargs.get('type', '')} recommendation available."
            }
        }
        
        if notification_type in notifications:
            notification = notifications[notification_type]
            await self.create_notification(user_id, "ai", notification["title"], notification["message"], kwargs)
            
    async def cleanup_old_notifications(self, days: int = 30):
        """Clean up old notifications"""
        try:
            from app.database import get_collection
            from datetime import timedelta
            
            notifications_collection = get_collection("notifications")
            cutoff_date = datetime.utcnow() - timedelta(days=days)
            
            result = await notifications_collection.delete_many({
                "created_at": {"$lt": cutoff_date},
                "read": True
            })
            
            logger.info(f"Cleaned up {result.deleted_count} old notifications")
            
        except Exception as e:
            logger.error(f"Error cleaning up old notifications: {e}")
            
    async def get_notification_stats(self, user_id: str):
        """Get notification statistics for a user"""
        try:
            from app.database import get_collection
            
            notifications_collection = get_collection("notifications")
            
            # Get total notifications
            total = await notifications_collection.count_documents({"user_id": user_id})
            
            # Get unread notifications
            unread = await notifications_collection.count_documents({
                "user_id": user_id,
                "read": False
            })
            
            # Get notifications by type
            pipeline = [
                {"$match": {"user_id": user_id}},
                {"$group": {"_id": "$type", "count": {"$sum": 1}}}
            ]
            
            type_stats = await notifications_collection.aggregate(pipeline).to_list(length=None)
            
            return {
                "total": total,
                "unread": unread,
                "by_type": {stat["_id"]: stat["count"] for stat in type_stats}
            }
            
        except Exception as e:
            logger.error(f"Error getting notification stats for user {user_id}: {e}")
            return {"total": 0, "unread": 0, "by_type": {}}
