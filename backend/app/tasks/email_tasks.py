from celery import shared_task
from typing import Dict, List
from app.services.email_service import email_service
from app.core.config import settings
import asyncio
from app.services.genai_service import GenAIService



@shared_task(bind=True, max_retries=3)
def send_welcome_email(self, user_email: str, user_name: str, company_name: str):
    """Send welcome email to new user"""
    
    subject = f"Welcome to {settings.APP_NAME}!"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 Welcome to AI Hiring Platform!</h1>
            </div>
            <div class="content">
                <p>Hi {user_name},</p>
                <p>Welcome aboard! We're thrilled to have <strong>{company_name}</strong> join our platform.</p>
                <p><strong>Get started in 3 easy steps:</strong></p>
                <ol>
                    <li>Upload candidate resumes (PDF/DOCX)</li>
                    <li>Create job postings</li>
                    <li>Let our AI match and rank candidates</li>
                </ol>
                <p>Our AI will automatically:</p>
                <ul>
                    <li>✓ Parse resumes and extract skills</li>
                    <li>✓ Match candidates to jobs with 95%+ accuracy</li>
                    <li>✓ Detect resume fraud and bias</li>
                    <li>✓ Generate personalized outreach messages</li>
                </ul>
                <center>
                    <a href="{settings.FRONTEND_URL}/dashboard" class="button">Go to Dashboard</a>
                </center>
                <p>Need help? Check out our <a href="{settings.FRONTEND_URL}/docs">documentation</a> or reply to this email.</p>
                <p>Best regards,<br><strong>The AI Hiring Team</strong></p>
            </div>
            <div class="footer">
                <p>© 2026 AI Hiring Platform. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        success = email_service.send_email(
            to_email=user_email,
            subject=subject,
            html_content=html_content
        )
        return {"success": success, "email": user_email}
    except Exception as e:
        self.retry(exc=e, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_application_notification(
    self,
    recruiter_email: str,
    recruiter_name: str,
    candidate_name: str,
    job_title: str,
    match_score: float,
    application_id: int
):
    """Notify recruiter of new candidate application"""
    
    subject = f"New Candidate Match: {candidate_name} for {job_title}"
    
    score_color = "#4caf50" if match_score >= 80 else "#ff9800" if match_score >= 60 else "#f44336"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #667eea;">🎯 New Candidate Match!</h2>
            <p>Hi {recruiter_name},</p>
            <p>Great news! We've found a strong candidate for your <strong>{job_title}</strong> position.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">{candidate_name}</h3>
                <p style="font-size: 24px; color: {score_color}; margin: 10px 0;">
                    <strong>{match_score}% Match</strong>
                </p>
            </div>
            
            <p><a href="{settings.FRONTEND_URL}/applications/{application_id}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View Application</a></p>
            
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
                This is an automated notification. Manage your preferences in your account settings.
            </p>
        </div>
    </body>
    </html>
    """
    
    try:
        success = email_service.send_email(
            to_email=recruiter_email,
            subject=subject,
            html_content=html_content
        )
        return {"success": success, "email": recruiter_email}
    except Exception as e:
        self.retry(exc=e, countdown=60)


@shared_task
def send_bulk_job_alerts(candidate_emails: List[str], job_title: str, job_id: int):
    """Send job alerts to multiple candidates"""
    
    results = []
    for email in candidate_emails:
        result = send_job_alert.delay(email, job_title, job_id)
        results.append(result.id)
    
    return {"task_ids": results, "total": len(candidate_emails)}


@shared_task(bind=True, max_retries=3)
def send_job_alert(self, candidate_email: str, job_title: str, job_id: int):
    """Send job alert to candidate"""
    
    subject = f"New Job Opportunity: {job_title}"
    
    html_content = f"""
    <div style="font-family: Arial, sans-serif;">
        <h2>🚀 New Job Opportunity!</h2>
        <p>A new position matching your profile is now available:</p>
        <h3>{job_title}</h3>
        <p><a href="{settings.FRONTEND_URL}/jobs/{job_id}">View Job Details</a></p>
    </div>
    """
    
    try:
        success = email_service.send_email(
            to_email=candidate_email,
            subject=subject,
            html_content=html_content
        )
        return {"success": success, "email": candidate_email}
    except Exception as e:
        self.retry(exc=e, countdown=60)



@shared_task(bind=True, max_retries=3)
def send_ai_rejection_email(
    self,
    candidate_email: str,
    candidate_name: str,
    job_title: str,
    company_name: str
):
    """Send AI-generated rejection email"""
    
    # Generate AI content synchronously
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    async def generate_content():
        provider = GenAIService.get_provider()
        prompt = f"""Write a kind, empathetic rejection email for a job candidate.

Candidate: {candidate_name}
Position: {job_title}
Company: {company_name}

Requirements:
- Be professional yet warm
- Thank them for their time
- Acknowledge their qualifications
- Encourage them to apply for future roles
- Keep it 100-120 words
- Format as HTML with proper paragraphs

Do NOT include subject line or signature. Only the email body."""
        
        return await provider.generate_explanation(prompt)
    
    try:
        ai_content = loop.run_until_complete(generate_content())
    except Exception as e:
        # Fallback content
        ai_content = f"""
        <p>Dear {candidate_name},</p>
        <p>Thank you for your interest in the {job_title} position at {company_name}.</p>
        <p>After careful consideration, we have decided to move forward with other candidates whose experience more closely aligns with our current needs.</p>
        <p>We were impressed by your qualifications and encourage you to apply for future openings that match your skills.</p>
        <p>We wish you the best in your job search.</p>
        """
    finally:
        loop.close()
    
    subject = f"Update on Your Application for {job_title}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            {ai_content}
            <p style="margin-top: 30px;">Best regards,<br><strong>{company_name} Hiring Team</strong></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #666;">
                This is an automated message from {settings.APP_NAME}.
            </p>
        </div>
    </body>
    </html>
    """
    
    try:
        success = email_service.send_email(
            to_email=candidate_email,
            subject=subject,
            html_content=html_content
        )
        return {"success": success, "email": candidate_email, "type": "rejection"}
    except Exception as e:
        self.retry(exc=e, countdown=60)


@shared_task(bind=True, max_retries=3)
def send_ai_interview_invitation(
    self,
    candidate_email: str,
    candidate_name: str,
    job_title: str,
    company_name: str,
    interview_date: str,
    interview_time: str,
    interview_link: str = None
):
    """Send AI-generated interview invitation"""
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    
    async def generate_content():
        provider = GenAIService.get_provider()
        prompt = f"""Write an enthusiastic interview invitation email.

Candidate: {candidate_name}
Position: {job_title}
Company: {company_name}
Interview Date: {interview_date}
Interview Time: {interview_time}

Requirements:
- Express excitement about their candidacy
- Clearly state date and time
- Provide what to expect in the interview
- Professional yet friendly tone
- 120-150 words
- Format as HTML

Do NOT include subject line or signature."""
        
        return await provider.generate_explanation(prompt)
    
    try:
        ai_content = loop.run_until_complete(generate_content())
    except Exception as e:
        ai_content = f"""
        <p>Dear {candidate_name},</p>
        <p>We're excited to invite you to interview for the {job_title} position at {company_name}!</p>
        <p><strong>Interview Details:</strong></p>
        <ul>
            <li>Date: {interview_date}</li>
            <li>Time: {interview_time}</li>
        </ul>
        <p>During the interview, we'll discuss your background, the role, and answer any questions you may have.</p>
        """
    finally:
        loop.close()
    
    # Add interview link if provided
    if interview_link:
        link_html = f'<p><a href="{interview_link}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0;">Join Interview</a></p>'
        ai_content = ai_content.replace('</p>', f'</p>{link_html}', 1)
    
    subject = f"Interview Invitation: {job_title} at {company_name}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #667eea; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0;">🎉 Interview Invitation</h2>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
                {ai_content}
                <p>We look forward to meeting you!</p>
                <p style="margin-top: 30px;">Best regards,<br><strong>{company_name} Hiring Team</strong></p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        success = email_service.send_email(
            to_email=candidate_email,
            subject=subject,
            html_content=html_content
        )
        return {"success": success, "email": candidate_email, "type": "interview"}
    except Exception as e:
        self.retry(exc=e, countdown=60)


@shared_task
def send_weekly_digest(recruiter_id: int):
    """Send weekly digest to recruiter"""
    
    from app.db.session import SessionLocal
    from sqlalchemy import select, func
    from datetime import datetime, timedelta
    
    db = SessionLocal()
    
    try:
        # Get recruiter
        recruiter = db.execute(select(User).filter(User.id == recruiter_id)).scalars().first()
        
        if not recruiter:
            return {"error": "Recruiter not found"}
        
        # Get stats for the week
        week_ago = datetime.utcnow() - timedelta(days=7)
        
        # Count new applications
        new_apps = db.execute(
            select(func.count(Application.id))
            .filter(Application.created_at >= week_ago)
            .join(Job)
            .filter(Job.recruiter_id == recruiter_id)
        ).scalar()
        
        # Count new resumes
        new_resumes = db.execute(
            select(func.count(Resume.id))
            .filter(Resume.created_at >= week_ago)
            .filter(Resume.uploader_id == recruiter_id)
        ).scalar()
        
        subject = f"Your Weekly Hiring Digest - {datetime.now().strftime('%B %d, %Y')}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #667eea;">📊 Your Weekly Hiring Digest</h2>
                <p>Hi {recruiter.full_name or 'there'},</p>
                <p>Here's what happened this week on AI Hiring Platform:</p>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">📈 This Week's Activity</h3>
                    <p>📄 <strong>{new_resumes}</strong> new resumes uploaded</p>
                    <p>🎯 <strong>{new_apps}</strong> new candidate matches</p>
                </div>
                
                <p><a href="{settings.FRONTEND_URL}/dashboard" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">View Dashboard</a></p>
                
                <p>Keep up the great work!</p>
                <p>Best regards,<br>The AI Hiring Team</p>
            </div>
        </body>
        </html>
        """
        
        success = email_service.send_email(
            to_email=recruiter.email,
            subject=subject,
            html_content=html_content
        )
        
        return {"success": success, "recruiter_id": recruiter_id}
        
    finally:
        db.close()
