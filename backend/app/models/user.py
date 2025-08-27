from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import re
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import bcrypt

class ThemeEnum(str, Enum):
    light = "light"
    dark = "dark"
    auto = "auto"

class ProfileVisibilityEnum(str, Enum):
    public = "public"
    friends = "friends"
    private = "private"

class UserStatusEnum(str, Enum):
    active = "active"
    inactive = "inactive"
    suspended = "suspended"
    pending = "pending"

class Location(BaseModel):
    city: Optional[str] = None
    country: Optional[str] = None
    timezone: Optional[str] = None

class NotificationPreferences(BaseModel):
    email: bool = True
    push: bool = True
    sms: bool = False

class PrivacySettings(BaseModel):
    profile_visibility: ProfileVisibilityEnum = ProfileVisibilityEnum.friends
    show_online_status: bool = True
    allow_messages: bool = True

class UserPreferences(BaseModel):
    theme: ThemeEnum = ThemeEnum.auto
    language: str = "en"
    notifications: NotificationPreferences = NotificationPreferences()
    privacy: PrivacySettings = PrivacySettings()

class SocialLinks(BaseModel):
    google_id: Optional[str] = None
    github_id: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_handle: Optional[str] = None
    website: Optional[str] = None

class Verification(BaseModel):
    email_verified: bool = False
    phone_verified: bool = False
    two_factor_enabled: bool = False
    two_factor_secret: Optional[str] = None

class LoginHistory(BaseModel):
    timestamp: datetime
    ip: Optional[str] = None
    user_agent: Optional[str] = None
    location: Optional[str] = None

class Security(BaseModel):
    password_changed_at: Optional[datetime] = None
    password_reset_token: Optional[str] = None
    password_reset_expires: Optional[datetime] = None
    email_verification_token: Optional[str] = None
    email_verification_expires: Optional[datetime] = None

class UserStats(BaseModel):
    total_logins: int = 0
    last_login: Optional[datetime] = None
    profile_views: int = 0
    posts_count: int = 0
    followers_count: int = 0
    following_count: int = 0

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    bio: Optional[str] = Field(None, max_length=500)
    date_of_birth: Optional[datetime] = None
    phone: Optional[str] = None
    location: Optional[Location] = None

    @validator('username')
    def validate_username(cls, v):
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError('Username can only contain letters, numbers, and underscores')
        return v

    @validator('phone')
    def validate_phone(cls, v):
        if v and not re.match(r'^\+?1?\d{9,15}$', v):
            raise ValueError('Invalid phone number format')
        return v

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=30)
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    bio: Optional[str] = Field(None, max_length=500)
    date_of_birth: Optional[datetime] = None
    phone: Optional[str] = None
    location: Optional[Location] = None
    avatar: Optional[str] = None
    preferences: Optional[UserPreferences] = None
    social: Optional[SocialLinks] = None

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    avatar: Optional[str] = None
    preferences: UserPreferences = UserPreferences()
    social: SocialLinks = SocialLinks()
    verification: Verification = Verification()
    status: UserStatusEnum = UserStatusEnum.pending
    last_seen: datetime = Field(default_factory=datetime.utcnow)
    login_history: List[LoginHistory] = []
    security: Security = Security()
    stats: UserStats = UserStats()
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        allow_population_by_field_name = True
        schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "username": "johndoe",
                "email": "john@example.com",
                "first_name": "John",
                "last_name": "Doe",
                "bio": "Software developer and fitness enthusiast",
                "avatar": "https://example.com/avatar.jpg",
                "status": "active",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        }

class UserResponse(UserInDB):
    """User response model for API responses"""
    full_name: str
    display_name: str

    @validator('full_name', pre=True, always=True)
    def set_full_name(cls, v, values):
        return f"{values.get('first_name', '')} {values.get('last_name', '')}".strip()

    @validator('display_name', pre=True, always=True)
    def set_display_name(cls, v, values):
        return values.get('username') or values.get('full_name', '')

class UserProfile(BaseModel):
    """Public user profile for social features"""
    id: str
    username: str
    first_name: str
    last_name: str
    bio: Optional[str] = None
    avatar: Optional[str] = None
    location: Optional[Location] = None
    stats: UserStats
    created_at: datetime
    is_following: Optional[bool] = None

class UserSearch(BaseModel):
    """User search result"""
    id: str
    username: str
    first_name: str
    last_name: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    stats: UserStats

class UserRecommendation(BaseModel):
    """User recommendation for social features"""
    id: str
    username: str
    first_name: str
    last_name: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    stats: UserStats
    follower_count: int
    mutual_friends: Optional[int] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=128)

class PasswordReset(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6, max_length=128)

class EmailVerification(BaseModel):
    token: str

class TwoFactorSetup(BaseModel):
    enable: bool

class TwoFactorVerify(BaseModel):
    code: str = Field(..., min_length=6, max_length=6)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class OAuthRequest(BaseModel):
    provider: str  # google, github, etc.
    code: str
    redirect_uri: str

class UserSettings(BaseModel):
    """User settings update model"""
    preferences: Optional[UserPreferences] = None
    privacy: Optional[PrivacySettings] = None
    notifications: Optional[NotificationPreferences] = None

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(50))
    last_name = Column(String(50))
    phone = Column(String(20))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    email_verified_at = Column(DateTime)
    phone_verified_at = Column(DateTime)
    profile_picture = Column(String(255))
    date_of_birth = Column(DateTime)
    gender = Column(String(10))
    address = Column(JSON)  # Store address as JSON
    preferences = Column(JSON)  # Store user preferences
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    last_login = Column(DateTime)
    
    # Relationships
    orders = relationship("Order", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user")
    wishlist_items = relationship("WishlistItem", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    price_alerts = relationship("PriceAlert", back_populates="user")
    product_comparisons = relationship("ProductComparison", back_populates="user")
    recently_viewed = relationship("RecentlyViewed", back_populates="user")
    product_questions = relationship("ProductQuestion", back_populates="user")
    product_answers = relationship("ProductAnswer", back_populates="user")
    payment_methods = relationship("PaymentMethod", back_populates="user")
    addresses = relationship("Address", back_populates="user")
    ai_recommendations = relationship("AIRecommendation", back_populates="user")
    
    def set_password(self, password: str):
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    def verify_password(self, password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def to_dict(self):
        """Convert user to dictionary (excluding sensitive data)"""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone": self.phone,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "profile_picture": self.profile_picture,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "gender": self.gender,
            "address": self.address,
            "preferences": self.preferences,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None
        }

class UserSession(Base):
    __tablename__ = "user_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    token = Column(String(255), unique=True, index=True, nullable=False)
    refresh_token = Column(String(255), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    def is_expired(self) -> bool:
        """Check if session is expired"""
        return datetime.utcnow() > self.expires_at
