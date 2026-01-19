from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Float, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class Resume(Base):
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    uploader_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # File info
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size_kb = Column(Integer, nullable=False)
    
    # Parsed content
    raw_text = Column(Text, nullable=True)
    candidate_name = Column(String, nullable=True, index=True)
    candidate_email = Column(String, nullable=True)
    candidate_phone = Column(String, nullable=True)
    
    # Structured data
    skills = Column(JSON, nullable=True)  # List of extracted skills
    experience_years = Column(Float, nullable=True)
    education = Column(JSON, nullable=True)  # List of education entries
    work_history = Column(JSON, nullable=True)  # List of jobs
    
    # Fraud detection
    inflation_score = Column(Float, nullable=True)  # 0-1, higher = more suspicious
    fraud_flags = Column(JSON, nullable=True)  # List of detected issues
    
    # Vector embedding
    embedding_vector = Column(JSON, nullable=True)
    
    processing_status = Column(String, default="pending")  # pending, processing, completed, failed
    processing_error = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships - use string references
    uploader = relationship("User", back_populates="resumes", lazy="selectin")
    applications = relationship("Application", back_populates="resume", cascade="all, delete-orphan", lazy="selectin")
