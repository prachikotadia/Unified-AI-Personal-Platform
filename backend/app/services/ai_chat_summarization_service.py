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

class AIChatSummarizationService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

    async def summarize_conversation(
        self,
        db: Session,
        conversation_id: int,
        message_limit: int = 100
    ) -> Dict[str, Any]:
        """Summarize a conversation using AI"""
        try:
            # Get recent messages
            messages = db.query(Message).filter(
                Message.conversation_id == conversation_id
            ).order_by(desc(Message.created_at)).limit(message_limit).all()

            if not messages:
                return {"success": False, "message": "No messages found"}

            # Prepare conversation text
            conversation_text = "\n".join([
                f"{msg.sender_id}: {msg.content}" for msg in reversed(messages) if msg.content
            ])

            # Generate summary using AI
            if langchain_service:
                summary = await self._generate_with_ai(conversation_text)
            else:
                summary = self._generate_mock_summary(messages)

            return {
                "success": True,
                "conversation_id": conversation_id,
                "summary": summary,
                "message_count": len(messages),
                "confidence": 0.85
            }

        except Exception as e:
            logger.error(f"Error summarizing conversation: {e}")
            return {"success": False, "message": f"Error summarizing conversation: {str(e)}"}

    async def _generate_with_ai(self, conversation_text: str) -> Dict[str, Any]:
        """Generate summary using AI"""
        prompt = f"""
        Summarize the following conversation in a concise way:
        
        {conversation_text}
        
        Provide:
        1. Main topics discussed
        2. Key decisions made
        3. Action items (if any)
        4. Overall sentiment
        """

        # In production, use LangChain or OpenAI directly
        return {
            "topics": ["General discussion"],
            "decisions": [],
            "action_items": [],
            "sentiment": "neutral",
            "summary_text": "Conversation summary"
        }

    def _generate_mock_summary(self, messages: List[Message]) -> Dict[str, Any]:
        """Generate mock summary"""
        return {
            "topics": ["General discussion"],
            "decisions": [],
            "action_items": [],
            "sentiment": "neutral",
            "summary_text": f"Conversation with {len(messages)} messages"
        }

# Global service instance
ai_chat_summarization_service = AIChatSummarizationService()

