import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.social_db import Friend, FriendRequest, UserProfile, Post
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

# LangChain service - optional
try:
    from app.services.langchain_service import langchain_service
except ImportError:
    langchain_service = None

class AIFriendSuggestionsService:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")

    async def get_friend_suggestions(
        self,
        db: Session,
        user_id: int,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get AI-powered friend suggestions"""
        try:
            # Get user's profile
            user_profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
            user = db.query(User).filter(User.id == user_id).first()

            # Get user's current friends
            friends = db.query(Friend).filter(
                and_(
                    Friend.user_id == user_id,
                    Friend.status == "active"
                )
            ).all()
            friend_ids = [f.friend_id for f in friends]

            # Get existing friend requests
            sent_requests = db.query(FriendRequest).filter(
                FriendRequest.sender_id == user_id
            ).all()
            received_requests = db.query(FriendRequest).filter(
                FriendRequest.receiver_id == user_id
            ).all()
            requested_ids = [r.receiver_id for r in sent_requests] + [r.sender_id for r in received_requests]

            # Get user's interests
            user_interests = user_profile.interests if user_profile and user_profile.interests else []

            # Find users with similar interests
            similar_users = []
            if user_interests:
                similar_profiles = db.query(UserProfile).filter(
                    and_(
                        UserProfile.user_id != user_id,
                        ~UserProfile.user_id.in_(friend_ids),
                        ~UserProfile.user_id.in_(requested_ids)
                    )
                ).all()

                for profile in similar_profiles:
                    if profile.interests:
                        common_interests = set(user_interests) & set(profile.interests)
                        if common_interests:
                            similar_users.append({
                                "user_id": profile.user_id,
                                "common_interests": list(common_interests),
                                "score": len(common_interests)
                            })

            # Sort by score and get top suggestions
            similar_users.sort(key=lambda x: x["score"], reverse=True)
            suggestions = similar_users[:limit]

            # Get user details
            result = []
            for suggestion in suggestions:
                suggested_user = db.query(User).filter(User.id == suggestion["user_id"]).first()
                if suggested_user:
                    result.append({
                        "user_id": suggested_user.id,
                        "username": suggested_user.username,
                        "display_name": suggested_user.display_name,
                        "avatar": suggested_user.avatar,
                        "common_interests": suggestion["common_interests"],
                        "match_score": suggestion["score"] / max(len(user_interests), 1),
                        "reason": f"Shares {len(suggestion['common_interests'])} interests with you"
                    })

            return result

        except Exception as e:
            logger.error(f"Error getting friend suggestions: {e}")
            return []

# Global service instance
ai_friend_suggestions_service = AIFriendSuggestionsService()

