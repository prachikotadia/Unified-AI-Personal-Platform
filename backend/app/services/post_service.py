import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.social_db import Post, PostType, PostVisibility, Friend, BlockedUser, SavedPost, ReportedPost
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class PostService:
    def __init__(self):
        pass

    async def create_post(
        self,
        db: Session,
        user_id: int,
        post_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a new post"""
        try:
            post = Post(
                user_id=user_id,
                post_type=PostType(post_data.get("post_type", "text")),
                content=post_data.get("content"),
                media_urls=post_data.get("media_urls", []),
                link_url=post_data.get("link_url"),
                link_preview=post_data.get("link_preview"),
                visibility=PostVisibility(post_data.get("visibility", "public")),
                location=post_data.get("location"),
                hashtags=post_data.get("hashtags", []),
                mentions=post_data.get("mentions", []),
                shared_item_id=post_data.get("shared_item_id"),
                shared_item_type=post_data.get("shared_item_type")
            )

            db.add(post)
            db.commit()
            db.refresh(post)

            return {
                "success": True,
                "post": self._post_to_dict(post)
            }

        except Exception as e:
            logger.error(f"Error creating post: {e}")
            db.rollback()
            return {"success": False, "message": f"Error creating post: {str(e)}"}

    async def update_post(
        self,
        db: Session,
        post_id: int,
        user_id: int,
        post_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update a post"""
        try:
            post = db.query(Post).filter(
                and_(
                    Post.id == post_id,
                    Post.user_id == user_id
                )
            ).first()

            if not post:
                return {"success": False, "message": "Post not found"}

            # Update fields
            if "content" in post_data:
                post.content = post_data["content"]
            if "media_urls" in post_data:
                post.media_urls = post_data["media_urls"]
            if "visibility" in post_data:
                post.visibility = PostVisibility(post_data["visibility"])
            if "hashtags" in post_data:
                post.hashtags = post_data["hashtags"]

            post.is_edited = True
            post.edited_at = datetime.utcnow()
            post.updated_at = datetime.utcnow()

            db.commit()
            db.refresh(post)

            return {
                "success": True,
                "post": self._post_to_dict(post)
            }

        except Exception as e:
            logger.error(f"Error updating post: {e}")
            db.rollback()
            return {"success": False, "message": f"Error updating post: {str(e)}"}

    async def delete_post(
        self,
        db: Session,
        post_id: int,
        user_id: int
    ) -> Dict[str, Any]:
        """Delete a post"""
        try:
            post = db.query(Post).filter(
                and_(
                    Post.id == post_id,
                    Post.user_id == user_id
                )
            ).first()

            if not post:
                return {"success": False, "message": "Post not found"}

            post.is_deleted = True
            post.deleted_at = datetime.utcnow()

            db.commit()

            return {"success": True, "message": "Post deleted"}

        except Exception as e:
            logger.error(f"Error deleting post: {e}")
            db.rollback()
            return {"success": False, "message": f"Error deleting post: {str(e)}"}

    async def get_posts_feed(
        self,
        db: Session,
        user_id: int,
        limit: int = 20,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get posts feed for user"""
        try:
            # Get user's friends
            friends = db.query(Friend).filter(
                and_(
                    Friend.user_id == user_id,
                    Friend.status == "active"
                )
            ).all()
            friend_ids = [f.friend_id for f in friends]

            # Get blocked users
            blocked = db.query(BlockedUser).filter(
                BlockedUser.user_id == user_id
            ).all()
            blocked_ids = [b.blocked_user_id for b in blocked]

            # Query posts
            query = db.query(Post).filter(
                and_(
                    Post.is_deleted == False,
                    ~Post.user_id.in_(blocked_ids)
                )
            ).filter(
                or_(
                    Post.user_id == user_id,  # Own posts
                    Post.user_id.in_(friend_ids),  # Friends' posts
                    Post.visibility == PostVisibility.public  # Public posts
                )
            )

            posts = query.order_by(desc(Post.created_at)).offset(offset).limit(limit).all()

            return [self._post_to_dict(p) for p in posts]

        except Exception as e:
            logger.error(f"Error getting posts feed: {e}")
            return []

    async def get_user_posts(
        self,
        db: Session,
        user_id: int,
        profile_user_id: int,
        limit: int = 20,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get posts by a specific user"""
        try:
            # Check if viewing own profile or friend
            is_own_profile = (user_id == profile_user_id)
            is_friend = db.query(Friend).filter(
                and_(
                    or_(
                        and_(Friend.user_id == user_id, Friend.friend_id == profile_user_id),
                        and_(Friend.user_id == profile_user_id, Friend.friend_id == user_id)
                    ),
                    Friend.status == "active"
                )
            ).first() is not None

            # Build query
            query = db.query(Post).filter(
                and_(
                    Post.user_id == profile_user_id,
                    Post.is_deleted == False
                )
            )

            # Apply visibility filter
            if not is_own_profile and not is_friend:
                query = query.filter(Post.visibility == PostVisibility.public)

            posts = query.order_by(desc(Post.created_at)).offset(offset).limit(limit).all()

            return [self._post_to_dict(p) for p in posts]

        except Exception as e:
            logger.error(f"Error getting user posts: {e}")
            return []

    async def save_post(
        self,
        db: Session,
        post_id: int,
        user_id: int,
        collection_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Save a post"""
        try:
            # Check if already saved
            existing = db.query(SavedPost).filter(
                and_(
                    SavedPost.post_id == post_id,
                    SavedPost.user_id == user_id
                )
            ).first()

            if existing:
                return {"success": False, "message": "Post already saved"}

            saved_post = SavedPost(
                post_id=post_id,
                user_id=user_id,
                collection_name=collection_name
            )

            db.add(saved_post)
            db.commit()

            return {"success": True, "message": "Post saved"}

        except Exception as e:
            logger.error(f"Error saving post: {e}")
            db.rollback()
            return {"success": False, "message": f"Error saving post: {str(e)}"}

    async def unsave_post(
        self,
        db: Session,
        post_id: int,
        user_id: int
    ) -> Dict[str, Any]:
        """Unsave a post"""
        try:
            saved_post = db.query(SavedPost).filter(
                and_(
                    SavedPost.post_id == post_id,
                    SavedPost.user_id == user_id
                )
            ).first()

            if not saved_post:
                return {"success": False, "message": "Post not saved"}

            db.delete(saved_post)
            db.commit()

            return {"success": True, "message": "Post unsaved"}

        except Exception as e:
            logger.error(f"Error unsaving post: {e}")
            db.rollback()
            return {"success": False, "message": f"Error unsaving post: {str(e)}"}

    async def report_post(
        self,
        db: Session,
        post_id: int,
        user_id: int,
        reason: str,
        description: Optional[str] = None
    ) -> Dict[str, Any]:
        """Report a post"""
        try:
            # Check if already reported
            existing = db.query(ReportedPost).filter(
                and_(
                    ReportedPost.post_id == post_id,
                    ReportedPost.reporter_id == user_id
                )
            ).first()

            if existing:
                return {"success": False, "message": "Post already reported"}

            reported = ReportedPost(
                post_id=post_id,
                reporter_id=user_id,
                reason=reason,
                description=description,
                status="pending"
            )

            db.add(reported)
            db.commit()

            return {"success": True, "message": "Post reported"}

        except Exception as e:
            logger.error(f"Error reporting post: {e}")
            db.rollback()
            return {"success": False, "message": f"Error reporting post: {str(e)}"}

    async def hide_post(
        self,
        db: Session,
        post_id: int,
        user_id: int
    ) -> Dict[str, Any]:
        """Hide a post from user's feed"""
        try:
            # In production, create a HiddenPost model
            # For now, use cache to track hidden posts
            cache_key = f"hidden_post_{user_id}_{post_id}"
            await redis_cache.set_cache(cache_key, True, expire=86400 * 30)  # 30 days

            return {"success": True, "message": "Post hidden"}

        except Exception as e:
            logger.error(f"Error hiding post: {e}")
            return {"success": False, "message": f"Error hiding post: {str(e)}"}

    def _post_to_dict(self, post: Post) -> Dict[str, Any]:
        """Convert post to dictionary"""
        return {
            "id": post.id,
            "user_id": post.user_id,
            "post_type": post.post_type.value if hasattr(post.post_type, 'value') else str(post.post_type),
            "content": post.content,
            "media_urls": post.media_urls or [],
            "link_url": post.link_url,
            "link_preview": post.link_preview,
            "visibility": post.visibility.value if hasattr(post.visibility, 'value') else str(post.visibility),
            "location": post.location,
            "hashtags": post.hashtags or [],
            "mentions": post.mentions or [],
            "likes_count": post.likes_count,
            "comments_count": post.comments_count,
            "shares_count": post.shares_count,
            "views_count": post.views_count,
            "is_edited": post.is_edited,
            "created_at": post.created_at.isoformat() if post.created_at else None,
            "updated_at": post.updated_at.isoformat() if post.updated_at else None
        }

# Global service instance
post_service = PostService()

