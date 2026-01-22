from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    
    # Matching scores
    match_score = Column(Float, nullable=True)  # 0-100
    skill_match_score = Column(Float, nullable=True)
    experience_match_score = Column(Float, nullable=True)
    semantic_similarity_score = Column(Float, nullable=True)
    
    # GenAI explanation
    explanation = Column(Text, nullable=True)
    strengths = Column(JSON, nullable=True)  # List of strength points
    weaknesses = Column(JSON, nullable=True)  # List of weakness points
    
    # Bias detection
    bias_flags = Column(JSON, nullable=True)
    
    # Recruiter actions
    recruiter_status = Column(String, default="pending")  # pending, shortlisted, rejected, interviewed
    recruiter_notes = Column(Text, nullable=True)
    recruiter_override_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships - use string references
    job = relationship("Job", back_populates="applications", lazy="selectin")
    resume = relationship("Resume", back_populates="applications", lazy="selectin")

    # Interview 
    interviews = relationship("Interview", back_populates="application")
