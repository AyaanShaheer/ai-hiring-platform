from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Optional

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.job import Job
from app.models.resume import Resume
from app.services.recommendation_service import RecommendationService

router = APIRouter()
recommendation_service = RecommendationService()


class RecommendationResponse(BaseModel):
    resume_id: int
    candidate_name: Optional[str]
    candidate_email: Optional[str]
    similarity_score: float
    skills: List[str]
    experience_years: Optional[float]
    rank: int
    outreach_message: Optional[str] = None


class BatchRecommendationResponse(BaseModel):
    job_id: int
    job_title: str
    total_candidates_screened: int
    recommendations_count: int
    top_candidates: List[RecommendationResponse]
    average_match_score: float


@router.post("/job/{job_id}/recommend", response_model=BatchRecommendationResponse)
async def get_candidate_recommendations(
    job_id: int,
    top_k: int = 10,
    generate_messages: bool = False,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get AI-powered candidate recommendations for a job"""
    
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
    
    # Check ownership
    if job.recruiter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view recommendations for this job"
        )
    
    # Get all resumes uploaded by this recruiter
    resumes_result = await db.execute(
        select(Resume).filter(Resume.uploader_id == current_user.id)
    )
    all_resumes = resumes_result.scalars().all()
    
    if not all_resumes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resumes found. Upload resumes first."
        )
    
    # Generate recommendations
    recommendations = await recommendation_service.generate_batch_recommendations(
        job=job,
        all_resumes=all_resumes,
        top_k=top_k,
        generate_messages=generate_messages
    )
    
    return BatchRecommendationResponse(**recommendations)


@router.post("/job/{job_id}/outreach/{resume_id}", response_model=dict)
async def generate_outreach_message(
    job_id: int,
    resume_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Generate personalized outreach message for a specific candidate"""
    
    # Get job
    job_result = await db.execute(
        select(Job).filter(Job.id == job_id)
    )
    job = job_result.scalars().first()
    
    if not job or job.recruiter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Get resume
    resume_result = await db.execute(
        select(Resume).filter(Resume.id == resume_id)
    )
    resume = resume_result.scalars().first()
    
    if not resume or resume.uploader_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Calculate similarity score
    all_resumes = [resume]
    recommendations = await recommendation_service.find_matching_candidates(
        job=job,
        all_resumes=all_resumes,
        top_k=1
    )
    
    match_score = recommendations[0]['similarity_score'] if recommendations else 70.0
    
    # Generate message
    message = await recommendation_service.generate_outreach_message(
        job_title=job.title,
        company=job.company,
        candidate_name=resume.candidate_name or "there",
        candidate_skills=resume.skills or [],
        match_score=match_score,
        job_description=job.description
    )
    
    return {
        "job_id": job_id,
        "resume_id": resume_id,
        "candidate_name": resume.candidate_name,
        "match_score": match_score,
        "outreach_message": message
    }


@router.post("/update-embeddings", response_model=dict)
async def update_all_embeddings(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update embeddings for all jobs and resumes (admin only or background task)"""
    
    # Simple permission check (you can make this admin-only)
    if current_user.role != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    # Run in background
    stats = await recommendation_service.update_embeddings_batch(db)
    
    return {
        "message": "Embeddings updated successfully",
        "stats": stats
    }


@router.get("/candidates/search", response_model=List[RecommendationResponse])
async def semantic_candidate_search(
    query: str,
    top_k: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Semantic search for candidates using natural language query"""
    
    # Get all resumes
    resumes_result = await db.execute(
        select(Resume).filter(Resume.uploader_id == current_user.id)
    )
    all_resumes = resumes_result.scalars().all()
    
    if not all_resumes:
        return []
    
    # Create a temporary "job" from the search query
    from app.models.job import Job as JobModel
    temp_job = JobModel(
        title=query,
        description=query,
        company="Search",
        recruiter_id=current_user.id
    )
    
    # Find matching candidates
    recommendations = await recommendation_service.find_matching_candidates(
        job=temp_job,
        all_resumes=all_resumes,
        top_k=top_k
    )
    
    return [RecommendationResponse(**rec) for rec in recommendations]
