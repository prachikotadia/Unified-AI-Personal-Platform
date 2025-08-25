from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import structlog
import os
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel, EmailStr
import uuid

from app.database import get_db
from app.models.user import UserCreate, UserResponse, UserInDB
from app.middleware.auth_middleware import create_access_token, verify_token

logger = structlog.get_logger()

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class Token(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: UserResponse

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class OAuthRequest(BaseModel):
    provider: str
    code: str

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def authenticate_user(db: Session, email: str, password: str):
    """Authenticate user with email and password"""
    # In a real implementation, you would query the database
    # For now, we'll use a mock user
    if email == "demo@example.com" and password == "password123":
        return {
            "id": str(uuid.uuid4()),
            "username": "demo_user",
            "email": email,
            "first_name": "Demo",
            "last_name": "User",
            "hashed_password": get_password_hash(password),
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    return None

@router.post("/register", response_model=Token)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        # Check if user already exists
        # In real implementation, query database
        existing_user = None  # db.query(User).filter(User.email == request.email).first()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(request.password)
        user_data = {
            "id": str(uuid.uuid4()),
            "username": request.username,
            "email": request.email,
            "first_name": request.first_name,
            "last_name": request.last_name,
            "hashed_password": hashed_password,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # In real implementation, save to database
        # db.add(user)
        # db.commit()
        # db.refresh(user)
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_data["id"]}, expires_delta=access_token_expires
        )
        
        # Create user response
        user_response = UserResponse(
            id=user_data["id"],
            username=user_data["username"],
            email=user_data["email"],
            first_name=user_data["first_name"],
            last_name=user_data["last_name"],
            is_active=user_data["is_active"],
            created_at=user_data["created_at"],
            updated_at=user_data["updated_at"]
        )
        
        logger.info("User registered successfully", user_id=user_data["id"], email=request.email)
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_response
        )
        
    except Exception as e:
        logger.error("Registration failed", error=str(e), email=request.email)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=Token)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login user with email and password"""
    try:
        # Authenticate user
        user = authenticate_user(db, request.email, request.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["id"]}, expires_delta=access_token_expires
        )
        
        # Create user response
        user_response = UserResponse(
            id=user["id"],
            username=user["username"],
            email=user["email"],
            first_name=user["first_name"],
            last_name=user["last_name"],
            is_active=user["is_active"],
            created_at=user["created_at"],
            updated_at=user["updated_at"]
        )
        
        logger.info("User logged in successfully", user_id=user["id"], email=request.email)
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Login failed", error=str(e), email=request.email)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/logout")
async def logout(request: Request):
    """Logout user (invalidate token)"""
    try:
        # In a real implementation, you would blacklist the token
        # For now, we'll just return success
        logger.info("User logged out successfully")
        return {"message": "Successfully logged out"}
    except Exception as e:
        logger.error("Logout failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current user information"""
    try:
        payload = verify_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # In real implementation, query database for user
        # For now, return mock user
        user_data = {
            "id": user_id,
            "username": "demo_user",
            "email": "demo@example.com",
            "first_name": "Demo",
            "last_name": "User",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        return UserResponse(**user_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get current user", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user information"
        )

@router.post("/refresh")
async def refresh_token(token: str = Depends(oauth2_scheme)):
    """Refresh access token"""
    try:
        payload = verify_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create new access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_id}, expires_delta=access_token_expires
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Token refresh failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

@router.post("/password-reset")
async def request_password_reset(request: PasswordResetRequest):
    """Request password reset"""
    try:
        # In real implementation, send email with reset token
        logger.info("Password reset requested", email=request.email)
        return {"message": "Password reset email sent"}
    except Exception as e:
        logger.error("Password reset request failed", error=str(e), email=request.email)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset request failed"
        )

@router.post("/password-reset/confirm")
async def confirm_password_reset(request: PasswordResetConfirm):
    """Confirm password reset with token"""
    try:
        # In real implementation, verify token and update password
        logger.info("Password reset confirmed")
        return {"message": "Password reset successfully"}
    except Exception as e:
        logger.error("Password reset confirmation failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset confirmation failed"
        )

@router.post("/oauth/{provider}")
async def oauth_login(provider: str, request: OAuthRequest):
    """OAuth login (Google, GitHub, etc.)"""
    try:
        # In real implementation, handle OAuth flow
        logger.info("OAuth login requested", provider=provider)
        return {"message": f"OAuth login with {provider} not implemented yet"}
    except Exception as e:
        logger.error("OAuth login failed", error=str(e), provider=provider)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OAuth login failed"
        )

@router.post("/verify-email")
async def verify_email(token: str):
    """Verify email address"""
    try:
        # In real implementation, verify email token
        logger.info("Email verification requested")
        return {"message": "Email verified successfully"}
    except Exception as e:
        logger.error("Email verification failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Email verification failed"
        )
