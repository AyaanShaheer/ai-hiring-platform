from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Dict

from app.models.interview import Interview
from app.models.application import Application
from app.models.job import Job
from app.models.resume import Resume
from app.schemas.interview import InterviewCreate, InterviewUpdate


class InterviewService:
    """Service for managing interviews"""
    
    async def create_interview(
        self,
        db: AsyncSession,
        interview_data: InterviewCreate,
        interviewer_id: int
    ) -> Interview:
        """Schedule a new interview"""
        
        # Verify application exists and belongs to recruiter
        app_result = await db.execute(
            select(Application, Job)
            .join(Job)
            .filter(
                and_(
                    Application.id == interview_data.application_id,
                    Job.recruiter_id == interviewer_id
                )
            )
        )
        app_job = app_result.first()
        
        if not app_job:
            raise ValueError("Application not found or access denied")
        
        # Create interview
        interview = Interview(
            application_id=interview_data.application_id,
            interview_type=interview_data.interview_type,
            scheduled_at=interview_data.scheduled_at,
            duration_minutes=interview_data.duration_minutes,
            meeting_link=interview_data.meeting_link,
            meeting_platform=interview_data.meeting_platform,
            interviewer_id=interviewer_id,
            status="scheduled"
        )
        
        db.add(interview)
        await db.commit()
        await db.refresh(interview)
        
        return interview
    
    async def get_interview(
        self,
        db: AsyncSession,
        interview_id: int,
        user_id: int
    ) -> Optional[Interview]:
        """Get interview by ID"""
        
        result = await db.execute(
            select(Interview)
            .join(Application)
            .join(Job)
            .filter(
                and_(
                    Interview.id == interview_id,
                    Job.recruiter_id == user_id
                )
            )
        )
        
        return result.scalars().first()
    
    async def get_interviews_for_recruiter(
        self,
        db: AsyncSession,
        recruiter_id: int,
        status: Optional[str] = None,
        interview_type: Optional[str] = None,
        limit: int = 50
    ) -> List[Interview]:
        """Get all interviews for a recruiter"""
        
        query = select(Interview).join(Application).join(Job).filter(
            Job.recruiter_id == recruiter_id
        )
        
        if status:
            query = query.filter(Interview.status == status)
        
        if interview_type:
            query = query.filter(Interview.interview_type == interview_type)
        
        query = query.order_by(desc(Interview.scheduled_at)).limit(limit)
        
        result = await db.execute(query)
        return result.scalars().all()
    
    async def get_upcoming_interviews(
        self,
        db: AsyncSession,
        recruiter_id: int,
        days_ahead: int = 7
    ) -> List[Interview]:
        """Get upcoming interviews in next N days"""
        
        now = datetime.now(timezone.utc)
        future = now + timedelta(days=days_ahead)
        
        result = await db.execute(
            select(Interview)
            .join(Application)
            .join(Job)
            .filter(
                and_(
                    Job.recruiter_id == recruiter_id,
                    Interview.scheduled_at >= now,
                    Interview.scheduled_at <= future,
                    Interview.status == "scheduled"
                )
            )
            .order_by(Interview.scheduled_at)
        )
        
        return result.scalars().all()
    
    async def update_interview(
        self,
        db: AsyncSession,
        interview_id: int,
        interview_data: InterviewUpdate,
        user_id: int
    ) -> Optional[Interview]:
        """Update interview details"""
        
        interview = await self.get_interview(db, interview_id, user_id)
        
        if not interview:
            return None
        
        # Update fields
        update_data = interview_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(interview, field, value)
        
        interview.updated_at = datetime.now(timezone.utc)
        
        await db.commit()
        await db.refresh(interview)
        
        return interview
    
    async def cancel_interview(
        self,
        db: AsyncSession,
        interview_id: int,
        user_id: int
    ) -> bool:
        """Cancel an interview"""
        
        interview = await self.get_interview(db, interview_id, user_id)
        
        if not interview:
            return False
        
        interview.status = "cancelled"
        interview.updated_at = datetime.now(timezone.utc)
        
        await db.commit()
        
        return True
    
    async def mark_interview_completed(
        self,
        db: AsyncSession,
        interview_id: int,
        user_id: int,
        notes: Optional[str] = None,
        rating: Optional[float] = None
    ) -> Optional[Interview]:
        """Mark interview as completed"""
        
        interview = await self.get_interview(db, interview_id, user_id)
        
        if not interview:
            return None
        
        interview.status = "completed"
        interview.completed_at = datetime.now(timezone.utc)
        
        if notes:
            interview.interviewer_notes = notes
        
        if rating:
            interview.interviewer_rating = rating
        
        await db.commit()
        await db.refresh(interview)
        
        return interview
    
    async def get_application_interviews(
        self,
        db: AsyncSession,
        application_id: int,
        user_id: int
    ) -> List[Interview]:
        """Get all interviews for an application"""
        
        result = await db.execute(
            select(Interview)
            .join(Application)
            .join(Job)
            .filter(
                and_(
                    Interview.application_id == application_id,
                    Job.recruiter_id == user_id
                )
            )
            .order_by(Interview.scheduled_at)
        )
        
        return result.scalars().all()


interview_service = InterviewService()
