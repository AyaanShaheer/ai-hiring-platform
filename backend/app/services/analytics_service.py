from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
from collections import Counter

from app.models.user import User
from app.models.job import Job
from app.models.resume import Resume
from app.models.application import Application


def get_utc_now():
    """Get timezone-aware UTC now"""
    return datetime.now(timezone.utc)


class AnalyticsService:
    """Advanced analytics and insights service"""
    
    async def get_recruiter_dashboard(
        self,
        db: AsyncSession,
        recruiter_id: int,
        days: int = 30
    ) -> Dict:
        """Get comprehensive dashboard metrics for a recruiter"""
        
        # Date range
        start_date = get_utc_now() - timedelta(days=days)
        
        # Total counts
        total_jobs = await db.execute(
            select(func.count(Job.id)).filter(Job.recruiter_id == recruiter_id)
        )
        total_jobs_count = total_jobs.scalar()
        
        total_resumes = await db.execute(
            select(func.count(Resume.id)).filter(Resume.uploader_id == recruiter_id)
        )
        total_resumes_count = total_resumes.scalar()
        
        # Get all applications for recruiter's jobs
        applications_result = await db.execute(
            select(Application)
            .join(Job)
            .filter(Job.recruiter_id == recruiter_id)
        )
        applications = applications_result.scalars().all()
        
        total_applications = len(applications)
        
        # Calculate average match score
        if applications:
            avg_match_score = sum(
                app.match_score for app in applications if app.match_score
            ) / len(applications) if applications else 0
        else:
            avg_match_score = 0
        
        # Status breakdown
        status_breakdown = Counter(app.recruiter_status for app in applications)
        
        # Top performing jobs
        jobs_result = await db.execute(
            select(Job)
            .filter(Job.recruiter_id == recruiter_id)
            .order_by(desc(Job.created_at))
            .limit(10)
        )
        jobs = jobs_result.scalars().all()
        
        job_performance = []
        for job in jobs:
            job_apps = [app for app in applications if app.job_id == job.id]
            job_performance.append({
                'job_id': job.id,
                'job_title': job.title,
                'applications_count': len(job_apps),
                'avg_match_score': round(
                    sum(app.match_score for app in job_apps if app.match_score) / len(job_apps), 2
                ) if job_apps else 0,
                'created_at': job.created_at.isoformat()
            })
        
        # Recent activity (last 30 days)
        recent_resumes = await db.execute(
            select(func.count(Resume.id))
            .filter(
                and_(
                    Resume.uploader_id == recruiter_id,
                    Resume.created_at >= start_date
                )
            )
        )
        recent_resumes_count = recent_resumes.scalar()
        
        recent_jobs = await db.execute(
            select(func.count(Job.id))
            .filter(
                and_(
                    Job.recruiter_id == recruiter_id,
                    Job.created_at >= start_date
                )
            )
        )
        recent_jobs_count = recent_jobs.scalar()
        
        # Get fraud statistics
        fraud_resumes = await db.execute(
            select(Resume)
            .filter(
                and_(
                    Resume.uploader_id == recruiter_id,
                    Resume.inflation_score > 70
                )
            )
        )
        high_fraud_count = len(fraud_resumes.scalars().all())
        
        return {
            'overview': {
                'total_jobs': total_jobs_count,
                'total_resumes': total_resumes_count,
                'total_applications': total_applications,
                'avg_match_score': round(avg_match_score, 2)
            },
            'recent_activity': {
                'period_days': days,
                'new_resumes': recent_resumes_count,
                'new_jobs': recent_jobs_count
            },
            'application_status': {
                'pending': status_breakdown.get('pending', 0),
                'shortlisted': status_breakdown.get('shortlisted', 0),
                'interview_scheduled': status_breakdown.get('interview_scheduled', 0),
                'rejected': status_breakdown.get('rejected', 0),
                'hired': status_breakdown.get('hired', 0)
            },
            'fraud_detection': {
                'high_risk_resumes': high_fraud_count,
                'fraud_rate': round(
                    (high_fraud_count / total_resumes_count * 100), 2
                ) if total_resumes_count > 0 else 0
            },
            'top_jobs': job_performance[:5]
        }
    
    async def get_job_analytics(
        self,
        db: AsyncSession,
        job_id: int,
        recruiter_id: int
    ) -> Dict:
        """Get detailed analytics for a specific job"""
        
        # Verify job ownership
        job_result = await db.execute(
            select(Job).filter(
                and_(Job.id == job_id, Job.recruiter_id == recruiter_id)
            )
        )
        job = job_result.scalars().first()
        
        if not job:
            return None
        
        # Get all applications for this job with resumes
        applications_result = await db.execute(
            select(Application, Resume)
            .join(Resume, Application.resume_id == Resume.id)
            .filter(Application.job_id == job_id)
        )
        app_resume_pairs = applications_result.all()
        
        if not app_resume_pairs:
            return {
                'job_id': job_id,
                'job_title': job.title,
                'company': job.company,
                'total_applications': 0,
                'message': 'No applications yet'
            }
        
        applications = [pair[0] for pair in app_resume_pairs]
        
        # Match score distribution
        score_ranges = {
            '90-100': 0,
            '80-89': 0,
            '70-79': 0,
            '60-69': 0,
            'below_60': 0
        }
        
        for app in applications:
            score = app.match_score or 0
            if score >= 90:
                score_ranges['90-100'] += 1
            elif score >= 80:
                score_ranges['80-89'] += 1
            elif score >= 70:
                score_ranges['70-79'] += 1
            elif score >= 60:
                score_ranges['60-69'] += 1
            else:
                score_ranges['below_60'] += 1
        
        # Status breakdown
        status_breakdown = Counter(app.recruiter_status for app in applications)
        
        # Top candidates
        top_app_resume_pairs = sorted(
            app_resume_pairs,
            key=lambda x: x[0].match_score or 0,
            reverse=True
        )[:10]
        
        top_candidate_list = []
        for app, resume in top_app_resume_pairs:
            top_candidate_list.append({
                'application_id': app.id,
                'candidate_name': resume.candidate_name if resume else 'Unknown',
                'match_score': round(app.match_score, 2) if app.match_score else 0,
                'status': app.recruiter_status,
                'skills': resume.skills[:5] if resume and resume.skills else []
            })
        
        # Average component scores
        valid_apps = [a for a in applications if a.skill_match_score]
        avg_skill_match = sum(a.skill_match_score for a in valid_apps) / len(valid_apps) if valid_apps else 0
        
        valid_exp = [a for a in applications if a.experience_match_score]
        avg_exp_match = sum(a.experience_match_score for a in valid_exp) / len(valid_exp) if valid_exp else 0
        
        valid_semantic = [a for a in applications if a.semantic_similarity_score]
        avg_semantic = sum(a.semantic_similarity_score for a in valid_semantic) / len(valid_semantic) if valid_semantic else 0
        
        # Calculate days open (handle timezone)
        now = get_utc_now()
        created = job.created_at
        if created.tzinfo is None:
            created = created.replace(tzinfo=timezone.utc)
        days_open = (now - created).days
        
        return {
            'job_id': job_id,
            'job_title': job.title,
            'company': job.company,
            'required_skills': job.required_skills,
            'total_applications': len(applications),
            'average_scores': {
                'overall': round(sum(app.match_score or 0 for app in applications) / len(applications), 2),
                'skill_match': round(avg_skill_match, 2),
                'experience_match': round(avg_exp_match, 2),
                'semantic_similarity': round(avg_semantic, 2)
            },
            'score_distribution': score_ranges,
            'status_breakdown': dict(status_breakdown),
            'top_candidates': top_candidate_list,
            'created_at': job.created_at.isoformat(),
            'days_open': days_open
        }
    
    async def get_skills_analytics(
        self,
        db: AsyncSession,
        recruiter_id: int
    ) -> Dict:
        """Analyze skills from resumes and jobs"""
        
        # Get all resumes
        resumes_result = await db.execute(
            select(Resume).filter(Resume.uploader_id == recruiter_id)
        )
        resumes = resumes_result.scalars().all()
        
        # Get all jobs
        jobs_result = await db.execute(
            select(Job).filter(Job.recruiter_id == recruiter_id)
        )
        jobs = jobs_result.scalars().all()
        
        # Count skills in resumes
        all_resume_skills = []
        for resume in resumes:
            if resume.skills:
                all_resume_skills.extend(resume.skills)
        
        resume_skill_counts = Counter(all_resume_skills)
        
        # Count required skills in jobs
        all_job_skills = []
        for job in jobs:
            if job.required_skills:
                all_job_skills.extend(job.required_skills)
        
        job_skill_counts = Counter(all_job_skills)
        
        # Find skill gaps (in demand but rare in resumes)
        skill_gaps = []
        for skill, count in job_skill_counts.most_common(20):
            resume_count = resume_skill_counts.get(skill, 0)
            if count > resume_count:
                skill_gaps.append({
                    'skill': skill,
                    'demand': count,
                    'supply': resume_count,
                    'gap': count - resume_count,
                    'gap_percentage': round(((count - resume_count) / count) * 100, 2)
                })
        
        return {
            'total_unique_skills': len(set(all_resume_skills + all_job_skills)),
            'top_resume_skills': [
                {'skill': skill, 'count': count}
                for skill, count in resume_skill_counts.most_common(15)
            ],
            'top_demanded_skills': [
                {'skill': skill, 'count': count}
                for skill, count in job_skill_counts.most_common(15)
            ],
            'skill_gaps': sorted(skill_gaps, key=lambda x: x['gap'], reverse=True)[:10]
        }
    
    async def get_time_series_data(
        self,
        db: AsyncSession,
        recruiter_id: int,
        days: int = 30
    ) -> Dict:
        """Get time-series data for charts"""
        
        start_date = get_utc_now() - timedelta(days=days)
        
        # Get resumes by day
        resumes_result = await db.execute(
            select(Resume)
            .filter(
                and_(
                    Resume.uploader_id == recruiter_id,
                    Resume.created_at >= start_date
                )
            )
        )
        resumes = resumes_result.scalars().all()
        
        # Get jobs by day
        jobs_result = await db.execute(
            select(Job)
            .filter(
                and_(
                    Job.recruiter_id == recruiter_id,
                    Job.created_at >= start_date
                )
            )
        )
        jobs = jobs_result.scalars().all()
        
        # Get applications by day
        applications_result = await db.execute(
            select(Application)
            .join(Job)
            .filter(
                and_(
                    Job.recruiter_id == recruiter_id,
                    Application.created_at >= start_date
                )
            )
        )
        applications = applications_result.scalars().all()
        
        # Aggregate by day
        daily_stats = {}
        for i in range(days):
            date = start_date + timedelta(days=i)
            date_str = date.strftime('%Y-%m-%d')
            
            day_resumes = [r for r in resumes if r.created_at.date() == date.date()]
            day_jobs = [j for j in jobs if j.created_at.date() == date.date()]
            day_apps = [a for a in applications if a.created_at.date() == date.date()]
            
            daily_stats[date_str] = {
                'date': date_str,
                'resumes': len(day_resumes),
                'jobs': len(day_jobs),
                'applications': len(day_apps),
                'avg_match_score': round(
                    sum(a.match_score or 0 for a in day_apps) / len(day_apps), 2
                ) if day_apps else 0
            }
        
        return {
            'period_days': days,
            'daily_stats': list(daily_stats.values())
        }
    
    async def get_comparison_analytics(
        self,
        db: AsyncSession,
        recruiter_id: int
    ) -> Dict:
        """Compare current month vs previous month"""
        
        now = get_utc_now()
        current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        previous_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
        
        # Current month stats
        current_resumes = await db.execute(
            select(func.count(Resume.id))
            .filter(
                and_(
                    Resume.uploader_id == recruiter_id,
                    Resume.created_at >= current_month_start
                )
            )
        )
        current_resumes_count = current_resumes.scalar()
        
        current_jobs = await db.execute(
            select(func.count(Job.id))
            .filter(
                and_(
                    Job.recruiter_id == recruiter_id,
                    Job.created_at >= current_month_start
                )
            )
        )
        current_jobs_count = current_jobs.scalar()
        
        # Previous month stats
        previous_resumes = await db.execute(
            select(func.count(Resume.id))
            .filter(
                and_(
                    Resume.uploader_id == recruiter_id,
                    Resume.created_at >= previous_month_start,
                    Resume.created_at < current_month_start
                )
            )
        )
        previous_resumes_count = previous_resumes.scalar()
        
        previous_jobs = await db.execute(
            select(func.count(Job.id))
            .filter(
                and_(
                    Job.recruiter_id == recruiter_id,
                    Job.created_at >= previous_month_start,
                    Job.created_at < current_month_start
                )
            )
        )
        previous_jobs_count = previous_jobs.scalar()
        
        # Calculate changes
        def calculate_change(current, previous):
            if previous == 0:
                return 100 if current > 0 else 0
            return round(((current - previous) / previous) * 100, 2)
        
        return {
            'current_month': {
                'resumes': current_resumes_count,
                'jobs': current_jobs_count
            },
            'previous_month': {
                'resumes': previous_resumes_count,
                'jobs': previous_jobs_count
            },
            'changes': {
                'resumes_change': calculate_change(current_resumes_count, previous_resumes_count),
                'jobs_change': calculate_change(current_jobs_count, previous_jobs_count)
            }
        }
    
    async def export_analytics_csv(
        self,
        db: AsyncSession,
        recruiter_id: int,
        export_type: str = "applications"
    ) -> str:
        """Export analytics data as CSV string"""
        
        import csv
        from io import StringIO
        
        output = StringIO()
        
        if export_type == "applications":
            # Get all applications with job and resume info
            applications_result = await db.execute(
                select(Application, Job, Resume)
                .join(Job, Application.job_id == Job.id)
                .join(Resume, Application.resume_id == Resume.id)
                .filter(Job.recruiter_id == recruiter_id)
            )
            applications = applications_result.all()
            
            writer = csv.writer(output)
            writer.writerow([
                'Application ID', 'Job Title', 'Candidate Name',
                'Match Score', 'Skill Match', 'Experience Match',
                'Semantic Score', 'Status', 'Created At'
            ])
            
            for app, job, resume in applications:
                writer.writerow([
                    app.id,
                    job.title,
                    resume.candidate_name or 'N/A',
                    round(app.match_score, 2) if app.match_score else 0,
                    round(app.skill_match_score, 2) if app.skill_match_score else 0,
                    round(app.experience_match_score, 2) if app.experience_match_score else 0,
                    round(app.semantic_similarity_score, 2) if app.semantic_similarity_score else 0,
                    app.recruiter_status,
                    app.created_at.strftime('%Y-%m-%d %H:%M:%S')
                ])
        
        elif export_type == "resumes":
            resumes_result = await db.execute(
                select(Resume).filter(Resume.uploader_id == recruiter_id)
            )
            resumes = resumes_result.scalars().all()
            
            writer = csv.writer(output)
            writer.writerow([
                'Resume ID', 'Candidate Name', 'Email', 'Phone',
                'Experience Years', 'Skills', 'Fraud Score', 'Created At'
            ])
            
            for resume in resumes:
                writer.writerow([
                    resume.id,
                    resume.candidate_name or 'N/A',
                    resume.candidate_email or 'N/A',
                    resume.candidate_phone or 'N/A',
                    resume.experience_years or 0,
                    ', '.join(resume.skills[:10]) if resume.skills else 'N/A',
                    round(resume.inflation_score, 2) if resume.inflation_score else 0,
                    resume.created_at.strftime('%Y-%m-%d %H:%M:%S')
                ])
        
        elif export_type == "jobs":
            jobs_result = await db.execute(
                select(Job).filter(Job.recruiter_id == recruiter_id)
            )
            jobs = jobs_result.scalars().all()
            
            writer = csv.writer(output)
            writer.writerow([
                'Job ID', 'Title', 'Company', 'Location',
                'Required Skills', 'Experience Min', 'Experience Max',
                'Is Active', 'Created At'
            ])
            
            for job in jobs:
                writer.writerow([
                    job.id,
                    job.title,
                    job.company,
                    job.location or 'N/A',
                    ', '.join(job.required_skills[:10]) if job.required_skills else 'N/A',
                    job.experience_years_min or 0,
                    job.experience_years_max or 0,
                    'Yes' if job.is_active else 'No',
                    job.created_at.strftime('%Y-%m-%d %H:%M:%S')
                ])
        
        return output.getvalue()



analytics_service = AnalyticsService()
