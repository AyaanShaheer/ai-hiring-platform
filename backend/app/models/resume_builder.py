from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base


class ResumeTemplate(Base):
    __tablename__ = "resume_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # "US Standard", "German CV", "Europass"
    country = Column(String(50), nullable=False)  # "US", "DE", "FR", "UK", "NL"
    template_type = Column(String(50))  # "chronological", "functional", "europass"
    description = Column(Text)
    
    # Template configuration
    template_config = Column(JSON)
    # Structure: {
    #   "sections": ["contact", "summary", "experience", "education", "skills"],
    #   "photo_required": true/false,
    #   "date_format": "DD/MM/YYYY" or "MM/DD/YYYY",
    #   "max_pages": 2,
    #   "include_references": true/false,
    #   "style": {...}
    # }
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    generated_resumes = relationship("GeneratedResume", back_populates="template")


class GeneratedResume(Base):
    __tablename__ = "generated_resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    template_id = Column(Integer, ForeignKey("resume_templates.id"), nullable=False)
    
    # Personal information
    personal_info = Column(JSON)
    # Structure: {
    #   "full_name": "...",
    #   "email": "...",
    #   "phone": "...",
    #   "location": {"city": "...", "country": "..."},
    #   "linkedin": "...",
    #   "website": "...",
    #   "photo_url": "..." (optional)
    # }
    
    # Resume content
    professional_summary = Column(Text)
    work_experience = Column(JSON)  # Array of job objects
    education = Column(JSON)  # Array of education objects
    skills = Column(JSON)  # Categorized skills
    languages = Column(JSON)  # Array of languages with proficiency
    certifications = Column(JSON)  # Array of certifications
    projects = Column(JSON)  # Array of projects (optional)
    volunteering = Column(JSON)  # Array of volunteer work (optional)
    references = Column(JSON)  # Array of references (if required)
    
    # AI-generated content
    ai_optimized_summary = Column(Text)
    ai_suggestions = Column(JSON)  # AI improvement suggestions
    keyword_score = Column(Integer)  # 0-100 ATS score
    
    # Targeting
    target_job_title = Column(String(200))
    target_industry = Column(String(100))
    target_country = Column(String(50))
    
    # Output
    pdf_url = Column(String(500))  # Generated PDF location
    version = Column(Integer, default=1)
    
    # Status
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    template = relationship("ResumeTemplate", back_populates="generated_resumes")
