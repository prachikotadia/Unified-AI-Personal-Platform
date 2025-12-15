import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.social_db import Comment, Post
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class CommentService:
    def __init__(self):
        pass

    async def create_comment(
        self,
        db: Session,
        post_id: int,
        user_id: int,
        content: str,
        parent_comment_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Create a comment on a post"""
        try:
            # Verify post exists
            post = db.query(Post).filter(Post.id == post_id).first()
            if not post:
                return {"success": False, "message": "Post not found"}

            comment = Comment(
                post_id=post_id,
                user_id=user_id,
                content=content,
                parent_comment_id=parent_comment_id
            )

            db.add(comment)
            
            # Update post comments count
            post.comments_count = (post.comments_count or 0) + 1
            
            db.commit()
            db.refresh(comment)

            return {
                "success": True,
                "comment": self._comment_to_dict(comment)
            }

        except Exception as e:
            logger.error(f"Error creating comment: {e}")
            db.rollback()
            return {"success": False, "message": f"Error creating comment: {str(e)}"}

    async def update_comment(
        self,
        db: Session,
        comment_id: int,
        user_id: int,
        content: str
    ) -> Dict[str, Any]:
        """Update a comment"""
        try:
            comment = db.query(Comment).filter(
                and_(
                    Comment.id == comment_id,
                    Comment.user_id == user_id
                )
            ).first()

            if not comment:
                return {"success": False, "message": "Comment not found"}

            comment.content = content
            comment.is_edited = True
            comment.edited_at = datetime.utcnow()
            comment.updated_at = datetime.utcnow()

            db.commit()
            db.refresh(comment)

            return {
                "success": True,
                "comment": self._comment_to_dict(comment)
            }

        except Exception as e:
            logger.error(f"Error updating comment: {e}")
            db.rollback()
            return {"success": False, "message": f"Error updating comment: {str(e)}"}

    async def delete_comment(
        self,
        db: Session,
        comment_id: int,
        user_id: int
    ) -> Dict[str, Any]:
        """Delete a comment"""
        try:
            comment = db.query(Comment).filter(
                and_(
                    Comment.id == comment_id,
                    Comment.user_id == user_id
                )
            ).first()

            if not comment:
                return {"success": False, "message": "Comment not found"}

            # Update post comments count
            post = db.query(Post).filter(Post.id == comment.post_id).first()
            if post:
                post.comments_count = max(0, (post.comments_count or 0) - 1)

            comment.is_deleted = True
            comment.deleted_at = datetime.utcnow()

            db.commit()

            return {"success": True, "message": "Comment deleted"}

        except Exception as e:
            logger.error(f"Error deleting comment: {e}")
            db.rollback()
            return {"success": False, "message": f"Error deleting comment: {str(e)}"}

    async def get_post_comments(
        self,
        db: Session,
        post_id: int,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get comments for a post"""
        try:
            comments = db.query(Comment).filter(
                and_(
                    Comment.post_id == post_id,
                    Comment.is_deleted == False,
                    Comment.parent_comment_id.is_(None)  # Top-level comments only
                )
            ).order_by(desc(Comment.created_at)).offset(offset).limit(limit).all()

            result = []
            for comment in comments:
                comment_dict = self._comment_to_dict(comment)
                # Get replies
                replies = db.query(Comment).filter(
                    and_(
                        Comment.parent_comment_id == comment.id,
                        Comment.is_deleted == False
                    )
                ).order_by(Comment.created_at).all()
                comment_dict["replies"] = [self._comment_to_dict(r) for r in replies]
                result.append(comment_dict)

            return result

        except Exception as e:
            logger.error(f"Error getting post comments: {e}")
            return []

    def _comment_to_dict(self, comment: Comment) -> Dict[str, Any]:
        """Convert comment to dictionary"""
        return {
            "id": comment.id,
            "post_id": comment.post_id,
            "user_id": comment.user_id,
            "parent_comment_id": comment.parent_comment_id,
            "content": comment.content,
            "likes_count": comment.likes_count,
            "is_edited": comment.is_edited,
            "created_at": comment.created_at.isoformat() if comment.created_at else None,
            "updated_at": comment.updated_at.isoformat() if comment.updated_at else None
        }

# Global service instance
comment_service = CommentService()

