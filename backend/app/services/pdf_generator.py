from typing import Dict, List, Optional
from datetime import datetime
import os
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas


class PDFGeneratorService:
    """Generate professional PDF resumes"""
    
    def __init__(self):
        self.output_dir = Path("generated_resumes")
        self.output_dir.mkdir(exist_ok=True)
    
    async def generate_resume_pdf(
        self,
        resume_data: Dict,
        template_config: Dict,
        output_filename: str
    ) -> str:
        """Generate PDF resume based on template config"""
        
        template_type = template_config.get('template_type', 'chronological')
        country = template_config.get('country', 'US')
        
        # Choose page size based on country
        pagesize = A4 if country in ['DE', 'FR', 'UK', 'NL', 'EUROPASS'] else letter
        
        filepath = self.output_dir / output_filename
        
        # Create PDF document
        doc = SimpleDocTemplate(
            str(filepath),
            pagesize=pagesize,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )
        
        # Build content based on template
        story = []
        styles = self._get_custom_styles()
        
        # Add header with contact info
        story.extend(self._build_header(resume_data, styles, template_config))
        story.append(Spacer(1, 0.2*inch))
        
        # Add professional summary
        if resume_data.get('professional_summary') or resume_data.get('ai_optimized_summary'):
            story.extend(self._build_summary(resume_data, styles))
            story.append(Spacer(1, 0.2*inch))
        
        # Add sections based on template config
        sections = template_config.get('sections', [
            'experience', 'education', 'skills', 'languages', 'certifications'
        ])
        
        for section in sections:
            if section == 'experience' and resume_data.get('work_experience'):
                story.extend(self._build_experience(resume_data, styles))
                story.append(Spacer(1, 0.2*inch))
            
            elif section == 'education' and resume_data.get('education'):
                story.extend(self._build_education(resume_data, styles))
                story.append(Spacer(1, 0.2*inch))
            
            elif section == 'skills' and resume_data.get('skills'):
                story.extend(self._build_skills(resume_data, styles))
                story.append(Spacer(1, 0.2*inch))
            
            elif section == 'languages' and resume_data.get('languages'):
                story.extend(self._build_languages(resume_data, styles))
                story.append(Spacer(1, 0.2*inch))
            
            elif section == 'certifications' and resume_data.get('certifications'):
                story.extend(self._build_certifications(resume_data, styles))
                story.append(Spacer(1, 0.2*inch))
            
            elif section == 'projects' and resume_data.get('projects'):
                story.extend(self._build_projects(resume_data, styles))
                story.append(Spacer(1, 0.2*inch))
        
        # Add references if required
        if template_config.get('include_references') and resume_data.get('references'):
            story.extend(self._build_references(resume_data, styles))
        
        # Build PDF
        doc.build(story)
        
        return str(filepath)
    
    def _get_custom_styles(self):
        """Create custom paragraph styles"""
        styles = getSampleStyleSheet()
        
        # Add custom styles
        styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2563eb'),
            spaceAfter=12,
            alignment=TA_CENTER
        ))
        
        styles.add(ParagraphStyle(
            name='SectionHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=6,
            borderWidth=0,
            borderColor=colors.HexColor('#2563eb'),
            borderPadding=2,
            borderRadius=0
        ))
        
        styles.add(ParagraphStyle(
            name='ContactInfo',
            parent=styles['Normal'],
            fontSize=10,
            alignment=TA_CENTER,
            spaceAfter=6
        ))
        
        styles.add(ParagraphStyle(
            name='JobTitle',
            parent=styles['Normal'],
            fontSize=12,
            textColor=colors.HexColor('#1f2937'),
            fontName='Helvetica-Bold',
            spaceAfter=3
        ))
        
        styles.add(ParagraphStyle(
            name='CompanyInfo',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#6b7280'),
            spaceAfter=3
        ))
        
        return styles
    
    def _build_header(self, resume_data: Dict, styles, template_config: Dict) -> List:
        """Build resume header with contact information"""
        story = []
        personal_info = resume_data.get('personal_info', {})
        
        # Name
        name = personal_info.get('full_name', 'Name Not Provided')
        story.append(Paragraph(name, styles['CustomTitle']))
        
        # Contact information
        contact_parts = []
        if personal_info.get('email'):
            contact_parts.append(personal_info['email'])
        if personal_info.get('phone'):
            contact_parts.append(personal_info['phone'])
        if personal_info.get('location'):
            loc = personal_info['location']
            location_str = f"{loc.get('city', '')}, {loc.get('country', '')}".strip(', ')
            if location_str:
                contact_parts.append(location_str)
        
        if contact_parts:
            contact_text = ' | '.join(contact_parts)
            story.append(Paragraph(contact_text, styles['ContactInfo']))
        
        # LinkedIn and website
        links = []
        if personal_info.get('linkedin'):
            links.append(f"LinkedIn: {personal_info['linkedin']}")
        if personal_info.get('website'):
            links.append(f"Website: {personal_info['website']}")
        
        if links:
            link_text = ' | '.join(links)
            story.append(Paragraph(link_text, styles['ContactInfo']))
        
        return story
    
    def _build_summary(self, resume_data: Dict, styles) -> List:
        """Build professional summary section"""
        story = []
        
        story.append(Paragraph("PROFESSIONAL SUMMARY", styles['SectionHeading']))
        
        summary = resume_data.get('ai_optimized_summary') or resume_data.get('professional_summary', '')
        story.append(Paragraph(summary, styles['BodyText']))
        
        return story
    
    def _build_experience(self, resume_data: Dict, styles) -> List:
        """Build work experience section"""
        story = []
        
        story.append(Paragraph("WORK EXPERIENCE", styles['SectionHeading']))
        
        for exp in resume_data.get('work_experience', []):
            # Job title and company
            title = exp.get('title', 'Position')
            company = exp.get('company', 'Company')
            story.append(Paragraph(f"<b>{title}</b>", styles['JobTitle']))
            
            # Company and duration
            duration = exp.get('duration', '')
            location = exp.get('location', '')
            company_info = f"{company}"
            if location:
                company_info += f" | {location}"
            if duration:
                company_info += f" | {duration}"
            story.append(Paragraph(company_info, styles['CompanyInfo']))
            
            # Bullet points
            bullets = exp.get('optimized_bullets', []) or exp.get('responsibilities', [])
            if isinstance(bullets, str):
                bullets = [bullets]
            
            for bullet in bullets:
                bullet_text = f"• {bullet}"
                story.append(Paragraph(bullet_text, styles['BodyText']))
            
            story.append(Spacer(1, 0.15*inch))
        
        return story
    
    def _build_education(self, resume_data: Dict, styles) -> List:
        """Build education section"""
        story = []
        
        story.append(Paragraph("EDUCATION", styles['SectionHeading']))
        
        for edu in resume_data.get('education', []):
            # Degree and institution
            degree = edu.get('degree', 'Degree')
            institution = edu.get('institution', 'Institution')
            story.append(Paragraph(f"<b>{degree}</b>", styles['JobTitle']))
            
            # Institution and year
            year = edu.get('year', '')
            location = edu.get('location', '')
            edu_info = institution
            if location:
                edu_info += f" | {location}"
            if year:
                edu_info += f" | {year}"
            story.append(Paragraph(edu_info, styles['CompanyInfo']))
            
            # Additional info (GPA, honors, etc.)
            if edu.get('gpa'):
                story.append(Paragraph(f"GPA: {edu['gpa']}", styles['BodyText']))
            if edu.get('honors'):
                story.append(Paragraph(f"Honors: {edu['honors']}", styles['BodyText']))
            
            story.append(Spacer(1, 0.1*inch))
        
        return story
    
    def _build_skills(self, resume_data: Dict, styles) -> List:
        """Build skills section"""
        story = []
        
        story.append(Paragraph("SKILLS", styles['SectionHeading']))
        
        skills = resume_data.get('skills', {})
        
        # Handle both dict and list formats
        if isinstance(skills, dict):
            for category, skill_list in skills.items():
                if skill_list:
                    category_title = category.replace('_', ' ').title()
                    skills_text = ', '.join(skill_list) if isinstance(skill_list, list) else skill_list
                    story.append(Paragraph(f"<b>{category_title}:</b> {skills_text}", styles['BodyText']))
        else:
            # Simple list
            skills_text = ', '.join(skills) if isinstance(skills, list) else str(skills)
            story.append(Paragraph(skills_text, styles['BodyText']))
        
        return story
    
    def _build_languages(self, resume_data: Dict, styles) -> List:
        """Build languages section"""
        story = []
        
        story.append(Paragraph("LANGUAGES", styles['SectionHeading']))
        
        languages = resume_data.get('languages', [])
        for lang in languages:
            if isinstance(lang, dict):
                lang_name = lang.get('language', 'Language')
                proficiency = lang.get('proficiency', '')
                story.append(Paragraph(f"<b>{lang_name}</b>: {proficiency}", styles['BodyText']))
            else:
                story.append(Paragraph(str(lang), styles['BodyText']))
        
        return story
    
    def _build_certifications(self, resume_data: Dict, styles) -> List:
        """Build certifications section"""
        story = []
        
        story.append(Paragraph("CERTIFICATIONS", styles['SectionHeading']))
        
        certifications = resume_data.get('certifications', [])
        for cert in certifications:
            if isinstance(cert, dict):
                cert_name = cert.get('name', 'Certification')
                issuer = cert.get('issuer', '')
                year = cert.get('year', '')
                cert_text = f"• <b>{cert_name}</b>"
                if issuer:
                    cert_text += f" - {issuer}"
                if year:
                    cert_text += f" ({year})"
                story.append(Paragraph(cert_text, styles['BodyText']))
            else:
                story.append(Paragraph(f"• {cert}", styles['BodyText']))
        
        return story
    
    def _build_projects(self, resume_data: Dict, styles) -> List:
        """Build projects section"""
        story = []
        
        story.append(Paragraph("PROJECTS", styles['SectionHeading']))
        
        projects = resume_data.get('projects', [])
        for project in projects:
            title = project.get('title', 'Project')
            description = project.get('description', '')
            technologies = project.get('technologies', [])
            
            story.append(Paragraph(f"<b>{title}</b>", styles['JobTitle']))
            if description:
                story.append(Paragraph(description, styles['BodyText']))
            if technologies:
                tech_text = ', '.join(technologies) if isinstance(technologies, list) else technologies
                story.append(Paragraph(f"Technologies: {tech_text}", styles['CompanyInfo']))
            
            story.append(Spacer(1, 0.1*inch))
        
        return story
    
    def _build_references(self, resume_data: Dict, styles) -> List:
        """Build references section"""
        story = []
        
        story.append(Paragraph("REFERENCES", styles['SectionHeading']))
        
        references = resume_data.get('references', [])
        if references == "available":
            story.append(Paragraph("Available upon request", styles['BodyText']))
        else:
            for ref in references:
                if isinstance(ref, dict):
                    name = ref.get('name', '')
                    title = ref.get('title', '')
                    company = ref.get('company', '')
                    phone = ref.get('phone', '')
                    email = ref.get('email', '')
                    
                    ref_text = f"<b>{name}</b>"
                    if title:
                        ref_text += f", {title}"
                    if company:
                        ref_text += f" at {company}"
                    story.append(Paragraph(ref_text, styles['BodyText']))
                    
                    contact = []
                    if phone:
                        contact.append(f"Phone: {phone}")
                    if email:
                        contact.append(f"Email: {email}")
                    if contact:
                        story.append(Paragraph(' | '.join(contact), styles['CompanyInfo']))
                    
                    story.append(Spacer(1, 0.1*inch))
        
        return story


pdf_generator_service = PDFGeneratorService()
