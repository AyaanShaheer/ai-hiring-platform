from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from pathlib import Path
import shutil
import uuid

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.resume import Resume
from app.schemas.resume import ResumeResponse, ResumeDetailResponse
from app.services.resume_parser import ResumeParser
from app.core.config import settings

router = APIRouter()
resume_parser = ResumeParser()


@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Upload and parse a resume"""
    
    # Validate file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in settings.allowed_extensions_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(settings.allowed_extensions_list)}"
        )
    
    # Validate file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to start
    
    if file_size > settings.max_upload_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE_MB}MB"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = settings.upload_dir_path / unique_filename
    
    try:
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Parse resume
        parsed_data = resume_parser.parse(file_path)
        
        # Create database record
        db_resume = Resume(
            uploader_id=current_user.id,
            filename=file.filename,
            file_path=str(file_path),
            file_size_kb=file_size // 1024,
            raw_text=parsed_data.get('raw_text'),
            candidate_name=parsed_data.get('candidate_name'),
            candidate_email=parsed_data.get('candidate_email'),
            candidate_phone=parsed_data.get('candidate_phone'),
            skills=parsed_data.get('skills'),
            experience_years=parsed_data.get('experience_years'),
            education=parsed_data.get('education'),
            processing_status='completed'
        )
        
        db.add(db_resume)
        await db.commit()
        await db.refresh(db_resume)
        
        # Update user's resume count
        current_user.resumes_processed_this_month += 1
        await db.commit()
        
        return ResumeResponse.model_validate(db_resume)
        
    except Exception as e:
        # Clean up file on error
        if file_path.exists():
            file_path.unlink()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing resume: {str(e)}"
        )


@router.get("/", response_model=List[ResumeResponse])
async def list_resumes(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """List all resumes uploaded by current user"""
    from sqlalchemy import select
    
    result = await db.execute(
        select(Resume)
        .filter(Resume.uploader_id == current_user.id)
        .offset(skip)
        .limit(limit)
        .order_by(Resume.created_at.desc())
    )
    resumes = result.scalars().all()
    
    return [ResumeResponse.model_validate(r) for r in resumes]


@router.get("/{resume_id}", response_model=ResumeDetailResponse)
async def get_resume(
    resume_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed resume information"""
    from sqlalchemy import select
    
    result = await db.execute(
        select(Resume).filter(Resume.id == resume_id)
    )
    resume = result.scalars().first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Check ownership
    if resume.uploader_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resume"
        )
    
    return ResumeDetailResponse.model_validate(resume)


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    resume_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a resume"""
    from sqlalchemy import select
    
    result = await db.execute(
        select(Resume).filter(Resume.id == resume_id)
    )
    resume = result.scalars().first()
    
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found"
        )
    
    # Check ownership
    if resume.uploader_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this resume"
        )
    
    # Delete file
    file_path = Path(resume.file_path)
    if file_path.exists():
        file_path.unlink()
    
    # Delete from database
    await db.delete(resume)
    await db.commit()
    
    return None
