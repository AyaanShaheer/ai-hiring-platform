from sqlalchemy import Column, Integer, String, DateTime, Float, JSON, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.base_class import Base


class Interview(Base):
    __tablename__ = "interviews"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    interview_type = Column(String(50))  # phone, video, in-person, technical
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(Integer, default=60)
    status = Column(String(50), default="scheduled")  # scheduled, completed, cancelled, no-show
    
    # Meeting details
    meeting_link = Column(String(500), nullable=True)
    meeting_platform = Column(String(50), nullable=True)  # zoom, teams, meet, etc.
    meeting_notes = Column(Text, nullable=True)
    
    # Video/Audio recording
    recording_url = Column(String(500), nullable=True)
    transcript = Column(Text, nullable=True)
    
    # AI Analysis Results
    sentiment_score = Column(Float, nullable=True)  # -1 to 1
    confidence_score = Column(Float, nullable=True)  # 0 to 100
    technical_score = Column(Float, nullable=True)  # 0 to 100
    communication_score = Column(Float, nullable=True)  # 0 to 100
    overall_score = Column(Float, nullable=True)  # 0 to 100
    
    # Detailed AI insights
    ai_analysis = Column(JSON, nullable=True)
    # Structure: {
    #   "strengths": ["point1", "point2"],
    #   "weaknesses": ["point1", "point2"],
    #   "key_points": ["point1", "point2"],
    #   "red_flags": ["flag1", "flag2"],
    #   "recommendations": "text"
    # }
    
    # Questions and answers
    questions_asked = Column(JSON, nullable=True)  # List of questions
    key_answers = Column(JSON, nullable=True)  # Important answer excerpts
    
    # Interviewer notes
    interviewer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    interviewer_notes = Column(Text, nullable=True)
    interviewer_rating = Column(Float, nullable=True)  # 1-5 stars
    
    # Processing status
    is_processed = Column(Boolean, default=False)
    processing_status = Column(String(50), default="pending")  # pending, processing, completed, failed
    processing_error = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    application = relationship("Application", back_populates="interviews")
    interviewer = relationship("User", foreign_keys=[interviewer_id])
