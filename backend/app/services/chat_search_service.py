import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from sqlalchemy import text
from app.models.chat_db import Message, Conversation
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class ChatSearchService:
    def __init__(self):
        pass

    async def search_messages(
        self,
        db: Session,
        user_id: int,
        query: str,
        conversation_id: Optional[int] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Search messages across conversations"""
        try:
            # Build query
            search_query = db.query(Message).join(Conversation).filter(
                Message.content.contains(query)
            )

            # Filter by conversation if specified
            if conversation_id:
                search_query = search_query.filter(Message.conversation_id == conversation_id)
            else:
                # Only search in conversations user is part of
                search_query = search_query.join(
                    "conversation", "participants"
                ).filter(
                    text("conversation_participants.user_id = :user_id")
                ).params(user_id=user_id)

            # Get total count
            total = search_query.count()

            # Get results
            messages = search_query.order_by(desc(Message.created_at)).offset(offset).limit(limit).all()

            results = []
            for message in messages:
                results.append({
                    "message_id": message.id,
                    "conversation_id": message.conversation_id,
                    "sender_id": message.sender_id,
                    "content": message.content,
                    "message_type": message.message_type.value if hasattr(message.message_type, 'value') else str(message.message_type),
                    "created_at": message.created_at.isoformat() if message.created_at else None,
                    "relevance_score": self._calculate_relevance(message, query)
                })

            return {
                "success": True,
                "query": query,
                "total": total,
                "results": results,
                "limit": limit,
                "offset": offset
            }

        except Exception as e:
            logger.error(f"Error searching messages: {e}")
            return {"success": False, "message": f"Error searching messages: {str(e)}"}

    def _calculate_relevance(self, message: Message, query: str) -> float:
        """Calculate relevance score for a message"""
        # Simple relevance calculation
        content_lower = message.content.lower() if message.content else ""
        query_lower = query.lower()

        if query_lower in content_lower:
            # Exact match gets higher score
            return 1.0
        elif any(word in content_lower for word in query_lower.split()):
            # Partial match
            return 0.7
        else:
            return 0.5

# Global service instance
chat_search_service = ChatSearchService()

