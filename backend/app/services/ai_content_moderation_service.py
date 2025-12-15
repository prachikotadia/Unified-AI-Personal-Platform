import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.social_db import Post, Comment, ReportedPost
from app.cache import redis_cache

logger = structlog.get_logger()

# LangChain service - optional
try:
    from app.services.langchain_service import langchain_service
except ImportError:
    langchain_service = None

class AIContentModerationService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.profanity_words = ["bad", "hate"]  # Simplified list, in production use comprehensive list

    async def moderate_post(
        self,
        db: Session,
        post_id: int
    ) -> Dict[str, Any]:
        """Moderate a post using AI"""
        try:
            post = db.query(Post).filter(Post.id == post_id).first()
            if not post:
                return {"success": False, "message": "Post not found"}

            # Analyze content
            analysis = await self._analyze_content(post.content or "")

            # Check if action needed
            if analysis.get("needs_review"):
                # Flag for manual review
                reported = ReportedPost(
                    post_id=post_id,
                    reporter_id=0,  # System
                    reason="ai_moderation",
                    description=analysis.get("reason", "Content flagged by AI moderation"),
                    status="pending"
                )
                db.add(reported)
                db.commit()

            return {
                "success": True,
                "analysis": analysis,
                "action_taken": analysis.get("needs_review", False)
            }

        except Exception as e:
            logger.error(f"Error moderating post: {e}")
            return {"success": False, "message": f"Error moderating post: {str(e)}"}

    async def moderate_comment(
        self,
        db: Session,
        comment_id: int
    ) -> Dict[str, Any]:
        """Moderate a comment using AI"""
        try:
            from app.models.social_db import Comment
            comment = db.query(Comment).filter(Comment.id == comment_id).first()
            if not comment:
                return {"success": False, "message": "Comment not found"}

            # Analyze content
            analysis = await self._analyze_content(comment.content or "")

            return {
                "success": True,
                "analysis": analysis,
                "action_taken": analysis.get("needs_review", False)
            }

        except Exception as e:
            logger.error(f"Error moderating comment: {e}")
            return {"success": False, "message": f"Error moderating comment: {str(e)}"}

    async def _analyze_content(self, content: str) -> Dict[str, Any]:
        """Analyze content for moderation"""
        if not content:
            return {
                "is_safe": True,
                "needs_review": False,
                "reason": None,
                "confidence": 1.0
            }

        content_lower = content.lower()

        # Check for profanity (simplified)
        has_profanity = any(word in content_lower for word in self.profanity_words)

        # Check for spam patterns
        is_spam = self._detect_spam(content)

        # In production, use AI/ML model for comprehensive analysis
        if langchain_service:
            # Use AI for advanced analysis
            pass

        needs_review = has_profanity or is_spam

        return {
            "is_safe": not needs_review,
            "needs_review": needs_review,
            "reason": "Contains inappropriate content" if has_profanity else ("Spam detected" if is_spam else None),
            "confidence": 0.85,
            "flags": {
                "profanity": has_profanity,
                "spam": is_spam
            }
        }

    def _detect_spam(self, content: str) -> bool:
        """Detect spam patterns"""
        # Simple spam detection
        spam_patterns = [
            len(content) > 1000,  # Very long content
            content.count("http") > 3,  # Multiple links
            content.count("@") > 5,  # Multiple mentions
        ]
        return any(spam_patterns)

# Global service instance
ai_content_moderation_service = AIContentModerationService()

