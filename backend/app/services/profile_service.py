import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.social_db import UserProfile, Post, SharedItem, Friend
from app.models.fitness_db import Achievement
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class ProfileService:
    def __init__(self):
        pass

    async def get_user_profile(
        self,
        db: Session,
        user_id: int,
        viewer_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get user profile"""
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return {"success": False, "message": "User not found"}

            profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

            # Check if viewer can see profile
            is_own_profile = (viewer_id == user_id)
            is_friend = False
            if viewer_id and not is_own_profile:
                is_friend = db.query(Friend).filter(
                    and_(
                        or_(
                            and_(Friend.user_id == viewer_id, Friend.friend_id == user_id),
                            and_(Friend.user_id == user_id, Friend.friend_id == viewer_id)
                        ),
                        Friend.status == "active"
                    )
                ).first() is not None

            profile_data = {
                "user_id": user.id,
                "username": user.username,
                "display_name": user.display_name,
                "avatar": user.avatar,
                "bio": profile.bio if profile else None,
                "location": profile.location if profile else None,
                "website": profile.website if profile else None,
                "profile_picture": profile.profile_picture if profile else None,
                "cover_photo": profile.cover_photo if profile else None,
                "interests": profile.interests if profile else [],
                "skills": profile.skills if profile else [],
                "is_own_profile": is_own_profile,
                "is_friend": is_friend
            }

            # Get stats
            posts_count = db.query(Post).filter(
                and_(
                    Post.user_id == user_id,
                    Post.is_deleted == False
                )
            ).count()

            achievements_count = db.query(Achievement).filter(
                Achievement.user_id == user_id
            ).count()

            friends_count = db.query(Friend).filter(
                and_(
                    Friend.user_id == user_id,
                    Friend.status == "active"
                )
            ).count()

            profile_data["stats"] = {
                "posts": posts_count,
                "achievements": achievements_count,
                "friends": friends_count
            }

            return {
                "success": True,
                "profile": profile_data
            }

        except Exception as e:
            logger.error(f"Error getting user profile: {e}")
            return {"success": False, "message": f"Error getting profile: {str(e)}"}

    async def update_profile(
        self,
        db: Session,
        user_id: int,
        profile_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update user profile"""
        try:
            profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

            if not profile:
                # Create new profile
                profile = UserProfile(user_id=user_id)
                db.add(profile)

            # Update fields
            if "bio" in profile_data:
                profile.bio = profile_data["bio"]
            if "location" in profile_data:
                profile.location = profile_data["location"]
            if "website" in profile_data:
                profile.website = profile_data["website"]
            if "birth_date" in profile_data:
                profile.birth_date = datetime.fromisoformat(profile_data["birth_date"]) if profile_data["birth_date"] else None
            if "profile_picture" in profile_data:
                profile.profile_picture = profile_data["profile_picture"]
            if "cover_photo" in profile_data:
                profile.cover_photo = profile_data["cover_photo"]
            if "interests" in profile_data:
                profile.interests = profile_data["interests"]
            if "skills" in profile_data:
                profile.skills = profile_data["skills"]
            if "education" in profile_data:
                profile.education = profile_data["education"]
            if "work_experience" in profile_data:
                profile.work_experience = profile_data["work_experience"]
            if "social_links" in profile_data:
                profile.social_links = profile_data["social_links"]
            if "privacy_settings" in profile_data:
                profile.privacy_settings = profile_data["privacy_settings"]

            profile.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(profile)

            return {
                "success": True,
                "profile": self._profile_to_dict(profile)
            }

        except Exception as e:
            logger.error(f"Error updating profile: {e}")
            db.rollback()
            return {"success": False, "message": f"Error updating profile: {str(e)}"}

    async def get_user_achievements(
        self,
        db: Session,
        user_id: int,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Get user achievements"""
        try:
            achievements = db.query(Achievement).filter(
                Achievement.user_id == user_id
            ).order_by(desc(Achievement.unlocked_at)).limit(limit).all()

            return [
                {
                    "id": a.id,
                    "title": a.title,
                    "description": a.description,
                    "category": a.category,
                    "icon": a.icon,
                    "unlocked_at": a.unlocked_at.isoformat() if a.unlocked_at else None
                }
                for a in achievements
            ]

        except Exception as e:
            logger.error(f"Error getting user achievements: {e}")
            return []

    def _profile_to_dict(self, profile: UserProfile) -> Dict[str, Any]:
        """Convert profile to dictionary"""
        return {
            "user_id": profile.user_id,
            "bio": profile.bio,
            "location": profile.location,
            "website": profile.website,
            "birth_date": profile.birth_date.isoformat() if profile.birth_date else None,
            "profile_picture": profile.profile_picture,
            "cover_photo": profile.cover_photo,
            "interests": profile.interests or [],
            "skills": profile.skills or [],
            "education": profile.education or [],
            "work_experience": profile.work_experience or [],
            "social_links": profile.social_links or {},
            "privacy_settings": profile.privacy_settings or {},
            "updated_at": profile.updated_at.isoformat() if profile.updated_at else None
        }

# Global service instance
profile_service = ProfileService()

