from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, HttpUrl
from datetime import datetime


class PersonalInfo(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[Dict[str, str]] = None  # {"city": "...", "country": "..."}
    linkedin: Optional[str] = None
    website: Optional[str] = None
    photo_url: Optional[str] = None


class WorkExperience(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    duration: str  # e.g., "Jan 2020 - Present"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False
    description: Optional[str] = None
    responsibilities: Optional[List[str]] = []
    achievements: Optional[List[str]] = []
    optimized_bullets: Optional[List[str]] = None


class Education(BaseModel):
    degree: str
    institution: str
    location: Optional[str] = None
    year: Optional[str] = None
    start_year: Optional[str] = None
    end_year: Optional[str] = None
    gpa: Optional[str] = None
    honors: Optional[str] = None
    relevant_coursework: Optional[List[str]] = []


class Language(BaseModel):
    language: str
    proficiency: str  # e.g., "Native", "Fluent", "Professional", "Basic"


class Certification(BaseModel):
    name: str
    issuer: str
    year: Optional[str] = None
    expiry: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None


class Project(BaseModel):
    title: str
    description: str
    technologies: Optional[List[str]] = []
    url: Optional[str] = None
    duration: Optional[str] = None


class Reference(BaseModel):
    name: str
    title: str
    company: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


# Request/Response Models

class ResumeBuilderCreate(BaseModel):
    template_id: int
    personal_info: PersonalInfo
    professional_summary: Optional[str] = None
    work_experience: List[WorkExperience]
    education: List[Education]
    skills: Dict[str, List[str]]  # {"technical": [...], "soft": [...]}
    languages: Optional[List[Language]] = []
    certifications: Optional[List[Certification]] = []
    projects: Optional[List[Project]] = []
    references: Optional[List[Reference]] = []
    target_job_title: Optional[str] = None
    target_industry: Optional[str] = None
    target_country: str = "US"


class ResumeBuilderUpdate(BaseModel):
    personal_info: Optional[PersonalInfo] = None
    professional_summary: Optional[str] = None
    work_experience: Optional[List[WorkExperience]] = None
    education: Optional[List[Education]] = None
    skills: Optional[Dict[str, List[str]]] = None
    languages: Optional[List[Language]] = None
    certifications: Optional[List[Certification]] = None
    projects: Optional[List[Project]] = None
    references: Optional[List[Reference]] = None
    target_job_title: Optional[str] = None
    target_industry: Optional[str] = None


class ResumeOptimizeRequest(BaseModel):
    resume_id: int
    optimize_summary: bool = True
    optimize_experience: bool = True
    suggest_skills: bool = True


class ResumeTemplateResponse(BaseModel):
    id: int
    name: str
    country: str
    template_type: str
    description: Optional[str]
    template_config: Dict[str, Any]
    is_active: bool
    
    class Config:
        from_attributes = True


class GeneratedResumeResponse(BaseModel):
    id: int
    user_id: int
    template_id: int
    personal_info: Dict[str, Any]
    professional_summary: Optional[str]
    ai_optimized_summary: Optional[str]
    work_experience: List[Dict[str, Any]]
    education: List[Dict[str, Any]]
    skills: Dict[str, Any]
    languages: Optional[List[Dict[str, Any]]]
    certifications: Optional[List[Dict[str, Any]]]
    projects: Optional[List[Dict[str, Any]]]
    ai_suggestions: Optional[Dict[str, Any]]
    keyword_score: Optional[int]
    target_job_title: Optional[str]
    target_country: str
    pdf_url: Optional[str]
    version: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ATSScoreResponse(BaseModel):
    score: int
    feedback: List[str]
    strengths: List[str]
    weaknesses: List[str]
