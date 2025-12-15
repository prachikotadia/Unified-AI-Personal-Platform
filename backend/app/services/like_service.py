import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.social_db import Like, CommentLike, Post, Comment
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class LikeService:
    def __init__(self):
        pass

    async def like_post(
        self,
        db: Session,
        post_id: int,
        user_id: int
    ) -> Dict[str, Any]:
        """Like a post"""
        try:
            # Check if already liked
            existing = db.query(Like).filter(
                and_(
                    Like.post_id == post_id,
                    Like.user_id == user_id
                )
            ).first()

            if existing:
                return {"success": False, "message": "Post already liked"}

            # Create like
            like = Like(
                post_id=post_id,
                user_id=user_id
            )

            db.add(like)

            # Update post likes count
            post = db.query(Post).filter(Post.id == post_id).first()
            if post:
                post.likes_count = (post.likes_count or 0) + 1

            db.commit()

            return {
                "success": True,
                "message": "Post liked",
                "likes_count": post.likes_count if post else 0
            }

        except Exception as e:
            logger.error(f"Error liking post: {e}")
            db.rollback()
            return {"success": False, "message": f"Error liking post: {str(e)}"}

    async def unlike_post(
        self,
        db: Session,
        post_id: int,
        user_id: int
    ) -> Dict[str, Any]:
        """Unlike a post"""
        try:
            like = db.query(Like).filter(
                and_(
                    Like.post_id == post_id,
                    Like.user_id == user_id
                )
            ).first()

            if not like:
                return {"success": False, "message": "Post not liked"}

            db.delete(like)

            # Update post likes count
            post = db.query(Post).filter(Post.id == post_id).first()
            if post:
                post.likes_count = max(0, (post.likes_count or 0) - 1)

            db.commit()

            return {
                "success": True,
                "message": "Post unliked",
                "likes_count": post.likes_count if post else 0
            }

        except Exception as e:
            logger.error(f"Error unliking post: {e}")
            db.rollback()
            return {"success": False, "message": f"Error unliking post: {str(e)}"}

    async def like_comment(
        self,
        db: Session,
        comment_id: int,
        user_id: int
    ) -> Dict[str, Any]:
        """Like a comment"""
        try:
            # Check if already liked
            existing = db.query(CommentLike).filter(
                and_(
                    CommentLike.comment_id == comment_id,
                    CommentLike.user_id == user_id
                )
            ).first()

            if existing:
                return {"success": False, "message": "Comment already liked"}

            # Create like
            like = CommentLike(
                comment_id=comment_id,
                user_id=user_id
            )

            db.add(like)

            # Update comment likes count
            comment = db.query(Comment).filter(Comment.id == comment_id).first()
            if comment:
                comment.likes_count = (comment.likes_count or 0) + 1

            db.commit()

            return {
                "success": True,
                "message": "Comment liked",
                "likes_count": comment.likes_count if comment else 0
            }

        except Exception as e:
            logger.error(f"Error liking comment: {e}")
            db.rollback()
            return {"success": False, "message": f"Error liking comment: {str(e)}"}

    async def get_post_likes(
        self,
        db: Session,
        post_id: int,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get users who liked a post"""
        try:
            likes = db.query(Like).filter(
                Like.post_id == post_id
            ).order_by(desc(Like.created_at)).limit(limit).all()

            return [{"user_id": l.user_id, "created_at": l.created_at.isoformat() if l.created_at else None} for l in likes]

        except Exception as e:
            logger.error(f"Error getting post likes: {e}")
            return []

# Global service instance
like_service = LikeService()

