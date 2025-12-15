import os
import json
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.social_db import Share, Post, SharedItem, ShareType, PostVisibility
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class ShareService:
    def __init__(self):
        pass

    async def share_post(
        self,
        db: Session,
        post_id: int,
        user_id: int,
        share_type: str = "repost",
        message: Optional[str] = None
    ) -> Dict[str, Any]:
        """Share a post"""
        try:
            # Verify post exists
            post = db.query(Post).filter(Post.id == post_id).first()
            if not post:
                return {"success": False, "message": "Post not found"}

            # Create share
            share = Share(
                post_id=post_id,
                user_id=user_id,
                share_type=share_type,
                message=message
            )

            db.add(share)

            # Update post shares count
            post.shares_count = (post.shares_count or 0) + 1

            db.commit()

            return {
                "success": True,
                "share_id": share.id,
                "message": "Post shared"
            }

        except Exception as e:
            logger.error(f"Error sharing post: {e}")
            db.rollback()
            return {"success": False, "message": f"Error sharing post: {str(e)}"}

    async def share_achievement(
        self,
        db: Session,
        user_id: int,
        achievement_id: int,
        title: str,
        description: Optional[str] = None,
        visibility: str = "public"
    ) -> Dict[str, Any]:
        """Share an achievement"""
        try:
            shared_item = SharedItem(
                user_id=user_id,
                share_type=ShareType.achievement,
                item_id=achievement_id,
                item_type="achievement",
                title=title,
                description=description,
                visibility=PostVisibility(visibility),
                content={"achievement_id": achievement_id}
            )

            db.add(shared_item)
            db.commit()
            db.refresh(shared_item)

            return {
                "success": True,
                "shared_item_id": shared_item.id,
                "share_link": f"/social/shared/{shared_item.id}"
            }

        except Exception as e:
            logger.error(f"Error sharing achievement: {e}")
            db.rollback()
            return {"success": False, "message": f"Error sharing achievement: {str(e)}"}

    async def share_workout(
        self,
        db: Session,
        user_id: int,
        workout_id: int,
        title: str,
        description: Optional[str] = None,
        visibility: str = "public"
    ) -> Dict[str, Any]:
        """Share a workout"""
        try:
            shared_item = SharedItem(
                user_id=user_id,
                share_type=ShareType.workout,
                item_id=workout_id,
                item_type="workout",
                title=title,
                description=description,
                visibility=PostVisibility(visibility),
                content={"workout_id": workout_id}
            )

            db.add(shared_item)
            db.commit()
            db.refresh(shared_item)

            return {
                "success": True,
                "shared_item_id": shared_item.id,
                "share_link": f"/social/shared/{shared_item.id}"
            }

        except Exception as e:
            logger.error(f"Error sharing workout: {e}")
            db.rollback()
            return {"success": False, "message": f"Error sharing workout: {str(e)}"}

    async def share_trip(
        self,
        db: Session,
        user_id: int,
        trip_id: int,
        title: str,
        description: Optional[str] = None,
        visibility: str = "public"
    ) -> Dict[str, Any]:
        """Share a trip"""
        try:
            shared_item = SharedItem(
                user_id=user_id,
                share_type=ShareType.trip,
                item_id=trip_id,
                item_type="trip",
                title=title,
                description=description,
                visibility=PostVisibility(visibility),
                content={"trip_id": trip_id}
            )

            db.add(shared_item)
            db.commit()
            db.refresh(shared_item)

            return {
                "success": True,
                "shared_item_id": shared_item.id,
                "share_link": f"/social/shared/{shared_item.id}"
            }

        except Exception as e:
            logger.error(f"Error sharing trip: {e}")
            db.rollback()
            return {"success": False, "message": f"Error sharing trip: {str(e)}"}

    async def share_budget(
        self,
        db: Session,
        user_id: int,
        budget_id: int,
        title: str,
        description: Optional[str] = None,
        visibility: str = "friends"
    ) -> Dict[str, Any]:
        """Share a budget"""
        try:
            shared_item = SharedItem(
                user_id=user_id,
                share_type=ShareType.budget,
                item_id=budget_id,
                item_type="budget",
                title=title,
                description=description,
                visibility=PostVisibility(visibility),
                content={"budget_id": budget_id}
            )

            db.add(shared_item)
            db.commit()
            db.refresh(shared_item)

            return {
                "success": True,
                "shared_item_id": shared_item.id,
                "share_link": f"/social/shared/{shared_item.id}"
            }

        except Exception as e:
            logger.error(f"Error sharing budget: {e}")
            db.rollback()
            return {"success": False, "message": f"Error sharing budget: {str(e)}"}

    async def get_shared_items(
        self,
        db: Session,
        user_id: int,
        item_type: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get shared items"""
        try:
            query = db.query(SharedItem).filter(
                SharedItem.user_id == user_id
            )

            if item_type:
                query = query.filter(SharedItem.item_type == item_type)

            shared_items = query.order_by(desc(SharedItem.created_at)).offset(offset).limit(limit).all()

            return [self._shared_item_to_dict(item) for item in shared_items]

        except Exception as e:
            logger.error(f"Error getting shared items: {e}")
            return []

    def _shared_item_to_dict(self, item: SharedItem) -> Dict[str, Any]:
        """Convert shared item to dictionary"""
        return {
            "id": item.id,
            "share_type": item.share_type.value if hasattr(item.share_type, 'value') else str(item.share_type),
            "item_id": item.item_id,
            "item_type": item.item_type,
            "title": item.title,
            "description": item.description,
            "visibility": item.visibility.value if hasattr(item.visibility, 'value') else str(item.visibility),
            "likes_count": item.likes_count,
            "comments_count": item.comments_count,
            "shares_count": item.shares_count,
            "views_count": item.views_count,
            "created_at": item.created_at.isoformat() if item.created_at else None
        }

# Global service instance
share_service = ShareService()

