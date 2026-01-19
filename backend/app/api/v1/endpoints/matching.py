from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.job import Job
from app.models.resume import Resume
from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationResponse, ApplicationDetailResponse, ApplicationUpdate
from app.services.matching_service import MatchingService

router = APIRouter()
matching_service = MatchingService()


@router.post("/match", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_match(
    application: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Match a resume to a job and create an application"""
    
    # Get job
    job_result = await db.execute(
        select(Job).filter(Job.id == application.job_id)
    )
    job = job_result.scalars().first()
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check job ownership
    if job.recruiter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create matches for this job"
        )
    
    # Get resume
    resume_result = await db.execute(
        select(Resume).filter(Resume.id == application.resume_id)
    )
    resume = resume_result.scalars().first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Check if application already exists
    existing_result = await db.execute(
        select(Application).filter(
            and_(
                Application.job_id == application.job_id,
                Application.resume_id == application.resume_id
            )
        )
    )
    existing = existing_result.scalars().first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Application already exists for this job and resume"
        )
    
    # Calculate match scores
    match_scores = matching_service.match_resume_to_job(resume, job)
    
    # Create application
    db_application = Application(
        job_id=application.job_id,
        resume_id=application.resume_id,
        match_score=match_scores['overall_match_score'],
        skill_match_score=match_scores['skill_match_score'],
        experience_match_score=match_scores['experience_match_score'],
        semantic_similarity_score=match_scores['semantic_similarity_score'],
    )
    
    db.add(db_application)
    await db.commit()
    await db.refresh(db_application)
    
    return ApplicationResponse.model_validate(db_application)


@router.get("/job/{job_id}/matches", response_model=List[ApplicationResponse])
async def get_job_matches(
    job_id: int,
    min_score: float = 0.0,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all candidate matches for a specific job, ranked by score"""
    
    # Verify job ownership
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
            detail="Not authorized to view matches for this job"
        )
    
    # Get applications
    query = select(Application).filter(
        and_(
            Application.job_id == job_id,
            Application.match_score >= min_score
        )
    ).order_by(Application.match_score.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    applications = result.scalars().all()
    
    return [ApplicationResponse.model_validate(app) for app in applications]


@router.get("/applications/{application_id}", response_model=ApplicationDetailResponse)
async def get_application_detail(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed application information"""
    
    result = await db.execute(
        select(Application).filter(Application.id == application_id)
    )
    application = result.scalars().first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Get job to verify ownership
    job_result = await db.execute(
        select(Job).filter(Job.id == application.job_id)
    )
    job = job_result.scalars().first()
    
    if job.recruiter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this application"
        )
    
    # Get resume info
    resume_result = await db.execute(
        select(Resume).filter(Resume.id == application.resume_id)
    )
    resume = resume_result.scalars().first()
    
    # Create response with additional info
    response_data = ApplicationDetailResponse.model_validate(application)
    response_data.job_title = job.title
    response_data.candidate_name = resume.candidate_name
    response_data.candidate_email = resume.candidate_email
    
    return response_data


@router.put("/applications/{application_id}", response_model=ApplicationResponse)
async def update_application(
    application_id: int,
    application_update: ApplicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update application status/notes"""
    
    result = await db.execute(
        select(Application).filter(Application.id == application_id)
    )
    application = result.scalars().first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Verify ownership
    job_result = await db.execute(
        select(Job).filter(Job.id == application.job_id)
    )
    job = job_result.scalars().first()
    
    if job.recruiter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this application"
        )
    
    # Update fields
    update_data = application_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(application, field, value)
    
    await db.commit()
    await db.refresh(application)
    
    return ApplicationResponse.model_validate(application)
