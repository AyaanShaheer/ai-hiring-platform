from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.services.email_service import email_service
from app.core.config import settings

router = APIRouter()


@router.post("/send-welcome")
async def trigger_welcome_email(
    current_user: User = Depends(get_current_active_user)
):
    """Send welcome email (synchronous for simplicity)"""
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head><style>
        body {{ font-family: Arial; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                   color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
    </style></head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎯 Welcome to AI Hiring Platform!</h1>
            </div>
            <div class="content">
                <p>Hi {current_user.full_name or 'there'},</p>
                <p>Welcome aboard! We're thrilled to have <strong>{current_user.company_name or 'you'}</strong> on our platform.</p>
                <p><strong>Get started:</strong></p>
                <ol>
                    <li>Upload candidate resumes</li>
                    <li>Create job postings</li>
                    <li>Let AI match candidates</li>
                </ol>
                <p>Our AI automatically parses resumes, matches candidates, and detects fraud!</p>
                <p>Best regards,<br><strong>The AI Hiring Team</strong></p>
            </div>
        </div>
    </body>
    </html>
    """
    
    success = email_service.send_email(
        to_email=current_user.email,
        subject=f"Welcome to {settings.APP_NAME}!",
        html_content=html_content
    )
    
    return {
        "message": "Email sent" if success else "Email disabled (check .env EMAIL_ENABLED)",
        "email": current_user.email,
        "success": success
    }


@router.get("/test")
async def test_email_system():
    """Test if email system is configured"""
    return {
        "email_enabled": settings.EMAIL_ENABLED,
        "email_from": settings.EMAIL_FROM,
        "has_sendgrid": bool(settings.SENDGRID_API_KEY)
    }
