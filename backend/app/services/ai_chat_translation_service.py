import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from app.cache import redis_cache

logger = structlog.get_logger()

# LangChain service - optional
try:
    from app.services.langchain_service import langchain_service
except ImportError:
    langchain_service = None

class AIChatTranslationService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.google_translate_api_key = os.getenv("GOOGLE_TRANSLATE_API_KEY")

    async def translate_message(
        self,
        message_text: str,
        target_language: str,
        source_language: Optional[str] = None
    ) -> Dict[str, Any]:
        """Translate a message to target language"""
        try:
            # Check cache
            cache_key = f"translation_{hash(message_text)}_{target_language}"
            cached = await redis_cache.get_cache(cache_key)
            if cached:
                return cached

            # Translate using AI
            if langchain_service:
                translation = await self._translate_with_ai(message_text, target_language, source_language)
            else:
                translation = self._translate_mock(message_text, target_language)

            await redis_cache.set_cache(cache_key, translation, expire=86400)
            return translation

        except Exception as e:
            logger.error(f"Error translating message: {e}")
            return {"success": False, "message": f"Error translating message: {str(e)}"}

    async def translate_messages(
        self,
        messages: List[Dict[str, Any]],
        target_language: str
    ) -> List[Dict[str, Any]]:
        """Translate multiple messages"""
        try:
            translated = []
            for msg in messages:
                if msg.get("content"):
                    translation = await self.translate_message(
                        msg["content"],
                        target_language
                    )
                    if translation.get("success"):
                        msg["translated_content"] = translation.get("translated_text")
                        msg["target_language"] = target_language
                translated.append(msg)

            return translated

        except Exception as e:
            logger.error(f"Error translating messages: {e}")
            return messages

    async def _translate_with_ai(
        self,
        text: str,
        target_language: str,
        source_language: Optional[str]
    ) -> Dict[str, Any]:
        """Translate using AI"""
        # In production, use translation API or AI model
        return self._translate_mock(text, target_language)

    def _translate_mock(self, text: str, target_language: str) -> Dict[str, Any]:
        """Mock translation"""
        return {
            "success": True,
            "original_text": text,
            "translated_text": f"[{target_language}] {text}",
            "target_language": target_language,
            "confidence": 0.9
        }

# Global service instance
ai_chat_translation_service = AIChatTranslationService()

