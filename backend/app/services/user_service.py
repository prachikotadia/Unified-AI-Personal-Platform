from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
import structlog
import secrets
import string

from app.models.user import User, UserSession
from app.auth.jwt_handler import JWTHandler
from app.auth.oauth import OAuthHandler
from app.services.verification_service import VerificationService
from app.utils.email_service import EmailService
from app.utils.phone_service import PhoneService

logger = structlog.get_logger()

class UserService:
    def __init__(self, db: Session):
        self.db = db
        self.email_service = EmailService()
        self.phone_service = PhoneService()
        self.verification_service = VerificationService(db)
    
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
    
    async def authenticate_with_oauth(self, provider: str, code: str, request_info: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """Authenticate user with OAuth provider"""
        try:
            # Get user info from OAuth provider
            if provider == "google":
                oauth_user_info = await OAuthHandler.get_google_user_info(code)
            elif provider == "github":
                oauth_user_info = await OAuthHandler.get_github_user_info(code)
            else:
                raise ValueError(f"Unsupported OAuth provider: {provider}")
            
            # Check if user exists
            user = self.get_user_by_oauth_id(provider, oauth_user_info["provider_id"])
            
            if not user:
                # Check if user exists by email
                user = self.get_user_by_email(oauth_user_info["email"])
                
                if user:
                    # Link OAuth account to existing user
                    self.link_oauth_account(user, provider, oauth_user_info["provider_id"])
                else:
                    # Create new user
                    user = self.create_oauth_user(oauth_user_info)
            
            # Create session
            tokens = self.create_user_session(
                user,
                ip_address=request_info.get("ip_address"),
                user_agent=request_info.get("user_agent")
            )
            
            return {
                "user": user.to_dict(),
                "tokens": tokens,
                "is_new_user": user.created_at > datetime.utcnow() - timedelta(minutes=5)
            }
            
        except Exception as e:
            logger.error(f"OAuth authentication error: {str(e)}")
            raise ValueError(f"OAuth authentication failed: {str(e)}")
    
    def get_user_by_oauth_id(self, provider: str, provider_id: str) -> Optional[User]:
        """Get user by OAuth provider ID"""
        # This would need to be implemented based on your OAuth linking strategy
        # For now, we'll check by email
        return None
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()
    
    def link_oauth_account(self, user: User, provider: str, provider_id: str):
        """Link OAuth account to existing user"""
        # Update user's OAuth information
        if not user.preferences:
            user.preferences = {}
        
        if "oauth" not in user.preferences:
            user.preferences["oauth"] = {}
        
        user.preferences["oauth"][provider] = {
            "provider_id": provider_id,
            "linked_at": datetime.utcnow().isoformat()
        }
        
        self.db.commit()
        logger.info(f"Linked {provider} account to user {user.id}")
    
    def create_oauth_user(self, oauth_user_info: Dict[str, Any]) -> User:
        """Create new user from OAuth information"""
        # Generate unique username
        base_username = oauth_user_info.get("first_name", "user").lower()
        username = base_username
        counter = 1
        
        while self.db.query(User).filter(User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1
        
        # Create user
        user = User(
            username=username,
            email=oauth_user_info["email"],
            first_name=oauth_user_info.get("first_name", ""),
            last_name=oauth_user_info.get("last_name", ""),
            is_verified=oauth_user_info.get("verified", False),
            profile_picture=oauth_user_info.get("avatar"),
            preferences={
                "oauth": {
                    oauth_user_info["provider"]: {
                        "provider_id": oauth_user_info["provider_id"],
                        "linked_at": datetime.utcnow().isoformat()
                    }
                }
            }
        )
        
        # Set a random password for OAuth users
        user.set_password(secrets.token_urlsafe(32))
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        logger.info(f"Created new OAuth user: {user.username}")
        return user
    
    async def send_verification_email(self, user: User) -> bool:
        """Send email verification"""
        return await self.verification_service.send_email_verification(user)
    
    async def send_verification_sms(self, user: User, phone_number: str) -> bool:
        """Send SMS verification"""
        return await self.verification_service.send_sms_verification(user, phone_number)
    
    def verify_email_code(self, user_id: int, code: str) -> bool:
        """Verify email verification code"""
        return self.verification_service.verify_code(user_id, "email", code)
    
    def verify_phone_code(self, user_id: int, code: str) -> bool:
        """Verify phone verification code"""
        return self.verification_service.verify_code(user_id, "phone", code)
    
    async def resend_verification(self, user_id: int, contact_type: str) -> bool:
        """Resend verification code"""
        return self.verification_service.resend_verification_code(user_id, contact_type)
    
    def create_guest_user(self) -> User:
        """Create a temporary guest user for demo purposes"""
        guest_id = f"guest_{secrets.token_hex(8)}"
        
        user = User(
            username=guest_id,
            email=f"{guest_id}@guest.omnilife.com",
            first_name="Guest",
            last_name="User",
            is_active=True,
            is_verified=True,
            preferences={
                "theme": "light",
                "notifications": {"email": False, "push": False, "sms": False},
                "privacy": {"profile_visibility": "private"},
                "is_guest": True
            }
        )
        
        # Set a temporary password
        user.set_password(secrets.token_urlsafe(32))
        
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        
        logger.info(f"Created guest user: {user.username}")
        return user
    
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
