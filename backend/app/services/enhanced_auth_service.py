import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.user import User
from app.services.auth_service import create_access_token, verify_password, hash_password
from app.cache import redis_cache

logger = structlog.get_logger()

class EnhancedAuthService:
    """Enhanced authentication service with session management and token refresh"""
    
    def __init__(self):
        self.access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        self.refresh_token_expire_days = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
        self.max_sessions_per_user = int(os.getenv("MAX_SESSIONS_PER_USER", "5"))
    
    async def create_session(
        self,
        db: Session,
        user_id: int,
        device_info: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create a new user session"""
        try:
            # Check session limit
            active_sessions = await self._get_active_sessions(db, user_id)
            if len(active_sessions) >= self.max_sessions_per_user:
                # Remove oldest session
                await self._remove_oldest_session(db, user_id)
            
            # Create access token
            access_token = create_access_token(
                data={"sub": str(user_id), "type": "access"},
                expires_delta=timedelta(minutes=self.access_token_expire_minutes)
            )
            
            # Create refresh token
            refresh_token = create_access_token(
                data={"sub": str(user_id), "type": "refresh"},
                expires_delta=timedelta(days=self.refresh_token_expire_days)
            )
            
            # Store session
            session_data = {
                "user_id": user_id,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "device_info": device_info or {},
                "created_at": datetime.utcnow().isoformat(),
                "expires_at": (datetime.utcnow() + timedelta(days=self.refresh_token_expire_days)).isoformat()
            }
            
            session_key = f"session_{user_id}_{datetime.utcnow().timestamp()}"
            await redis_cache.set_cache(session_key, session_data, expire=self.refresh_token_expire_days * 86400)
            
            return {
                "success": True,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "token_type": "bearer",
                "expires_in": self.access_token_expire_minutes * 60
            }
            
        except Exception as e:
            logger.error(f"Error creating session: {e}")
            return {"success": False, "message": f"Error: {str(e)}"}
    
    async def refresh_token(
        self,
        db: Session,
        refresh_token: str
    ) -> Dict[str, Any]:
        """Refresh access token"""
        try:
            # Verify refresh token (in production, use JWT verification)
            # For now, check cache
            session_key = await self._find_session_by_refresh_token(refresh_token)
            if not session_key:
                return {"success": False, "message": "Invalid refresh token"}
            
            session_data = await redis_cache.get_cache(session_key)
            if not session_data:
                return {"success": False, "message": "Session expired"}
            
            user_id = session_data["user_id"]
            
            # Create new access token
            new_access_token = create_access_token(
                data={"sub": str(user_id), "type": "access"},
                expires_delta=timedelta(minutes=self.access_token_expire_minutes)
            )
            
            # Update session
            session_data["access_token"] = new_access_token
            session_data["last_refresh"] = datetime.utcnow().isoformat()
            await redis_cache.set_cache(session_key, session_data, expire=self.refresh_token_expire_days * 86400)
            
            return {
                "success": True,
                "access_token": new_access_token,
                "token_type": "bearer",
                "expires_in": self.access_token_expire_minutes * 60
            }
            
        except Exception as e:
            logger.error(f"Error refreshing token: {e}")
            return {"success": False, "message": f"Error: {str(e)}"}
    
    async def revoke_session(
        self,
        db: Session,
        user_id: int,
        session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Revoke a session"""
        try:
            if session_id:
                await redis_cache.delete_cache(session_id)
            else:
                # Revoke all sessions
                sessions = await self._get_active_sessions(db, user_id)
                for session_key in sessions:
                    await redis_cache.delete_cache(session_key)
            
            return {"success": True, "message": "Session revoked"}
            
        except Exception as e:
            logger.error(f"Error revoking session: {e}")
            return {"success": False, "message": f"Error: {str(e)}"}
    
    async def _get_active_sessions(
        self,
        db: Session,
        user_id: int
    ) -> List[str]:
        """Get active session keys for user"""
        # In production, query from database
        # For now, return empty list
        return []
    
    async def _remove_oldest_session(
        self,
        db: Session,
        user_id: int
    ):
        """Remove oldest session"""
        sessions = await self._get_active_sessions(db, user_id)
        if sessions:
            await redis_cache.delete_cache(sessions[0])
    
    async def _find_session_by_refresh_token(self, refresh_token: str) -> Optional[str]:
        """Find session by refresh token"""
        # In production, query from database
        # For now, return None
        return None

# Global service instance
enhanced_auth_service = EnhancedAuthService()

