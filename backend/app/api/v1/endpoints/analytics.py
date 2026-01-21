from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from fastapi.responses import StreamingResponse
from datetime import datetime
from io import BytesIO

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.services.analytics_service import analytics_service

router = APIRouter()


@router.get("/dashboard")
async def get_recruiter_dashboard(
    days: int = Query(default=30, ge=1, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get comprehensive recruiter dashboard metrics"""
    
    dashboard = await analytics_service.get_recruiter_dashboard(
        db=db,
        recruiter_id=current_user.id,
        days=days
    )
    
    return dashboard


@router.get("/job/{job_id}")
async def get_job_analytics(
    job_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed analytics for a specific job"""
    
    analytics = await analytics_service.get_job_analytics(
        db=db,
        job_id=job_id,
        recruiter_id=current_user.id
    )
    
    if not analytics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found or access denied"
        )
    
    return analytics


@router.get("/skills")
async def get_skills_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get skills supply/demand analytics"""
    
    skills_data = await analytics_service.get_skills_analytics(
        db=db,
        recruiter_id=current_user.id
    )
    
    return skills_data


@router.get("/trends")
async def get_time_series_trends(
    days: int = Query(default=30, ge=7, le=365),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get time-series data for trend charts"""
    
    trends = await analytics_service.get_time_series_data(
        db=db,
        recruiter_id=current_user.id,
        days=days
    )
    
    return trends


@router.get("/comparison")
async def get_comparison_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Compare current month vs previous month"""
    
    comparison = await analytics_service.get_comparison_analytics(
        db=db,
        recruiter_id=current_user.id
    )
    
    return comparison

@router.get("/export/{export_type}")
async def export_analytics_data(
    export_type: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Export analytics data as CSV"""
    
    if export_type not in ['applications', 'resumes', 'jobs']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid export type. Choose: applications, resumes, or jobs"
        )
    
    csv_data = await analytics_service.export_analytics_csv(
        db=db,
        recruiter_id=current_user.id,
        export_type=export_type
    )
    
    # Create streaming response
    output = BytesIO(csv_data.encode('utf-8'))
    
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={export_type}_export_{datetime.now().strftime('%Y%m%d')}.csv"
        }
    )


@router.get("/insights")
async def get_ai_insights(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get AI-powered insights and recommendations"""
    
    from app.services.genai_service import GenAIService
    
    # Get dashboard data
    dashboard = await analytics_service.get_recruiter_dashboard(
        db=db,
        recruiter_id=current_user.id,
        days=30
    )
    
    # Get skills analytics
    skills = await analytics_service.get_skills_analytics(
        db=db,
        recruiter_id=current_user.id
    )
    
    # Generate AI insights
    provider = GenAIService.get_provider()
    
    skill_gaps_text = "\n".join([
        f"- {gap['skill']}: {gap['gap_percentage']}% gap (demand={gap['demand']}, supply={gap['supply']})"
        for gap in skills['skill_gaps'][:5]
    ]) if skills['skill_gaps'] else "- No significant skill gaps detected"
    
    prompt = f"""Analyze this recruiting data and provide 5 actionable insights:

**Overview:**
- Jobs: {dashboard['overview']['total_jobs']}
- Resumes: {dashboard['overview']['total_resumes']}
- Applications: {dashboard['overview']['total_applications']}
- Avg Match: {dashboard['overview']['avg_match_score']}%

**Status:**
- Pending: {dashboard['application_status']['pending']}
- Shortlisted: {dashboard['application_status']['shortlisted']}
- Interviews: {dashboard['application_status']['interview_scheduled']}
- Hired: {dashboard['application_status']['hired']}

**Fraud:**
- High Risk: {dashboard['fraud_detection']['high_risk_resumes']}
- Rate: {dashboard['fraud_detection']['fraud_rate']}%

**Top Skill Gaps:**
{skill_gaps_text}

Provide 5 brief, actionable insights (2-3 sentences each):
1. Recruitment efficiency
2. Application pipeline
3. Skill acquisition
4. Quality metrics
5. Risk management"""
    
    try:
        insights_text = await provider.generate_explanation(prompt)
        
        # Split by numbers or newlines
        lines = insights_text.strip().split('\n')
        insights_dict = {}
        
        current_key = 'insight_1'
        current_text = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Check if line starts with a number
            if line[0].isdigit() and ('.' in line[:3] or ')' in line[:3]):
                # Save previous insight
                if current_text:
                    insights_dict[current_key] = ' '.join(current_text)
                
                # Start new insight
                insight_num = line[0]
                current_key = f'insight_{insight_num}'
                # Remove number prefix
                text = line.split('.', 1)[-1].split(')', 1)[-1].strip()
                current_text = [text] if text else []
            else:
                current_text.append(line)
        
        # Save last insight
        if current_text:
            insights_dict[current_key] = ' '.join(current_text)
        
        # Ensure we have at least something
        if not insights_dict:
            insights_dict = {
                'insight_1': insights_text[:500] if insights_text else 'No insights generated'
            }
        
        return {
            'generated_at': datetime.utcnow().isoformat(),
            'data_summary': dashboard['overview'],
            'insights': insights_dict
        }
    
    except Exception as e:
        print(f"Insight generation error: {e}")
        return {
            'generated_at': datetime.utcnow().isoformat(),
            'data_summary': dashboard['overview'],
            'insights': {
                'insight_1': f'Your application funnel has {dashboard["application_status"]["pending"]} pending applications requiring review.',
                'insight_2': f'Average match score of {dashboard["overview"]["avg_match_score"]}% indicates good candidate-job alignment.',
                'insight_3': f'Focus on top skill gaps to improve pipeline: {", ".join([g["skill"] for g in skills["skill_gaps"][:3]])}.' if skills['skill_gaps'] else 'No skill gaps detected.',
                'insight_4': f'Fraud detection rate of {dashboard["fraud_detection"]["fraud_rate"]}% is within acceptable range.',
                'insight_5': 'Continue monitoring application status transitions to optimize hiring speed.'
            },
            'error': str(e)
        }
