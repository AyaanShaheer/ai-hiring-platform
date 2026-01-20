from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional, Dict

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.services.bias_detection_service import BiasDetectionService

router = APIRouter()
bias_service = BiasDetectionService()


class BiasAnalysisResponse(BaseModel):
    job_id: int
    job_title: str
    bias_score: float
    bias_risk_level: str
    flags: List[Dict]
    has_bias: bool
    potential_biases: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    best_practices: Optional[List[str]] = None
    fairness_score: Optional[float] = None
    summary: Optional[str] = None


@router.post("/analyze-job/{job_id}", response_model=BiasAnalysisResponse)
async def analyze_job_bias(
    job_id: int,
    use_ai: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Analyze a job posting for bias"""
    
    # Get job
    result = await db.execute(
        select(Job).filter(Job.id == job_id)
    )
    job = result.scalars().first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check ownership
    if job.recruiter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Check job description for bias
    job_bias = bias_service.check_job_description_bias(
        job.description,
        job.requirements or ""
    )
    
    # Check for protected characteristics mentions
    protected_check = bias_service.check_protected_characteristics(
        f"{job.title} {job.description} {job.requirements or ''}"
    )
    
    all_flags = job_bias['flags'] + protected_check['flags']
    combined_score = (job_bias.get('bias_count', 0) * 10) + protected_check['score']
    combined_score = min(combined_score, 100)
    
    # Determine risk level
    if combined_score >= 60:
        risk_level = "high"
    elif combined_score >= 30:
        risk_level = "medium"
    else:
        risk_level = "low"
    
    response_data = {
        "job_id": job_id,
        "job_title": job.title,
        "bias_score": round(combined_score, 2),
        "bias_risk_level": risk_level,
        "flags": all_flags,
        "has_bias": len(all_flags) > 0
    }
    
    # AI analysis if requested
    if use_ai and len(all_flags) > 0:
        candidates_summary = f"Job has {len(all_flags)} potential bias flags"
        
        ai_report = await bias_service.generate_ai_bias_report(
            job_title=job.title,
            job_description=job.description,
            candidates_summary=candidates_summary,
            detected_flags=all_flags
        )
        
        response_data.update({
            "potential_biases": ai_report.get('potential_biases'),
            "recommendations": ai_report.get('recommendations'),
            "best_practices": ai_report.get('best_practices'),
            "fairness_score": ai_report.get('fairness_score'),
            "summary": ai_report.get('summary')
        })
    
    return BiasAnalysisResponse(**response_data)


@router.get("/job/{job_id}/fairness-report", response_model=dict)
async def get_fairness_report(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get a fairness report for all candidates of a job"""
    
    # Get job
    job_result = await db.execute(
        select(Job).filter(Job.id == job_id)
    )
    job = job_result.scalars().first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    if job.recruiter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Get all applications
    apps_result = await db.execute(
        select(Application).filter(Application.job_id == job_id)
    )
    applications = apps_result.scalars().all()
    
    if not applications:
        return {
            "job_id": job_id,
            "message": "No applications to analyze",
            "candidate_count": 0
        }
    
    # Analyze scoring patterns
    match_scores = [
        {"match_score": app.match_score}
        for app in applications if app.match_score
    ]
    
    bias_analysis = bias_service.analyze_scoring_bias(match_scores)
    
    return {
        "job_id": job_id,
        "job_title": job.title,
        "candidate_count": len(applications),
        "average_score": bias_analysis.get('avg_score'),
        "score_variance": bias_analysis.get('variance'),
        "has_bias_indicators": bias_analysis.get('has_bias', False),
        "analysis": bias_analysis.get('message'),
        "recommendation": bias_analysis.get('recommendation', 'Continue fair evaluation')
    }
