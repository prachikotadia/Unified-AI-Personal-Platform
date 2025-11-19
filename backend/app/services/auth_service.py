from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import jwt
import bcrypt
import uuid
from typing import Optional

from app.models.user import User
from app.schemas import auth_schemas
from app.config import settings

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user by email"""
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Get user by username"""
    return db.query(User).filter(User.username == username).first()

def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """Get user by ID"""
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user_data: auth_schemas.UserCreate) -> auth_schemas.UserResponse:
    """Create a new user"""
    # Check if email already exists
    if get_user_by_email(db, user_data.email):
        raise ValueError("Email already registered")
    
    # Check if username already exists
    if get_user_by_username(db, user_data.username):
        raise ValueError("Username already taken")
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        display_name=user_data.display_name or user_data.username,
        bio=user_data.bio,
        location=user_data.location,
        is_verified=True,  # Auto-verify for demo
        is_guest=False
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return auth_schemas.UserResponse.model_validate(db_user)

def authenticate_user(db: Session, login_data: auth_schemas.UserLogin) -> auth_schemas.LoginResponse:
    """Authenticate user and return JWT token"""
    user = get_user_by_email(db, login_data.email)
    if not user:
        raise ValueError("Invalid email or password")
    
    if not user.hashed_password or not verify_password(login_data.password, user.hashed_password):
        raise ValueError("Invalid email or password")
    
    if not user.is_active:
        raise ValueError("Account is deactivated")
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return auth_schemas.LoginResponse(
        access_token=access_token,
        user=auth_schemas.UserResponse.model_validate(user)
    )

def create_guest_user(db: Session) -> auth_schemas.LoginResponse:
    """Create a temporary guest user for demo mode"""
    # Generate unique guest username and email
    guest_id = str(uuid.uuid4())[:8]
    guest_username = f"guest_{guest_id}"
    guest_email = f"guest_{guest_id}@demo.omnilife.com"
    
    # Create guest user
    db_user = User(
        username=guest_username,
        email=guest_email,
        hashed_password=None,  # No password for guest
        display_name="Demo User",
        bio="Welcome to OmniLife! This is a demo account.",
        location="Demo Location",
        is_verified=True,
        is_guest=True,
        is_active=True
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create access token
    access_token = create_access_token(data={"sub": str(db_user.id)})
    
    return auth_schemas.LoginResponse(
        access_token=access_token,
        user=auth_schemas.UserResponse.model_validate(db_user)
    )
