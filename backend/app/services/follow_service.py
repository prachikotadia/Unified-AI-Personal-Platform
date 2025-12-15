import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.social_db import Follow, BlockedUser
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class FollowService:
    def __init__(self):
        pass

    async def follow_user(
        self,
        db: Session,
        follower_id: int,
        following_id: int
    ) -> Dict[str, Any]:
        """Follow a user"""
        try:
            if follower_id == following_id:
                return {"success": False, "message": "Cannot follow yourself"}

            # Check if already following
            existing = db.query(Follow).filter(
                and_(
                    Follow.follower_id == follower_id,
                    Follow.following_id == following_id
                )
            ).first()

            if existing:
                return {"success": False, "message": "Already following"}

            # Check if blocked
            is_blocked = db.query(BlockedUser).filter(
                or_(
                    and_(BlockedUser.user_id == follower_id, BlockedUser.blocked_user_id == following_id),
                    and_(BlockedUser.user_id == following_id, BlockedUser.blocked_user_id == follower_id)
                )
            ).first()

            if is_blocked:
                return {"success": False, "message": "Cannot follow blocked user"}

            # Create follow
            follow = Follow(
                follower_id=follower_id,
                following_id=following_id
            )

            db.add(follow)
            db.commit()

            return {
                "success": True,
                "message": "User followed"
            }

        except Exception as e:
            logger.error(f"Error following user: {e}")
            db.rollback()
            return {"success": False, "message": f"Error following user: {str(e)}"}

    async def unfollow_user(
        self,
        db: Session,
        follower_id: int,
        following_id: int
    ) -> Dict[str, Any]:
        """Unfollow a user"""
        try:
            follow = db.query(Follow).filter(
                and_(
                    Follow.follower_id == follower_id,
                    Follow.following_id == following_id
                )
            ).first()

            if not follow:
                return {"success": False, "message": "Not following user"}

            db.delete(follow)
            db.commit()

            return {"success": True, "message": "User unfollowed"}

        except Exception as e:
            logger.error(f"Error unfollowing user: {e}")
            db.rollback()
            return {"success": False, "message": f"Error unfollowing user: {str(e)}"}

    async def get_followers(
        self,
        db: Session,
        user_id: int,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get user's followers"""
        try:
            followers = db.query(Follow).filter(
                Follow.following_id == user_id
            ).offset(offset).limit(limit).all()

            return [{"follower_id": f.follower_id, "created_at": f.created_at.isoformat() if f.created_at else None} for f in followers]

        except Exception as e:
            logger.error(f"Error getting followers: {e}")
            return []

    async def get_following(
        self,
        db: Session,
        user_id: int,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get users that user is following"""
        try:
            following = db.query(Follow).filter(
                Follow.follower_id == user_id
            ).offset(offset).limit(limit).all()

            return [{"following_id": f.following_id, "created_at": f.created_at.isoformat() if f.created_at else None} for f in following]

        except Exception as e:
            logger.error(f"Error getting following: {e}")
            return []

    async def is_following(
        self,
        db: Session,
        follower_id: int,
        following_id: int
    ) -> bool:
        """Check if user is following another user"""
        try:
            follow = db.query(Follow).filter(
                and_(
                    Follow.follower_id == follower_id,
                    Follow.following_id == following_id
                )
            ).first()

            return follow is not None

        except Exception as e:
            logger.error(f"Error checking follow status: {e}")
            return False

# Global service instance
follow_service = FollowService()

