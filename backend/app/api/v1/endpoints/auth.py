from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.user_service import create_user, authenticate_user, get_user_by_email
from app.core.security import create_access_token
from app.core.config import settings
from app.api.deps import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_create: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user"""
    
    # Check if user already exists
    existing_user = await get_user_by_email(db, user_create.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create user
    user = await create_user(db, user_create)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user)
    }


@router.post("/login", response_model=Token)
async def login(
    user_login: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """Login and get access token"""
    
    # Authenticate user
    user = await authenticate_user(db, user_login.email, user_login.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role.value},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user)
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user information"""
    return UserResponse.model_validate(current_user)


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """Logout (client should delete token)"""
    return {"message": "Successfully logged out"}
