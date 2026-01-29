import asyncio
from sqlalchemy import select
from app.models.resume_builder import ResumeTemplate
from app.db.session import AsyncSessionLocal


async def seed_resume_templates():
    """Seed database with resume templates"""
    
    templates = [
        # US Standard
        {
            "name": "US Standard - Chronological",
            "country": "US",
            "template_type": "chronological",
            "description": "Traditional US resume format emphasizing work history",
            "template_config": {
                "sections": ["summary", "experience", "education", "skills", "certifications"],
                "photo_required": False,
                "date_format": "MM/YYYY",
                "max_pages": 2,
                "include_references": False,
                "style": {
                    "font": "Helvetica",
                    "color_scheme": "blue",
                    "spacing": "standard"
                }
            }
        },
        # UK CV
        {
            "name": "UK Professional CV",
            "country": "UK",
            "template_type": "chronological",
            "description": "British CV format with professional focus",
            "template_config": {
                "sections": ["summary", "experience", "education", "skills", "languages"],
                "photo_required": False,
                "date_format": "MM/YYYY",
                "max_pages": 2,
                "include_references": "statement",
                "style": {
                    "font": "Helvetica",
                    "color_scheme": "navy",
                    "spacing": "compact"
                }
            }
        },
        # German CV
        {
            "name": "German Lebenslauf",
            "country": "DE",
            "template_type": "chronological",
            "description": "German CV format with detailed qualifications",
            "template_config": {
                "sections": ["summary", "experience", "education", "skills", "languages", "certifications"],
                "photo_required": True,
                "date_format": "DD.MM.YYYY",
                "max_pages": 3,
                "include_references": True,
                "style": {
                    "font": "Helvetica",
                    "color_scheme": "professional",
                    "spacing": "detailed"
                }
            }
        },
        # French CV
        {
            "name": "French CV",
            "country": "FR",
            "template_type": "chronological",
            "description": "French CV emphasizing education and career path",
            "template_config": {
                "sections": ["summary", "experience", "education", "skills", "languages"],
                "photo_required": True,
                "date_format": "DD/MM/YYYY",
                "max_pages": 2,
                "include_references": False,
                "style": {
                    "font": "Helvetica",
                    "color_scheme": "elegant",
                    "spacing": "standard"
                }
            }
        },
        # Netherlands CV
        {
            "name": "Dutch CV",
            "country": "NL",
            "template_type": "functional",
            "description": "Dutch CV with direct and concise format",
            "template_config": {
                "sections": ["summary", "skills", "experience", "education"],
                "photo_required": False,
                "date_format": "DD-MM-YYYY",
                "max_pages": 2,
                "include_references": False,
                "style": {
                    "font": "Helvetica",
                    "color_scheme": "minimal",
                    "spacing": "compact"
                }
            }
        },
        # Europass
        {
            "name": "Europass CV",
            "country": "EUROPASS",
            "template_type": "europass",
            "description": "Standardized European CV format",
            "template_config": {
                "sections": ["summary", "experience", "education", "skills", "languages", "certifications", "projects"],
                "photo_required": True,
                "date_format": "DD/MM/YYYY",
                "max_pages": 5,
                "include_references": False,
                "style": {
                    "font": "Helvetica",
                    "color_scheme": "europass",
                    "spacing": "detailed"
                }
            }
        },
        # US Tech/Creative
        {
            "name": "US Tech Resume",
            "country": "US",
            "template_type": "functional",
            "description": "Modern tech resume with skills-first approach",
            "template_config": {
                "sections": ["summary", "skills", "projects", "experience", "education", "certifications"],
                "photo_required": False,
                "date_format": "MM/YYYY",
                "max_pages": 2,
                "include_references": False,
                "style": {
                    "font": "Helvetica",
                    "color_scheme": "modern",
                    "spacing": "standard"
                }
            }
        }
    ]
    
    async with AsyncSessionLocal() as db:
        # Check if templates already exist
        result = await db.execute(select(ResumeTemplate))
        existing_templates = result.scalars().all()
        
        if existing_templates:
            print(f"Templates already seeded ({len(existing_templates)} templates found)")
            return
        
        # Add templates
        for template_data in templates:
            template = ResumeTemplate(**template_data)
            db.add(template)
        
        await db.commit()
        print(f"Successfully seeded {len(templates)} resume templates")


if __name__ == "__main__":
    asyncio.run(seed_resume_templates())
