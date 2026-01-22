from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, BackgroundTasks, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from datetime import datetime
from pathlib import Path

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.schemas.interview import (
    InterviewCreate,
    InterviewUpdate,
    InterviewResponse,
    InterviewListResponse,
    InterviewScheduleRequest
)
from app.services.interview_service import interview_service
from app.services.interview_processing_service import interview_processing_service
from app.services.interview_analysis_service import interview_analysis_service

router = APIRouter()


@router.post("/schedule", response_model=InterviewResponse, status_code=status.HTTP_201_CREATED)
async def schedule_interview(
    interview_data: InterviewScheduleRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Schedule a new interview for an application
    """
    
    try:
        interview_create = InterviewCreate(
            application_id=interview_data.application_id,
            interview_type=interview_data.interview_type,
            scheduled_at=interview_data.scheduled_at,
            duration_minutes=interview_data.duration_minutes,
            meeting_platform=interview_data.meeting_platform
        )
        
        interview = await interview_service.create_interview(
            db=db,
            interview_data=interview_create,
            interviewer_id=current_user.id
        )
        
        return interview
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to schedule interview: {str(e)}"
        )


@router.get("/", response_model=List[InterviewListResponse])
async def get_interviews(
    status_filter: Optional[str] = Query(None, description="Filter by status: scheduled, completed, cancelled"),
    interview_type: Optional[str] = Query(None, description="Filter by type: phone, video, in-person, technical"),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all interviews for the current recruiter
    """
    
    interviews = await interview_service.get_interviews_for_recruiter(
        db=db,
        recruiter_id=current_user.id,
        status=status_filter,
        interview_type=interview_type,
        limit=limit
    )
    
    return interviews


@router.get("/upcoming", response_model=List[InterviewListResponse])
async def get_upcoming_interviews(
    days: int = Query(7, ge=1, le=30, description="Number of days ahead to check"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get upcoming interviews in the next N days
    """
    
    interviews = await interview_service.get_upcoming_interviews(
        db=db,
        recruiter_id=current_user.id,
        days_ahead=days
    )
    
    return interviews


@router.get("/{interview_id}", response_model=InterviewResponse)
async def get_interview(
    interview_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get interview details by ID
    """
    
    interview = await interview_service.get_interview(
        db=db,
        interview_id=interview_id,
        user_id=current_user.id
    )
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    return interview


@router.put("/{interview_id}", response_model=InterviewResponse)
async def update_interview(
    interview_id: int,
    interview_data: InterviewUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update interview details
    """
    
    interview = await interview_service.update_interview(
        db=db,
        interview_id=interview_id,
        interview_data=interview_data,
        user_id=current_user.id
    )
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    return interview


@router.post("/{interview_id}/complete", response_model=InterviewResponse)
async def complete_interview(
    interview_id: int,
    notes: Optional[str] = None,
    rating: Optional[float] = Query(None, ge=1.0, le=5.0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Mark interview as completed with optional notes and rating
    """
    
    interview = await interview_service.mark_interview_completed(
        db=db,
        interview_id=interview_id,
        user_id=current_user.id,
        notes=notes,
        rating=rating
    )
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    return interview


@router.delete("/{interview_id}/cancel")
async def cancel_interview(
    interview_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Cancel a scheduled interview
    """
    
    success = await interview_service.cancel_interview(
        db=db,
        interview_id=interview_id,
        user_id=current_user.id
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    return {"message": "Interview cancelled successfully"}


@router.get("/application/{application_id}", response_model=List[InterviewListResponse])
async def get_application_interviews(
    application_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all interviews for a specific application
    """
    
    interviews = await interview_service.get_application_interviews(
        db=db,
        application_id=application_id,
        user_id=current_user.id
    )
    
    return interviews

@router.post("/{interview_id}/upload-recording")
async def upload_interview_recording(
    interview_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Upload audio/video recording of an interview
    
    Supported formats: mp3, wav, m4a, mp4, webm
    Max size: 500MB
    """
    
    # Verify interview exists and belongs to user
    interview = await interview_service.get_interview(
        db=db,
        interview_id=interview_id,
        user_id=current_user.id
    )
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    # Validate file type
    allowed_extensions = ['.mp3', '.wav', '.m4a', '.mp4', '.webm', '.ogg']
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not supported. Allowed: {', '.join(allowed_extensions)}"
        )
    
    # Check file size (500MB limit)
    max_size = 500 * 1024 * 1024  # 500MB in bytes
    content = await file.read()
    
    if len(content) > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum size: 500MB"
        )
    
    try:
        # Save file
        recording_path = await interview_processing_service.save_recording(
            file_content=content,
            interview_id=interview_id,
            file_extension=file_ext
        )
        
        # Process in background (transcription takes time)
        background_tasks.add_task(
            interview_processing_service.process_interview_recording,
            db=db,
            interview_id=interview_id,
            recording_path=recording_path
        )
        
        return {
            "message": "Recording uploaded successfully. Transcription in progress.",
            "interview_id": interview_id,
            "filename": file.filename,
            "size_mb": round(len(content) / (1024 * 1024), 2),
            "processing_status": "processing"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload recording: {str(e)}"
        )


@router.get("/{interview_id}/transcript")
async def get_interview_transcript(
    interview_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get transcript of interview recording
    """
    
    interview = await interview_service.get_interview(
        db=db,
        interview_id=interview_id,
        user_id=current_user.id
    )
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    if not interview.transcript:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcript not available. Please upload a recording first."
        )
    
    return {
        "interview_id": interview_id,
        "transcript": interview.transcript,
        "processing_status": interview.processing_status,
        "metadata": interview.ai_analysis.get('transcription_metadata', {}) if interview.ai_analysis else {}
    }

@router.post("/{interview_id}/analyze", response_model=InterviewResponse)
async def analyze_interview(
    interview_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Analyze interview transcript with AI
    
    Provides:
    - Sentiment analysis
    - Confidence assessment
    - Communication quality score
    - Technical skill evaluation
    - Key points extraction
    - Red flags detection
    - Overall hiring recommendation
    """
    
    # Verify interview exists
    interview = await interview_service.get_interview(
        db=db,
        interview_id=interview_id,
        user_id=current_user.id
    )
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    if not interview.transcript:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No transcript available. Please upload a recording first."
        )
    
    # Run analysis in background
    background_tasks.add_task(
        interview_analysis_service.analyze_interview_transcript,
        db=db,
        interview_id=interview_id
    )
    
    return interview


@router.get("/{interview_id}/analysis")
async def get_interview_analysis(
    interview_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get detailed AI analysis of interview
    """
    
    interview = await interview_service.get_interview(
        db=db,
        interview_id=interview_id,
        user_id=current_user.id
    )
    
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Interview not found"
        )
    
    if not interview.ai_analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not available. Please run analysis first."
        )
    
    return {
        "interview_id": interview_id,
        "overall_score": interview.overall_score,
        "scores": {
            "sentiment": interview.sentiment_score,
            "confidence": interview.confidence_score,
            "communication": interview.communication_score,
            "technical": interview.technical_score
        },
        "analysis": interview.ai_analysis,
        "status": interview.processing_status
    }