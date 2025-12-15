import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.social_db import Friend, FriendRequest, FriendRequestStatus, BlockedUser
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class FriendService:
    def __init__(self):
        pass

    async def get_friends(
        self,
        db: Session,
        user_id: int,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get user's friends list"""
        try:
            friends = db.query(Friend).filter(
                and_(
                    Friend.user_id == user_id,
                    Friend.status == "active"
                )
            ).offset(offset).limit(limit).all()

            return [self._friend_to_dict(f) for f in friends]

        except Exception as e:
            logger.error(f"Error getting friends: {e}")
            return []

    async def send_friend_request(
        self,
        db: Session,
        sender_id: int,
        receiver_id: int,
        message: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send a friend request"""
        try:
            # Check if already friends
            existing_friend = db.query(Friend).filter(
                or_(
                    and_(Friend.user_id == sender_id, Friend.friend_id == receiver_id),
                    and_(Friend.user_id == receiver_id, Friend.friend_id == sender_id)
                )
            ).first()

            if existing_friend:
                return {"success": False, "message": "Already friends"}

            # Check if request already exists
            existing_request = db.query(FriendRequest).filter(
                or_(
                    and_(FriendRequest.sender_id == sender_id, FriendRequest.receiver_id == receiver_id),
                    and_(FriendRequest.sender_id == receiver_id, FriendRequest.receiver_id == sender_id)
                )
            ).first()

            if existing_request:
                if existing_request.status == FriendRequestStatus.pending:
                    return {"success": False, "message": "Friend request already pending"}
                elif existing_request.status == FriendRequestStatus.accepted:
                    return {"success": False, "message": "Already friends"}

            # Check if blocked
            is_blocked = db.query(BlockedUser).filter(
                or_(
                    and_(BlockedUser.user_id == sender_id, BlockedUser.blocked_user_id == receiver_id),
                    and_(BlockedUser.user_id == receiver_id, BlockedUser.blocked_user_id == sender_id)
                )
            ).first()

            if is_blocked:
                return {"success": False, "message": "Cannot send friend request to blocked user"}

            # Create friend request
            friend_request = FriendRequest(
                sender_id=sender_id,
                receiver_id=receiver_id,
                message=message,
                status=FriendRequestStatus.pending
            )

            db.add(friend_request)
            db.commit()
            db.refresh(friend_request)

            return {
                "success": True,
                "request_id": friend_request.id,
                "message": "Friend request sent"
            }

        except Exception as e:
            logger.error(f"Error sending friend request: {e}")
            db.rollback()
            return {"success": False, "message": f"Error sending friend request: {str(e)}"}

    async def accept_friend_request(
        self,
        db: Session,
        request_id: int,
        user_id: int
    ) -> Dict[str, Any]:
        """Accept a friend request"""
        try:
            request = db.query(FriendRequest).filter(
                and_(
                    FriendRequest.id == request_id,
                    FriendRequest.receiver_id == user_id,
                    FriendRequest.status == FriendRequestStatus.pending
                )
            ).first()

            if not request:
                return {"success": False, "message": "Friend request not found"}

            # Create friendship (bidirectional)
            friendship1 = Friend(
                user_id=request.sender_id,
                friend_id=request.receiver_id,
                status="active"
            )
            friendship2 = Friend(
                user_id=request.receiver_id,
                friend_id=request.sender_id,
                status="active"
            )

            db.add(friendship1)
            db.add(friendship2)

            # Update request status
            request.status = FriendRequestStatus.accepted
            request.responded_at = datetime.utcnow()

            db.commit()

            return {
                "success": True,
                "message": "Friend request accepted",
                "friend_id": request.sender_id
            }

        except Exception as e:
            logger.error(f"Error accepting friend request: {e}")
            db.rollback()
            return {"success": False, "message": f"Error accepting friend request: {str(e)}"}

    async def decline_friend_request(
        self,
        db: Session,
        request_id: int,
        user_id: int
    ) -> Dict[str, Any]:
        """Decline a friend request"""
        try:
            request = db.query(FriendRequest).filter(
                and_(
                    FriendRequest.id == request_id,
                    FriendRequest.receiver_id == user_id,
                    FriendRequest.status == FriendRequestStatus.pending
                )
            ).first()

            if not request:
                return {"success": False, "message": "Friend request not found"}

            request.status = FriendRequestStatus.declined
            request.responded_at = datetime.utcnow()

            db.commit()

            return {"success": True, "message": "Friend request declined"}

        except Exception as e:
            logger.error(f"Error declining friend request: {e}")
            db.rollback()
            return {"success": False, "message": f"Error declining friend request: {str(e)}"}

    async def get_friend_requests(
        self,
        db: Session,
        user_id: int,
        type: str = "received"  # received or sent
    ) -> List[Dict[str, Any]]:
        """Get friend requests"""
        try:
            if type == "received":
                requests = db.query(FriendRequest).filter(
                    and_(
                        FriendRequest.receiver_id == user_id,
                        FriendRequest.status == FriendRequestStatus.pending
                    )
                ).order_by(desc(FriendRequest.created_at)).all()
            else:
                requests = db.query(FriendRequest).filter(
                    and_(
                        FriendRequest.sender_id == user_id,
                        FriendRequest.status == FriendRequestStatus.pending
                    )
                ).order_by(desc(FriendRequest.created_at)).all()

            return [self._friend_request_to_dict(r) for r in requests]

        except Exception as e:
            logger.error(f"Error getting friend requests: {e}")
            return []

    async def remove_friend(
        self,
        db: Session,
        user_id: int,
        friend_id: int
    ) -> Dict[str, Any]:
        """Remove a friend"""
        try:
            # Remove bidirectional friendship
            friendships = db.query(Friend).filter(
                or_(
                    and_(Friend.user_id == user_id, Friend.friend_id == friend_id),
                    and_(Friend.user_id == friend_id, Friend.friend_id == user_id)
                )
            ).all()

            for friendship in friendships:
                db.delete(friendship)

            db.commit()

            return {"success": True, "message": "Friend removed"}

        except Exception as e:
            logger.error(f"Error removing friend: {e}")
            db.rollback()
            return {"success": False, "message": f"Error removing friend: {str(e)}"}

    async def block_user(
        self,
        db: Session,
        user_id: int,
        blocked_user_id: int,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """Block a user"""
        try:
            # Check if already blocked
            existing = db.query(BlockedUser).filter(
                and_(
                    BlockedUser.user_id == user_id,
                    BlockedUser.blocked_user_id == blocked_user_id
                )
            ).first()

            if existing:
                return {"success": False, "message": "User already blocked"}

            # Remove friendship if exists
            await self.remove_friend(db, user_id, blocked_user_id)

            # Create block
            blocked = BlockedUser(
                user_id=user_id,
                blocked_user_id=blocked_user_id,
                reason=reason
            )

            db.add(blocked)
            db.commit()

            return {"success": True, "message": "User blocked"}

        except Exception as e:
            logger.error(f"Error blocking user: {e}")
            db.rollback()
            return {"success": False, "message": f"Error blocking user: {str(e)}"}

    async def unblock_user(
        self,
        db: Session,
        user_id: int,
        blocked_user_id: int
    ) -> Dict[str, Any]:
        """Unblock a user"""
        try:
            blocked = db.query(BlockedUser).filter(
                and_(
                    BlockedUser.user_id == user_id,
                    BlockedUser.blocked_user_id == blocked_user_id
                )
            ).first()

            if not blocked:
                return {"success": False, "message": "User not blocked"}

            db.delete(blocked)
            db.commit()

            return {"success": True, "message": "User unblocked"}

        except Exception as e:
            logger.error(f"Error unblocking user: {e}")
            db.rollback()
            return {"success": False, "message": f"Error unblocking user: {str(e)}"}

    def _friend_to_dict(self, friend: Friend) -> Dict[str, Any]:
        """Convert friend to dictionary"""
        return {
            "id": friend.id,
            "friend_id": friend.friend_id,
            "status": friend.status,
            "created_at": friend.created_at.isoformat() if friend.created_at else None
        }

    def _friend_request_to_dict(self, request: FriendRequest) -> Dict[str, Any]:
        """Convert friend request to dictionary"""
        return {
            "id": request.id,
            "sender_id": request.sender_id,
            "receiver_id": request.receiver_id,
            "status": request.status.value if hasattr(request.status, 'value') else str(request.status),
            "message": request.message,
            "created_at": request.created_at.isoformat() if request.created_at else None
        }

# Global service instance
friend_service = FriendService()

