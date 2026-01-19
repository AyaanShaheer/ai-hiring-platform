from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get user by email"""
    result = await db.execute(select(User).filter(User.email == email))
    return result.scalars().first()


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    """Get user by ID"""
    result = await db.execute(select(User).filter(User.id == user_id))
    return result.scalars().first()


async def create_user(db: AsyncSession, user_create: UserCreate) -> User:
    """Create a new user"""
    hashed_password = get_password_hash(user_create.password)
    
    db_user = User(
        email=user_create.email,
        hashed_password=hashed_password,
        full_name=user_create.full_name,
        company_name=user_create.company_name,
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password"""
    user = await get_user_by_email(db, email)
    
    if not user:
        return None
    
    if not verify_password(password, user.hashed_password):
        return None
    
    return user
