import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.chat_db import Message, Conversation, ChatSettings
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class ChatNotificationService:
    def __init__(self):
        pass

    async def send_message_notification(
        self,
        db: Session,
        message_id: int,
        conversation_id: int
    ) -> Dict[str, Any]:
        """Send notification for new message"""
        try:
            message = db.query(Message).filter(Message.id == message_id).first()
            if not message:
                return {"success": False, "message": "Message not found"}

            # Get conversation participants
            conversation = db.query(Conversation).filter(
                Conversation.id == conversation_id
            ).first()

            if not conversation:
                return {"success": False, "message": "Conversation not found"}

            # Get participants (excluding sender)
            participants = db.query(ChatSettings).join(
                "conversation", "participants"
            ).filter(
                and_(
                    ChatSettings.conversation_id == conversation_id,
                    ChatSettings.user_id != message.sender_id,
                    ChatSettings.is_muted == False
                )
            ).all()

            # Send notifications
            notifications_sent = []
            for participant in participants:
                notification = await self._create_notification(
                    participant.user_id,
                    message,
                    conversation
                )
                notifications_sent.append(notification)

            return {
                "success": True,
                "notifications_sent": len(notifications_sent),
                "message_id": message_id
            }

        except Exception as e:
            logger.error(f"Error sending notification: {e}")
            return {"success": False, "message": f"Error sending notification: {str(e)}"}

    async def _create_notification(
        self,
        user_id: int,
        message: Message,
        conversation: Conversation
    ) -> Dict[str, Any]:
        """Create a notification for a user"""
        # In production, integrate with push notification service
        notification = {
            "user_id": user_id,
            "type": "new_message",
            "conversation_id": conversation.id,
            "message_id": message.id,
            "sender_id": message.sender_id,
            "preview": message.content[:100] if message.content else "",
            "timestamp": datetime.utcnow().isoformat()
        }

        # Store in cache/queue for delivery
        await redis_cache.set_cache(
            f"notification_{user_id}_{message.id}",
            notification,
            expire=86400
        )

        return notification

    async def send_call_notification(
        self,
        db: Session,
        call_id: int,
        user_id: int
    ) -> Dict[str, Any]:
        """Send notification for incoming call"""
        try:
            # In production, send push notification
            notification = {
                "user_id": user_id,
                "type": "incoming_call",
                "call_id": call_id,
                "timestamp": datetime.utcnow().isoformat()
            }

            await redis_cache.set_cache(
                f"call_notification_{user_id}_{call_id}",
                notification,
                expire=300  # 5 minutes
            )

            return {"success": True, "notification": notification}

        except Exception as e:
            logger.error(f"Error sending call notification: {e}")
            return {"success": False, "message": f"Error: {str(e)}"}

# Global service instance
chat_notification_service = ChatNotificationService()

