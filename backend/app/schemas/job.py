from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


class JobBase(BaseModel):
    title: str
    company: str
    description: str
    requirements: Optional[str] = None
    location: Optional[str] = None


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    description: Optional[str] = None
    requirements: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None


class JobResponse(JobBase):
    id: int
    recruiter_id: int
    required_skills: Optional[List[str]]
    experience_years_min: Optional[int]
    experience_years_max: Optional[int]
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    model_config = ConfigDict(from_attributes=True)


class JobDetailResponse(JobResponse):
    embedding_vector: Optional[List[float]]
