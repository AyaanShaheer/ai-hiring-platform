from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.api import deps
from app.models.user import User
from app.models.resume_builder import ResumeTemplate, GeneratedResume
from app.schemas.resume_builder import (
    ResumeBuilderCreate,
    ResumeBuilderUpdate,
    ResumeOptimizeRequest,
    ResumeTemplateResponse,
    GeneratedResumeResponse,
    ATSScoreResponse
)
from app.services.resume_generation_service import resume_generation_service
from app.services.pdf_generator import pdf_generator_service


router = APIRouter()


@router.get("/templates", response_model=List[ResumeTemplateResponse])
async def get_resume_templates(
    country: Optional[str] = None,
    template_type: Optional[str] = None,
    db: AsyncSession = Depends(deps.get_db)
):
    """Get available resume templates"""
    query = select(ResumeTemplate).where(ResumeTemplate.is_active == True)
    
    if country:
        query = query.where(ResumeTemplate.country == country.upper())
    
    if template_type:
        query = query.where(ResumeTemplate.template_type == template_type)
    
    result = await db.execute(query)
    templates = result.scalars().all()
    return templates


@router.get("/templates/{template_id}", response_model=ResumeTemplateResponse)
async def get_template(
    template_id: int,
    db: AsyncSession = Depends(deps.get_db)
):
    """Get specific template details"""
    result = await db.execute(
        select(ResumeTemplate).where(ResumeTemplate.id == template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return template


@router.post("/", response_model=GeneratedResumeResponse, status_code=status.HTTP_201_CREATED)
async def create_resume(
    resume_data: ResumeBuilderCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """Create a new resume"""
    
    # Validate template exists
    result = await db.execute(
        select(ResumeTemplate).where(ResumeTemplate.id == resume_data.template_id)
    )
    template = result.scalar_one_or_none()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Create resume record
    new_resume = GeneratedResume(
        user_id=current_user.id,
        template_id=resume_data.template_id,
        personal_info=resume_data.personal_info.dict(),
        professional_summary=resume_data.professional_summary,
        work_experience=[exp.dict() for exp in resume_data.work_experience],
        education=[edu.dict() for edu in resume_data.education],
        skills=resume_data.skills,
        languages=[lang.dict() for lang in resume_data.languages] if resume_data.languages else [],
        certifications=[cert.dict() for cert in resume_data.certifications] if resume_data.certifications else [],
        projects=[proj.dict() for proj in resume_data.projects] if resume_data.projects else [],
        references=[ref.dict() for ref in resume_data.references] if resume_data.references else [],
        target_job_title=resume_data.target_job_title,
        target_industry=resume_data.target_industry,
        target_country=resume_data.target_country
    )
    
    db.add(new_resume)
    await db.commit()
    await db.refresh(new_resume)
    
    # Generate PDF in background
    background_tasks.add_task(
        generate_resume_pdf_task,
        new_resume.id
    )
    
    return new_resume


@router.get("/", response_model=List[GeneratedResumeResponse])
async def list_my_resumes(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """List all resumes for current user"""
    result = await db.execute(
        select(GeneratedResume)
        .where(GeneratedResume.user_id == current_user.id)
        .order_by(GeneratedResume.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    resumes = result.scalars().all()
    return resumes


@router.get("/{resume_id}", response_model=GeneratedResumeResponse)
async def get_resume(
    resume_id: int,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """Get specific resume"""
    result = await db.execute(
        select(GeneratedResume)
        .where(GeneratedResume.id == resume_id, GeneratedResume.user_id == current_user.id)
    )
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return resume


@router.put("/{resume_id}", response_model=GeneratedResumeResponse)
async def update_resume(
    resume_id: int,
    resume_data: ResumeBuilderUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """Update resume"""
    result = await db.execute(
        select(GeneratedResume)
        .where(GeneratedResume.id == resume_id, GeneratedResume.user_id == current_user.id)
    )
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    # Update fields
    update_data = resume_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if field == "personal_info" and value:
            setattr(resume, field, value.dict())
        elif field in ["work_experience", "education", "languages", "certifications", "projects", "references"]:
            if value is not None:
                setattr(resume, field, [item.dict() if hasattr(item, 'dict') else item for item in value])
        else:
            setattr(resume, field, value)
    
    resume.version += 1
    
    await db.commit()
    await db.refresh(resume)
    
    # Regenerate PDF in background
    background_tasks.add_task(
        generate_resume_pdf_task,
        resume.id
    )
    
    return resume


@router.post("/{resume_id}/optimize", response_model=GeneratedResumeResponse)
async def optimize_resume(
    resume_id: int,
    optimize_request: ResumeOptimizeRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """AI-optimize resume content"""
    result = await db.execute(
        select(GeneratedResume)
        .where(GeneratedResume.id == resume_id, GeneratedResume.user_id == current_user.id)
    )
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    suggestions = {}
    
    # Optimize professional summary
    if optimize_request.optimize_summary:
        try:
            optimized_summary = await resume_generation_service.generate_professional_summary(
                personal_info=resume.personal_info,
                work_experience=resume.work_experience,
                target_job=resume.target_job_title or "your target position",
                target_country=resume.target_country
            )
            resume.ai_optimized_summary = optimized_summary
            suggestions['summary_optimized'] = True
        except Exception as e:
            suggestions['summary_error'] = str(e)
    
    # Optimize work experience
    if optimize_request.optimize_experience and resume.work_experience:
        try:
            optimized_experiences = []
            for exp in resume.work_experience[:3]:  # Optimize top 3
                optimized_exp = await resume_generation_service.optimize_work_experience(
                    experience=exp,
                    target_country=resume.target_country
                )
                optimized_experiences.append(optimized_exp)
            
            # Update the work experience with optimized versions
            for i, opt_exp in enumerate(optimized_experiences):
                resume.work_experience[i] = opt_exp
            
            suggestions['experience_optimized'] = True
        except Exception as e:
            suggestions['experience_error'] = str(e)
    
    # Suggest skills
    if optimize_request.suggest_skills:
        try:
            current_skills = []
            if isinstance(resume.skills, dict):
                for skill_list in resume.skills.values():
                    if isinstance(skill_list, list):
                        current_skills.extend(skill_list)
            
            skill_suggestions = await resume_generation_service.generate_skills_suggestions(
                current_skills=current_skills,
                target_job=resume.target_job_title or "general position",
                work_experience=resume.work_experience
            )
            suggestions['skills'] = skill_suggestions
        except Exception as e:
            suggestions['skills_error'] = str(e)
    
    resume.ai_suggestions = suggestions
    resume.version += 1
    
    await db.commit()
    await db.refresh(resume)
    
    # Regenerate PDF
    background_tasks.add_task(
        generate_resume_pdf_task,
        resume.id
    )
    
    return resume


@router.get("/{resume_id}/ats-score", response_model=ATSScoreResponse)
async def get_ats_score(
    resume_id: int,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """Calculate ATS compatibility score"""
    result = await db.execute(
        select(GeneratedResume)
        .where(GeneratedResume.id == resume_id, GeneratedResume.user_id == current_user.id)
    )
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    resume_content = {
        "personal_info": resume.personal_info,
        "professional_summary": resume.ai_optimized_summary or resume.professional_summary,
        "work_experience": resume.work_experience,
        "education": resume.education,
        "skills": resume.skills,
        "languages": resume.languages,
        "certifications": resume.certifications
    }
    
    ats_score = await resume_generation_service.calculate_ats_score(
        resume_content=resume_content,
        target_job=resume.target_job_title or "general position"
    )
    
    # Update resume with score
    resume.keyword_score = ats_score['score']
    await db.commit()
    
    return ats_score


@router.post("/{resume_id}/regenerate-pdf")
async def regenerate_pdf(
    resume_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """Regenerate PDF for resume"""
    result = await db.execute(
        select(GeneratedResume)
        .where(GeneratedResume.id == resume_id, GeneratedResume.user_id == current_user.id)
    )
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    background_tasks.add_task(
        generate_resume_pdf_task,
        resume.id
    )
    
    return {"message": "PDF regeneration started", "resume_id": resume_id}


@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: int,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(deps.get_db)
):
    """Delete resume"""
    result = await db.execute(
        select(GeneratedResume)
        .where(GeneratedResume.id == resume_id, GeneratedResume.user_id == current_user.id)
    )
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    await db.delete(resume)
    await db.commit()
    
    return {"message": "Resume deleted successfully"}


# Background task function
async def generate_resume_pdf_task(resume_id: int):
    """Background task to generate PDF"""
    from app.db.session import AsyncSessionLocal
    
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(GeneratedResume).where(GeneratedResume.id == resume_id)
            )
            resume = result.scalar_one_or_none()
            
            if not resume:
                return
            
            result = await db.execute(
                select(ResumeTemplate).where(ResumeTemplate.id == resume.template_id)
            )
            template = result.scalar_one_or_none()
            
            if not template:
                return
            
            # Prepare resume data
            resume_data = {
                "personal_info": resume.personal_info,
                "professional_summary": resume.ai_optimized_summary or resume.professional_summary,
                "work_experience": resume.work_experience,
                "education": resume.education,
                "skills": resume.skills,
                "languages": resume.languages,
                "certifications": resume.certifications,
                "projects": resume.projects,
                "references": resume.references
            }
            
            # Generate filename
            filename = f"resume_{resume.user_id}_{resume.id}_v{resume.version}.pdf"
            
            # Generate PDF
            pdf_path = await pdf_generator_service.generate_resume_pdf(
                resume_data=resume_data,
                template_config=template.template_config,
                output_filename=filename
            )
            
            # Convert local path to URL path
            # pdf_path is like "generated_resumes/resume_6_1_v1.pdf"
            # We need to convert it to "/generated_resumes/resume_6_1_v1.pdf" for the frontend
            pdf_url = f"/{pdf_path}" if not pdf_path.startswith('/') else pdf_path
            
            # Update resume with PDF URL  
            resume.pdf_url = pdf_url
            await db.commit()
            
    except Exception as e:
        print(f"Error generating PDF: {e}")
