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

class AIChatSentimentService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

    async def analyze_sentiment(
        self,
        message_text: str
    ) -> Dict[str, Any]:
        """Analyze sentiment of a message"""
        try:
            # Check cache
            cache_key = f"sentiment_{hash(message_text)}"
            cached = await redis_cache.get_cache(cache_key)
            if cached:
                return cached

            # Analyze using AI
            if langchain_service:
                sentiment = await self._analyze_with_ai(message_text)
            else:
                sentiment = self._analyze_mock(message_text)

            await redis_cache.set_cache(cache_key, sentiment, expire=3600)
            return sentiment

        except Exception as e:
            logger.error(f"Error analyzing sentiment: {e}")
            return {"success": False, "message": f"Error analyzing sentiment: {str(e)}"}

    async def analyze_conversation_sentiment(
        self,
        messages: List[str]
    ) -> Dict[str, Any]:
        """Analyze overall sentiment of a conversation"""
        try:
            sentiments = []
            for msg in messages:
                sentiment = await self.analyze_sentiment(msg)
                if sentiment.get("success"):
                    sentiments.append(sentiment)

            if not sentiments:
                return {"success": False, "message": "No valid sentiments"}

            # Aggregate sentiments
            overall_sentiment = self._aggregate_sentiments(sentiments)

            return {
                "success": True,
                "overall_sentiment": overall_sentiment,
                "message_count": len(sentiments),
                "sentiment_breakdown": sentiments
            }

        except Exception as e:
            logger.error(f"Error analyzing conversation sentiment: {e}")
            return {"success": False, "message": f"Error: {str(e)}"}

    async def _analyze_with_ai(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment using AI"""
        # In production, use sentiment analysis API or model
        return self._analyze_mock(text)

    def _analyze_mock(self, text: str) -> Dict[str, Any]:
        """Mock sentiment analysis"""
        text_lower = text.lower()
        
        # Simple keyword-based analysis
        positive_words = ["good", "great", "excellent", "happy", "thanks", "love"]
        negative_words = ["bad", "terrible", "hate", "angry", "sad", "disappointed"]
        
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            sentiment = "positive"
            score = 0.7
        elif negative_count > positive_count:
            sentiment = "negative"
            score = 0.3
        else:
            sentiment = "neutral"
            score = 0.5

        return {
            "success": True,
            "sentiment": sentiment,
            "score": score,
            "confidence": 0.8
        }

    def _aggregate_sentiments(self, sentiments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregate multiple sentiment analyses"""
        scores = [s.get("score", 0.5) for s in sentiments if s.get("success")]
        if not scores:
            return {"sentiment": "neutral", "score": 0.5}

        avg_score = sum(scores) / len(scores)
        
        if avg_score > 0.6:
            sentiment = "positive"
        elif avg_score < 0.4:
            sentiment = "negative"
        else:
            sentiment = "neutral"

        return {
            "sentiment": sentiment,
            "score": avg_score,
            "message_count": len(sentiments)
        }

# Global service instance
ai_chat_sentiment_service = AIChatSentimentService()

