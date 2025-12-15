import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func
from app.models.user import User
from app.cache import redis_cache

logger = structlog.get_logger()

class RBACService:
    """Role-Based Access Control Service"""
    
    def __init__(self):
        # Define roles and permissions
        self.roles = {
            "admin": [
                "read:all", "write:all", "delete:all",
                "manage:users", "manage:content", "manage:system"
            ],
            "moderator": [
                "read:all", "write:content", "delete:content",
                "moderate:posts", "moderate:comments"
            ],
            "user": [
                "read:own", "write:own", "delete:own",
                "read:public", "write:posts", "write:comments"
            ],
            "guest": [
                "read:public", "read:own"
            ]
        }
        
        # Resource permissions
        self.resource_permissions = {
            "finance": {
                "read": ["user", "admin"],
                "write": ["user", "admin"],
                "delete": ["user", "admin"]
            },
            "fitness": {
                "read": ["user", "admin"],
                "write": ["user", "admin"],
                "delete": ["user", "admin"]
            },
            "travel": {
                "read": ["user", "admin"],
                "write": ["user", "admin"],
                "delete": ["user", "admin"]
            },
            "marketplace": {
                "read": ["user", "admin", "guest"],
                "write": ["user", "admin"],
                "delete": ["user", "admin"]
            },
            "social": {
                "read": ["user", "admin", "guest"],
                "write": ["user", "admin"],
                "delete": ["user", "admin"]
            },
            "chat": {
                "read": ["user", "admin"],
                "write": ["user", "admin"],
                "delete": ["user", "admin"]
            }
        }
    
    def get_user_role(self, user: User) -> str:
        """Get user's role"""
        # In production, check user.role field
        if hasattr(user, 'role') and user.role:
            return user.role
        return "user"  # Default role
    
    def has_permission(
        self,
        user: User,
        resource: str,
        action: str
    ) -> bool:
        """Check if user has permission for resource action"""
        try:
            role = self.get_user_role(user)
            
            # Admin has all permissions
            if role == "admin":
                return True
            
            # Check resource permissions
            if resource in self.resource_permissions:
                allowed_roles = self.resource_permissions[resource].get(action, [])
                return role in allowed_roles
            
            # Check role permissions
            role_perms = self.roles.get(role, [])
            permission = f"{action}:{resource}"
            
            # Check exact match or wildcard
            if permission in role_perms:
                return True
            if f"{action}:all" in role_perms:
                return True
            if "write:all" in role_perms and action == "write":
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking permission: {e}")
            return False
    
    def can_access_resource(
        self,
        user: User,
        resource_id: int,
        resource_type: str,
        resource_owner_id: Optional[int] = None
    ) -> bool:
        """Check if user can access a specific resource"""
        try:
            role = self.get_user_role(user)
            
            # Admin can access everything
            if role == "admin":
                return True
            
            # User can access their own resources
            if resource_owner_id and user.id == resource_owner_id:
                return True
            
            # Check if resource is public
            # This would require checking the resource's visibility setting
            # For now, return False for other users' private resources
            return False
            
        except Exception as e:
            logger.error(f"Error checking resource access: {e}")
            return False
    
    def get_user_permissions(self, user: User) -> List[str]:
        """Get all permissions for a user"""
        role = self.get_user_role(user)
        return self.roles.get(role, [])

# Global service instance
rbac_service = RBACService()

