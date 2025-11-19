from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    display_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    is_guest: bool
    avatar: Optional[str] = None
    preferences: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    
    model_config = {
        "from_attributes": True
    }

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class Token(BaseModel):
    access_token: str
    token_type: str
