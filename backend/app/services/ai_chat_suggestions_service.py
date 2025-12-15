import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.chat_db import Message, Conversation
from app.cache import redis_cache

logger = structlog.get_logger()

# LangChain service - optional
try:
    from app.services.langchain_service import langchain_service
except ImportError:
    langchain_service = None

class AIChatSuggestionsService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

    async def get_message_suggestions(
        self,
        db: Session,
        conversation_id: int,
        context: Optional[str] = None,
        limit: int = 5
    ) -> List[str]:
        """Get AI-powered message suggestions"""
        try:
            # Get recent messages for context
            recent_messages = db.query(Message).filter(
                Message.conversation_id == conversation_id
            ).order_by(desc(Message.created_at)).limit(5).all()

            # Build context
            conversation_context = "\n".join([
                f"{msg.content}" for msg in reversed(recent_messages) if msg.content
            ])

            # Generate suggestions
            if langchain_service:
                suggestions = await self._generate_with_ai(conversation_context, context, limit)
            else:
                suggestions = self._generate_mock_suggestions(conversation_context, limit)

            return suggestions

        except Exception as e:
            logger.error(f"Error getting message suggestions: {e}")
            return []

    async def _generate_with_ai(
        self,
        conversation_context: str,
        user_input: Optional[str],
        limit: int
    ) -> List[str]:
        """Generate suggestions using AI"""
        prompt = f"""
        Based on this conversation context:
        {conversation_context}
        
        {"And user's current input: " + user_input if user_input else ""}
        
        Suggest {limit} appropriate message responses. Keep them concise and natural.
        """

        # In production, use AI to generate suggestions
        return self._generate_mock_suggestions(conversation_context, limit)

    def _generate_mock_suggestions(self, context: str, limit: int) -> List[str]:
        """Generate mock suggestions"""
        common_responses = [
            "Sounds good!",
            "I'll get back to you on that.",
            "Thanks for letting me know.",
            "Let me think about that.",
            "That makes sense."
        ]
        return common_responses[:limit]

# Global service instance
ai_chat_suggestions_service = AIChatSuggestionsService()

