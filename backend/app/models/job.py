from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Job(Base):
    __tablename__ = "jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String, nullable=False, index=True)
    company = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    requirements = Column(Text, nullable=True)
    location = Column(String, nullable=True)
    
    # Parsed fields
    required_skills = Column(JSON, nullable=True)  # List of skills
    experience_years_min = Column(Integer, nullable=True)
    experience_years_max = Column(Integer, nullable=True)
    
    # Vector embedding for semantic search
    embedding_vector = Column(JSON, nullable=True)  # Will store as JSON, FAISS for search
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships - use string references
    recruiter = relationship("User", back_populates="jobs", lazy="selectin")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan", lazy="selectin")
