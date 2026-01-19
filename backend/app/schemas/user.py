from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from app.models.user import UserRole, SubscriptionTier


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    company_name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    company_name: Optional[str] = None


class UserResponse(UserBase):
    id: int
    role: UserRole
    subscription_tier: SubscriptionTier
    is_active: bool
    is_verified: bool
    resumes_processed_this_month: int
    jobs_created_this_month: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    sub: str  # Changed to string (JWT standard)
    email: str
    role: str
    exp: Optional[int] = None
