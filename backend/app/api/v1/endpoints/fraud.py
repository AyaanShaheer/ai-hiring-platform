from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.resume import Resume
from app.services.fraud_detection_service import FraudDetectionService

router = APIRouter()
fraud_service = FraudDetectionService()


class FraudAnalysisResponse(BaseModel):
    resume_id: int
    candidate_name: Optional[str]
    inflation_score: float
    risk_level: str
    fraud_flags: List[str]
    flag_count: int
    authenticity_assessment: Optional[str] = None
    concerns: Optional[List[str]] = None
    red_flags: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    verification_suggestions: Optional[List[str]] = None
    overall_verdict: Optional[str] = None
    reasoning: Optional[str] = None


@router.post("/analyze/{resume_id}", response_model=FraudAnalysisResponse)
async def analyze_resume_fraud(
    resume_id: int,
    use_ai: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Analyze a resume for fraud and inflation"""
    
    # Get resume
    result = await db.execute(
        select(Resume).filter(Resume.id == resume_id)
    )
    resume = result.scalars().first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Check ownership (recruiter who uploaded it)
    if resume.uploader_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to analyze this resume"
        )
    
    # Perform rule-based analysis
    analysis = fraud_service.analyze_resume(
        raw_text=resume.raw_text or "",
        skills=resume.skills or [],
        experience_years=resume.experience_years or 0,
        candidate_name=resume.candidate_name
    )
    
    # Update resume with fraud data
    resume.inflation_score = analysis['inflation_score']
    resume.fraud_flags = analysis['fraud_flags']
    
    response_data = {
        "resume_id": resume_id,
        "candidate_name": resume.candidate_name,
        "inflation_score": analysis['inflation_score'],
        "risk_level": analysis['risk_level'],
        "fraud_flags": analysis['fraud_flags'],
        "flag_count": analysis['flag_count']
    }
    
    # Perform AI analysis if requested
    if use_ai:
        ai_analysis = await fraud_service.generate_ai_fraud_analysis(
            raw_text=resume.raw_text or "",
            candidate_name=resume.candidate_name or "Candidate",
            skills=resume.skills or [],
            experience_years=resume.experience_years or 0,
            rule_based_flags=analysis['fraud_flags'],
            inflation_score=analysis['inflation_score']
        )
        
        response_data.update(ai_analysis)
    
    await db.commit()
    
    return FraudAnalysisResponse(**response_data)


@router.get("/resume/{resume_id}/fraud-score", response_model=dict)
async def get_fraud_score(
    resume_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get the stored fraud score for a resume"""
    
    result = await db.execute(
        select(Resume).filter(Resume.id == resume_id)
    )
    resume = result.scalars().first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    if resume.uploader_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    return {
        "resume_id": resume_id,
        "candidate_name": resume.candidate_name,
        "inflation_score": resume.inflation_score,
        "fraud_flags": resume.fraud_flags or [],
        "has_fraud_concerns": (resume.inflation_score or 0) >= 30
    }
