from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import structlog
import secrets
import string

from app.models.user import User, UserSession
from app.auth.jwt_handler import JWTHandler
from app.utils.email_service import EmailService
from app.utils.phone_service import PhoneService

logger = structlog.get_logger()

class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.email_service = EmailService()
        self.phone_service = PhoneService()
    
    def create_user(self, username: str, email: str, password: str, **kwargs) -> User:
        """Create a new user"""
        # Check if user already exists
        existing_user = self.db.query(User).filter(
            (User.username == username) | (User.email == email)
        ).first()
        
        if existing_user:
            if existing_user.username == username:
                raise ValueError("Username already exists")
            else:
                raise ValueError("Email already exists")
        
        # Create new user
        user = User(
            username=username,
            email=email,
            **kwargs
        )
        user.set_password(password)
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        logger.info(f"Created new user: {user.username}")
        return user
    
    def authenticate_user(self, username_or_email: str, password: str) -> Optional[User]:
        """Authenticate user with username/email and password"""
        user = self.db.query(User).filter(
            (User.username == username_or_email) | (User.email == username_or_email)
        ).first()
        
        if not user or not user.verify_password(password):
            return None
        
        if not user.is_active:
            raise ValueError("User account is disabled")
        
        # Update last login
        user.last_login = datetime.utcnow()
        self.db.commit()
        
        return user
    
    def create_user_session(self, user: User, ip_address: str = None, user_agent: str = None) -> Dict[str, str]:
        """Create user session with access and refresh tokens"""
        # Generate tokens
        access_token = JWTHandler.create_access_token({"sub": str(user.id)})
        refresh_token = JWTHandler.create_refresh_token({"sub": str(user.id)})
        
        # Create session
        session = UserSession(
            user_id=user.id,
            token=access_token,
            refresh_token=refresh_token,
            expires_at=datetime.utcnow() + timedelta(minutes=30),  # Access token expires in 30 min
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        self.db.add(session)
        self.db.commit()
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 1800  # 30 minutes
        }
    
    def refresh_access_token(self, refresh_token: str) -> Optional[Dict[str, str]]:
        """Refresh access token using refresh token"""
        try:
            payload = JWTHandler.verify_token(refresh_token)
            token_type = payload.get("type")
            
            if token_type != "refresh":
                return None
            
            user_id = payload.get("sub")
            user = self.get_user_by_id(user_id)
            
            if not user or not user.is_active:
                return None
            
            # Check if refresh token exists in database
            session = self.db.query(UserSession).filter(
                UserSession.refresh_token == refresh_token,
                UserSession.is_active == True
            ).first()
            
            if not session or session.is_expired():
                return None
            
            # Generate new access token
            new_access_token = JWTHandler.create_access_token({"sub": str(user.id)})
            
            # Update session
            session.token = new_access_token
            session.expires_at = datetime.utcnow() + timedelta(minutes=30)
            self.db.commit()
            
            return {
                "access_token": new_access_token,
                "token_type": "bearer",
                "expires_in": 1800
            }
            
        except:
            return None
    
    def logout_user(self, token: str) -> bool:
        """Logout user by deactivating session"""
        session = self.db.query(UserSession).filter(
            UserSession.token == token,
            UserSession.is_active == True
        ).first()
        
        if session:
            session.is_active = False
            self.db.commit()
            return True
        
        return False
    
    def get_user_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        return self.db.query(User).filter(User.username == username).first()
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()
    
    def update_user_profile(self, user: User, **kwargs) -> User:
        """Update user profile"""
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)
        
        user.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(user)
        
        return user
    
    def change_password(self, user: User, current_password: str, new_password: str) -> bool:
        """Change user password"""
        if not user.verify_password(current_password):
            return False
        
        user.set_password(new_password)
        user.updated_at = datetime.utcnow()
        self.db.commit()
        
        return True
    
    def send_verification_email(self, user: User) -> bool:
        """Send email verification"""
        try:
            # Generate verification token
            verification_token = self._generate_verification_token()
            
            # Store token in user preferences (in production, use Redis)
            if not user.preferences:
                user.preferences = {}
            user.preferences["email_verification_token"] = verification_token
            user.preferences["email_verification_expires"] = (datetime.utcnow() + timedelta(hours=24)).isoformat()
            
            self.db.commit()
            
            # Send email
            verification_url = f"http://localhost:3000/verify-email?token={verification_token}"
            self.email_service.send_verification_email(user.email, user.username, verification_url)
            
            return True
        except Exception as e:
            logger.error(f"Failed to send verification email: {str(e)}")
            return False
    
    def verify_email(self, token: str) -> Optional[User]:
        """Verify email with token"""
        user = self.db.query(User).filter(
            User.preferences.contains({"email_verification_token": token})
        ).first()
        
        if not user:
            return None
        
        # Check if token is expired
        expires_at = user.preferences.get("email_verification_expires")
        if expires_at and datetime.fromisoformat(expires_at) < datetime.utcnow():
            return None
        
        # Mark email as verified
        user.is_verified = True
        user.email_verified_at = datetime.utcnow()
        
        # Remove verification token
        if user.preferences:
            user.preferences.pop("email_verification_token", None)
            user.preferences.pop("email_verification_expires", None)
        
        self.db.commit()
        return user
    
    def send_password_reset_email(self, email: str) -> bool:
        """Send password reset email"""
        user = self.get_user_by_email(email)
        if not user:
            return False
        
        try:
            # Generate reset token
            reset_token = self._generate_verification_token()
            
            # Store token in user preferences
            if not user.preferences:
                user.preferences = {}
            user.preferences["password_reset_token"] = reset_token
            user.preferences["password_reset_expires"] = (datetime.utcnow() + timedelta(hours=1)).isoformat()
            
            self.db.commit()
            
            # Send email
            reset_url = f"http://localhost:3000/reset-password?token={reset_token}"
            self.email_service.send_password_reset_email(user.email, user.username, reset_url)
            
            return True
        except Exception as e:
            logger.error(f"Failed to send password reset email: {str(e)}")
            return False
    
    def reset_password(self, token: str, new_password: str) -> Optional[User]:
        """Reset password with token"""
        user = self.db.query(User).filter(
            User.preferences.contains({"password_reset_token": token})
        ).first()
        
        if not user:
            return None
        
        # Check if token is expired
        expires_at = user.preferences.get("password_reset_expires")
        if expires_at and datetime.fromisoformat(expires_at) < datetime.utcnow():
            return None
        
        # Update password
        user.set_password(new_password)
        user.updated_at = datetime.utcnow()
        
        # Remove reset token
        if user.preferences:
            user.preferences.pop("password_reset_token", None)
            user.preferences.pop("password_reset_expires", None)
        
        self.db.commit()
        return user
    
    def _generate_verification_token(self) -> str:
        """Generate random verification token"""
        return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(32))
