from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.job import Job
from app.schemas.job import JobCreate, JobUpdate, JobResponse, JobDetailResponse
from app.services.job_parser import JobParser

router = APIRouter()
job_parser = JobParser()


@router.post("/", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    job_create: JobCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new job posting"""
    
    # Parse job description to extract structured data
    parsed_data = job_parser.parse(
        job_create.title,
        job_create.description,
        job_create.requirements
    )
    
    # Create database record
    db_job = Job(
        recruiter_id=current_user.id,
        title=job_create.title,
        company=job_create.company,
        description=job_create.description,
        requirements=job_create.requirements,
        location=job_create.location,
        required_skills=parsed_data.get('required_skills'),
        experience_years_min=parsed_data.get('experience_years_min'),
        experience_years_max=parsed_data.get('experience_years_max'),
    )
    
    db.add(db_job)
    await db.commit()
    await db.refresh(db_job)
    
    # Update user's job count
    current_user.jobs_created_this_month += 1
    await db.commit()
    
    return JobResponse.model_validate(db_job)


@router.get("/", response_model=List[JobResponse])
async def list_jobs(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all jobs created by current user"""
    
    query = select(Job).filter(Job.recruiter_id == current_user.id)
    
    if active_only:
        query = query.filter(Job.is_active == True)
    
    query = query.offset(skip).limit(limit).order_by(Job.created_at.desc())
    
    result = await db.execute(query)
    jobs = result.scalars().all()
    
    return [JobResponse.model_validate(j) for j in jobs]


@router.get("/{job_id}", response_model=JobDetailResponse)
async def get_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed job information"""
    
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
            detail="Not authorized to access this job"
        )
    
    return JobDetailResponse.model_validate(job)


@router.put("/{job_id}", response_model=JobResponse)
async def update_job(
    job_id: int,
    job_update: JobUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Update a job posting"""
    
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
            detail="Not authorized to update this job"
        )
    
    # Update fields
    update_data = job_update.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(job, field, value)
    
    # Re-parse if description or requirements changed
    if 'description' in update_data or 'requirements' in update_data:
        parsed_data = job_parser.parse(
            job.title,
            job.description,
            job.requirements
        )
        job.required_skills = parsed_data.get('required_skills')
        job.experience_years_min = parsed_data.get('experience_years_min')
        job.experience_years_max = parsed_data.get('experience_years_max')
    
    await db.commit()
    await db.refresh(job)
    
    return JobResponse.model_validate(job)


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a job posting"""
    
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
            detail="Not authorized to delete this job"
        )
    
    await db.delete(job)
    await db.commit()
    
    return None


@router.post("/{job_id}/deactivate", response_model=JobResponse)
async def deactivate_job(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Deactivate a job posting"""
    
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
            detail="Not authorized to modify this job"
        )
    
    job.is_active = False
    await db.commit()
    await db.refresh(job)
    
    return JobResponse.model_validate(job)
