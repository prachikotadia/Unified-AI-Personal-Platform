import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.social_db import Post, Comment, Like, Share, FriendRequest, Follow
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class SocialNotificationService:
    def __init__(self):
        pass

    async def send_like_notification(
        self,
        db: Session,
        post_id: int,
        liker_id: int
    ) -> Dict[str, Any]:
        """Send notification for post like"""
        try:
            post = db.query(Post).filter(Post.id == post_id).first()
            if not post or post.user_id == liker_id:
                return {"success": False, "message": "Invalid post or own post"}

            liker = db.query(User).filter(User.id == liker_id).first()

            notification = {
                "user_id": post.user_id,
                "type": "post_liked",
                "post_id": post_id,
                "liker_id": liker_id,
                "liker_name": liker.display_name or liker.username if liker else "Someone",
                "message": f"{liker.display_name or liker.username if liker else 'Someone'} liked your post",
                "timestamp": datetime.utcnow().isoformat()
            }

            await redis_cache.set_cache(
                f"notification_{post.user_id}_{post_id}_like",
                notification,
                expire=86400
            )

            return {"success": True, "notification": notification}

        except Exception as e:
            logger.error(f"Error sending like notification: {e}")
            return {"success": False, "message": f"Error: {str(e)}"}

    async def send_comment_notification(
        self,
        db: Session,
        post_id: int,
        comment_id: int,
        commenter_id: int
    ) -> Dict[str, Any]:
        """Send notification for post comment"""
        try:
            post = db.query(Post).filter(Post.id == post_id).first()
            if not post or post.user_id == commenter_id:
                return {"success": False, "message": "Invalid post or own post"}

            commenter = db.query(User).filter(User.id == commenter_id).first()

            notification = {
                "user_id": post.user_id,
                "type": "post_commented",
                "post_id": post_id,
                "comment_id": comment_id,
                "commenter_id": commenter_id,
                "commenter_name": commenter.display_name or commenter.username if commenter else "Someone",
                "message": f"{commenter.display_name or commenter.username if commenter else 'Someone'} commented on your post",
                "timestamp": datetime.utcnow().isoformat()
            }

            await redis_cache.set_cache(
                f"notification_{post.user_id}_{post_id}_comment_{comment_id}",
                notification,
                expire=86400
            )

            return {"success": True, "notification": notification}

        except Exception as e:
            logger.error(f"Error sending comment notification: {e}")
            return {"success": False, "message": f"Error: {str(e)}"}

    async def send_friend_request_notification(
        self,
        db: Session,
        request_id: int
    ) -> Dict[str, Any]:
        """Send notification for friend request"""
        try:
            request = db.query(FriendRequest).filter(FriendRequest.id == request_id).first()
            if not request:
                return {"success": False, "message": "Request not found"}

            sender = db.query(User).filter(User.id == request.sender_id).first()

            notification = {
                "user_id": request.receiver_id,
                "type": "friend_request",
                "request_id": request_id,
                "sender_id": request.sender_id,
                "sender_name": sender.display_name or sender.username if sender else "Someone",
                "message": f"{sender.display_name or sender.username if sender else 'Someone'} sent you a friend request",
                "timestamp": datetime.utcnow().isoformat()
            }

            await redis_cache.set_cache(
                f"notification_{request.receiver_id}_friend_request_{request_id}",
                notification,
                expire=86400 * 7  # 7 days
            )

            return {"success": True, "notification": notification}

        except Exception as e:
            logger.error(f"Error sending friend request notification: {e}")
            return {"success": False, "message": f"Error: {str(e)}"}

    async def send_follow_notification(
        self,
        db: Session,
        follower_id: int,
        following_id: int
    ) -> Dict[str, Any]:
        """Send notification for new follower"""
        try:
            follower = db.query(User).filter(User.id == follower_id).first()

            notification = {
                "user_id": following_id,
                "type": "new_follower",
                "follower_id": follower_id,
                "follower_name": follower.display_name or follower.username if follower else "Someone",
                "message": f"{follower.display_name or follower.username if follower else 'Someone'} started following you",
                "timestamp": datetime.utcnow().isoformat()
            }

            await redis_cache.set_cache(
                f"notification_{following_id}_follow_{follower_id}",
                notification,
                expire=86400
            )

            return {"success": True, "notification": notification}

        except Exception as e:
            logger.error(f"Error sending follow notification: {e}")
            return {"success": False, "message": f"Error: {str(e)}"}

# Global service instance
social_notification_service = SocialNotificationService()

