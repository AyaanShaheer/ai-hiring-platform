from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict
from datetime import datetime


class ApplicationCreate(BaseModel):
    job_id: int
    resume_id: int


class ApplicationUpdate(BaseModel):
    recruiter_status: Optional[str] = None
    recruiter_notes: Optional[str] = None
    recruiter_override_score: Optional[float] = None


class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    resume_id: int
    match_score: Optional[float]
    skill_match_score: Optional[float]
    experience_match_score: Optional[float]
    semantic_similarity_score: Optional[float]
    recruiter_status: str
    recruiter_notes: Optional[str]
    recruiter_override_score: Optional[float]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ApplicationDetailResponse(ApplicationResponse):
    explanation: Optional[str]
    strengths: Optional[List[str]]
    weaknesses: Optional[List[str]]
    bias_flags: Optional[List[str]]
    
    # Include job and resume info
    job_title: Optional[str] = None
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
