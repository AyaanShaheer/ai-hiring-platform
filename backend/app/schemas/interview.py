from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any


class InterviewBase(BaseModel):
    application_id: int
    interview_type: str = Field(..., description="phone, video, in-person, technical")
    scheduled_at: datetime
    duration_minutes: int = 60
    meeting_link: Optional[str] = None
    meeting_platform: Optional[str] = None


class InterviewCreate(InterviewBase):
    pass


class InterviewUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    status: Optional[str] = None
    meeting_link: Optional[str] = None
    meeting_platform: Optional[str] = None
    meeting_notes: Optional[str] = None
    interviewer_notes: Optional[str] = None
    interviewer_rating: Optional[float] = None


class InterviewResponse(InterviewBase):
    id: int
    status: str
    meeting_notes: Optional[str] = None
    
    # Scores
    sentiment_score: Optional[float] = None
    confidence_score: Optional[float] = None
    technical_score: Optional[float] = None
    communication_score: Optional[float] = None
    overall_score: Optional[float] = None
    
    # AI Analysis
    ai_analysis: Optional[Dict[str, Any]] = None
    
    # Processing
    is_processed: bool
    processing_status: str
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class InterviewScheduleRequest(BaseModel):
    application_id: int
    interview_type: str = "video"
    scheduled_at: datetime
    duration_minutes: int = 60
    meeting_platform: Optional[str] = "zoom"
    

class InterviewListResponse(BaseModel):
    id: int
    application_id: int
    interview_type: str
    scheduled_at: datetime
    status: str
    overall_score: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
