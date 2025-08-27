from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, EmailStr
import structlog

from app.database import get_db
from app.services.user_service import UserService
from app.auth.dependencies import get_current_user, get_current_active_user
from app.models.user import User

logger = structlog.get_logger()
router = APIRouter()
security = HTTPBearer()

# Pydantic models
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str

class UserProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[dict] = None

# Authentication endpoints
@router.post("/register", response_model=dict)
async def register(
    user_data: UserRegister,
    request: Request,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    try:
        user_service = UserService(db)
        user = user_service.create_user(
            username=user_data.username,
            email=user_data.email,
            password=user_data.password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            phone=user_data.phone
        )
        
        # Create session
        tokens = user_service.create_user_session(
            user,
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent")
        )
        
        # Send verification email
        user_service.send_verification_email(user)
        
        return {
            "message": "User registered successfully",
            "user": user.to_dict(),
            "tokens": tokens
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=dict)
async def login(
    login_data: UserLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    """Login user"""
    try:
        user_service = UserService(db)
        user = user_service.authenticate_user(
            login_data.username_or_email,
            login_data.password
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Create session
        tokens = user_service.create_user_session(
            user,
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent")
        )
        
        return {
            "message": "Login successful",
            "user": user.to_dict(),
            "tokens": tokens
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/refresh", response_model=dict)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """Refresh access token"""
    user_service = UserService(db)
    tokens = user_service.refresh_access_token(refresh_data.refresh_token)
    
    if not tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    return {
        "message": "Token refreshed successfully",
        "tokens": tokens
    }

@router.post("/logout")
async def logout(
    credentials: HTTPBearer = Depends(security),
    db: Session = Depends(get_db)
):
    """Logout user"""
    user_service = UserService(db)
    success = user_service.logout_user(credentials.credentials)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logout failed"
        )
    
    return {"message": "Logout successful"}

@router.get("/me", response_model=dict)
async def get_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """Get current user profile"""
    return {
        "user": current_user.to_dict()
    }

@router.put("/me", response_model=dict)
async def update_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    try:
        user_service = UserService(db)
        updated_user = user_service.update_user_profile(
            current_user,
            **profile_data.dict(exclude_unset=True)
        )
        
        return {
            "message": "Profile updated successfully",
            "user": updated_user.to_dict()
        }
        
    except Exception as e:
        logger.error(f"Profile update error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed"
        )

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    user_service = UserService(db)
    success = user_service.change_password(
        current_user,
        password_data.current_password,
        password_data.new_password
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    return {"message": "Password changed successfully"}

@router.post("/forgot-password")
async def forgot_password(
    reset_request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """Send password reset email"""
    user_service = UserService(db)
    success = user_service.send_password_reset_email(reset_request.email)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found"
        )
    
    return {"message": "Password reset email sent"}

@router.post("/reset-password")
async def reset_password(
    reset_data: PasswordReset,
    db: Session = Depends(get_db)
):
    """Reset password with token"""
    user_service = UserService(db)
    user = user_service.reset_password(reset_data.token, reset_data.new_password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )
    
    return {"message": "Password reset successfully"}

@router.post("/verify-email/{token}")
async def verify_email(
    token: str,
    db: Session = Depends(get_db)
):
    """Verify email with token"""
    user_service = UserService(db)
    user = user_service.verify_email(token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )
    
    return {"message": "Email verified successfully"}

@router.post("/resend-verification")
async def resend_verification(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Resend verification email"""
    user_service = UserService(db)
    success = user_service.send_verification_email(current_user)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email"
        )
    
    return {"message": "Verification email sent"}
