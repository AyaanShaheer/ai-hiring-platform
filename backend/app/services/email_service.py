import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional, Dict
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from jinja2 import Template

from app.core.config import settings
from app.services.genai_service import GenAIService


class EmailService:
    """Handle email sending via SendGrid or SMTP"""
    
    def __init__(self):
        self.use_sendgrid = bool(settings.SENDGRID_API_KEY)
        if self.use_sendgrid:
            self.sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
    
    def _send_via_sendgrid(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_content: Optional[str] = None
    ) -> bool:
        """Send email via SendGrid"""
        try:
            message = Mail(
                from_email=Email(settings.EMAIL_FROM, settings.EMAIL_FROM_NAME),
                to_emails=To(to_email),
                subject=subject,
                html_content=Content("text/html", html_content)
            )
            
            if plain_content:
                message.plain_text_content = Content("text/plain", plain_content)
            
            response = self.sg.send(message)
            return response.status_code in [200, 201, 202]
        except Exception as e:
            print(f"SendGrid error: {e}")
            return False
    
    def _send_via_smtp(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_content: Optional[str] = None
    ) -> bool:
        """Send email via SMTP"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
            msg['To'] = to_email
            
            # Attach plain text and HTML
            if plain_content:
                msg.attach(MIMEText(plain_content, 'plain'))
            msg.attach(MIMEText(html_content, 'html'))
            
            # Send via SMTP
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                if settings.SMTP_TLS:
                    server.starttls()
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            return True
        except Exception as e:
            print(f"SMTP error: {e}")
            return False
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        plain_content: Optional[str] = None
    ) -> bool:
        """Send email using configured provider"""
        
        if not settings.EMAIL_ENABLED:
            print(f"Email disabled. Would send to {to_email}: {subject}")
            return True
        
        if self.use_sendgrid:
            return self._send_via_sendgrid(to_email, subject, html_content, plain_content)
        else:
            return self._send_via_smtp(to_email, subject, html_content, plain_content)
    
    async def generate_personalized_content(
        self,
        template_type: str,
        context: Dict
    ) -> str:
        """Use AI to personalize email content"""
        
        provider = GenAIService.get_provider()
        
        prompts = {
            'welcome': f"""Write a warm, professional welcome email for a new recruiter.
            
            User: {context.get('name', 'there')}
            Company: {context.get('company', 'your company')}
            
            Keep it friendly, 100-150 words, and encourage them to start by uploading resumes.
            Format as HTML with proper paragraphs.""",
            
            'rejection': f"""Write a kind, encouraging rejection email for a job candidate.
            
            Candidate: {context.get('candidate_name', 'there')}
            Position: {context.get('job_title', 'the position')}
            
            Be empathetic, constructive, and professional. 100-120 words.
            Format as HTML.""",
            
            'interview_invitation': f"""Write a professional interview invitation email.
            
            Candidate: {context.get('candidate_name', 'there')}
            Position: {context.get('job_title', 'the position')}
            Company: {context.get('company', 'our company')}
            
            Express excitement, provide next steps. 100-150 words.
            Format as HTML."""
        }
        
        prompt = prompts.get(template_type, "Write a professional email.")
        
        try:
            content = await provider.generate_explanation(prompt)
            return content
        except Exception as e:
            print(f"AI content generation failed: {e}")
            return self._get_fallback_content(template_type, context)
    
    def _get_fallback_content(self, template_type: str, context: Dict) -> str:
        """Fallback templates if AI fails"""
        
        templates = {
            'welcome': f"""
            <p>Hi {context.get('name', 'there')},</p>
            <p>Welcome to AI Hiring Platform! We're excited to help you find the best candidates for your team.</p>
            <p>Get started by uploading resumes and creating job postings. Our AI will automatically match candidates and provide insights.</p>
            <p>Best regards,<br>The AI Hiring Team</p>
            """,
            
            'rejection': f"""
            <p>Dear {context.get('candidate_name', 'Candidate')},</p>
            <p>Thank you for your interest in the {context.get('job_title', 'position')}. After careful consideration, we've decided to move forward with other candidates.</p>
            <p>We appreciate the time you invested in the process and encourage you to apply for future opportunities.</p>
            <p>Best wishes,<br>{context.get('company', 'The Team')}</p>
            """
        }
        
        return templates.get(template_type, "<p>Thank you!</p>")


# Global instance
email_service = EmailService()
