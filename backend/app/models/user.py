from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    RECRUITER = "recruiter"
    VIEWER = "viewer"


class SubscriptionTier(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    company_name = Column(String, nullable=True)
    role = Column(Enum(UserRole), default=UserRole.RECRUITER)
    subscription_tier = Column(Enum(SubscriptionTier), default=SubscriptionTier.FREE)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    stripe_customer_id = Column(String, nullable=True)
    
    # Usage limits
    resumes_processed_this_month = Column(Integer, default=0)
    jobs_created_this_month = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships - use string references to avoid circular imports
    jobs = relationship("Job", back_populates="recruiter", cascade="all, delete-orphan", lazy="selectin")
    resumes = relationship("Resume", back_populates="uploader", cascade="all, delete-orphan", lazy="selectin")
