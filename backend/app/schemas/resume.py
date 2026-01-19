from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict
from datetime import datetime


class ResumeBase(BaseModel):
    filename: str


class ResumeCreate(BaseModel):
    pass  # File will be uploaded via multipart/form-data


class ResumeUpdate(BaseModel):
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    candidate_phone: Optional[str] = None


class ResumeResponse(BaseModel):
    id: int
    uploader_id: int
    filename: str
    file_size_kb: int
    candidate_name: Optional[str]
    candidate_email: Optional[str]
    candidate_phone: Optional[str]
    skills: Optional[List[str]]
    experience_years: Optional[float]
    education: Optional[List[Dict]]
    processing_status: str
    processing_error: Optional[str]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ResumeDetailResponse(ResumeResponse):
    raw_text: Optional[str]
    work_history: Optional[List[Dict]]
    inflation_score: Optional[float]
    fraud_flags: Optional[List[str]]
