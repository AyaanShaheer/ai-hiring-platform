from typing import Dict, List, Optional
from datetime import datetime

from app.services.genai_service import GenAIService


class ResumeGenerationService:
    """AI-powered resume generation and optimization"""
    
    def __init__(self):
        self.genai_provider = GenAIService.get_provider()
    
    # Country-specific guidelines
    COUNTRY_GUIDELINES = {
        "US": {
            "max_pages": 2,
            "photo": False,
            "date_format": "MM/YYYY",
            "references": False,
            "focus": "Achievements and quantifiable results",
            "tips": ["Use action verbs", "Include metrics", "Tailor to job description"]
        },
        "UK": {
            "max_pages": 2,
            "photo": False,
            "date_format": "MM/YYYY",
            "references": "Available upon request",
            "focus": "Professional experience and skills",
            "tips": ["Be concise", "Include hobbies if relevant", "Professional tone"]
        },
        "DE": {  # Germany
            "max_pages": 3,
            "photo": True,
            "date_format": "DD.MM.YYYY",
            "references": True,
            "focus": "Detailed qualifications and certifications",
            "tips": ["Include photo", "Very detailed", "List all certificates", "Chronological order"]
        },
        "FR": {  # France
            "max_pages": 2,
            "photo": True,
            "date_format": "DD/MM/YYYY",
            "references": False,
            "focus": "Education and professional path",
            "tips": ["Photo recommended", "State civil status", "Emphasize education"]
        },
        "NL": {  # Netherlands
            "max_pages": 2,
            "photo": False,
            "date_format": "DD-MM-YYYY",
            "references": False,
            "focus": "Direct and concise",
            "tips": ["Be straightforward", "List competencies", "No flowery language"]
        },
        "EUROPASS": {
            "max_pages": 5,
            "photo": True,
            "date_format": "DD/MM/YYYY",
            "references": False,
            "focus": "Standardized EU format",
            "tips": ["Follow Europass structure", "Detail everything", "Use EU qualifications framework"]
        }
    }
    
    async def generate_professional_summary(
        self,
        personal_info: Dict,
        work_experience: List[Dict],
        target_job: str,
        target_country: str
    ) -> str:
        """Generate AI-optimized professional summary"""
        
        guidelines = self.COUNTRY_GUIDELINES.get(target_country, self.COUNTRY_GUIDELINES["US"])
        
        experience_text = "\n".join([
            f"- {exp.get('title')} at {exp.get('company')} ({exp.get('duration')})"
            for exp in work_experience[:3]  # Last 3 jobs
        ])
        
        prompt = f"""Generate a professional resume summary for:

Name: {personal_info.get('full_name')}
Target Job: {target_job}
Target Country: {target_country}
Years of Experience: {len(work_experience)}

Recent Work Experience:
{experience_text}

Country Guidelines for {target_country}:
- Focus: {guidelines['focus']}
- Tips: {', '.join(guidelines['tips'])}

Generate a compelling 3-4 sentence professional summary that:
1. Highlights key achievements
2. Shows relevant experience
3. Matches the country's resume style
4. Is tailored for {target_job}
5. Includes specific metrics if possible

Return only the summary text, no additional commentary."""
        
        try:
            summary = await self.genai_provider.generate_explanation(prompt)
            return summary.strip()
        except Exception as e:
            print(f"Error generating summary: {e}")
            return self._fallback_summary(personal_info, work_experience, target_job)
    
    def _fallback_summary(self, personal_info: Dict, work_experience: List[Dict], target_job: str) -> str:
        """Fallback summary if AI fails"""
        years = len(work_experience)
        latest_role = work_experience[0].get('title', 'Professional') if work_experience else 'Professional'
        
        return f"Experienced {latest_role} with {years}+ years in the industry. Proven track record in delivering results and driving success. Seeking opportunities in {target_job}."
    
    async def optimize_work_experience(
        self,
        experience: Dict,
        target_country: str
    ) -> Dict:
        """Optimize a single work experience entry"""
        
        guidelines = self.COUNTRY_GUIDELINES.get(target_country, self.COUNTRY_GUIDELINES["US"])
        
        prompt = f"""Optimize this work experience bullet points for a {target_country} resume:

Company: {experience.get('company')}
Title: {experience.get('title')}
Duration: {experience.get('duration')}
Current Description:
{experience.get('description', '')}

Country Guidelines:
- Focus: {guidelines['focus']}
- Style: {', '.join(guidelines['tips'])}

Generate 3-5 optimized bullet points that:
1. Start with strong action verbs
2. Include quantifiable achievements
3. Match {target_country} resume style
4. Are ATS-friendly
5. Highlight impact and results

Format as a JSON array of strings."""
        
        try:
            response = await self.genai_provider.generate_explanation(prompt)
            import json
            bullets = json.loads(response)
            
            experience['optimized_bullets'] = bullets
            return experience
        except Exception as e:
            print(f"Error optimizing experience: {e}")
            experience['optimized_bullets'] = [experience.get('description', '')]
            return experience
    
    async def generate_skills_suggestions(
        self,
        current_skills: List[str],
        target_job: str,
        work_experience: List[Dict]
    ) -> Dict:
        """Suggest skills to add or emphasize"""
        
        prompt = f"""Analyze these skills for a {target_job} position:

Current Skills: {', '.join(current_skills)}

Work Experience Summary:
{', '.join([exp.get('title', '') for exp in work_experience[:3]])}

Provide:
1. Skills to emphasize (from current list)
2. Missing important skills to add
3. Skills to group together
4. Technical vs soft skills categorization

Format as JSON:
{{
    "emphasize": ["skill1", "skill2"],
    "add": ["skill3", "skill4"],
    "categories": {{
        "technical": [...],
        "soft": [...],
        "tools": [...]
    }}
}}"""
        
        try:
            response = await self.genai_provider.generate_explanation(prompt)
            import json
            return json.loads(response)
        except:
            return {
                "emphasize": current_skills[:5],
                "add": [],
                "categories": {"technical": current_skills, "soft": [], "tools": []}
            }
    
    async def calculate_ats_score(
        self,
        resume_content: Dict,
        target_job: str
    ) -> Dict:
        """Calculate ATS compatibility score"""
        
        score = 0
        feedback = []
        
        # Check contact info (10 points)
        if resume_content.get('personal_info', {}).get('email'):
            score += 5
        if resume_content.get('personal_info', {}).get('phone'):
            score += 5
        else:
            feedback.append("Add phone number")
        
        # Check professional summary (15 points)
        if resume_content.get('professional_summary'):
            summary_len = len(resume_content['professional_summary'].split())
            if 50 <= summary_len <= 150:
                score += 15
            else:
                score += 5
                feedback.append("Summary should be 50-150 words")
        else:
            feedback.append("Add professional summary")
        
        # Check work experience (30 points)
        work_exp = resume_content.get('work_experience', [])
        if len(work_exp) >= 2:
            score += 15
        if any('optimized_bullets' in exp for exp in work_exp):
            score += 15
        else:
            feedback.append("Add quantifiable achievements")
        
        # Check skills (20 points)
        skills = resume_content.get('skills', {})
        total_skills = sum(len(v) for v in skills.values() if isinstance(v, list))
        if total_skills >= 10:
            score += 20
        elif total_skills >= 5:
            score += 10
        else:
            feedback.append("Add more relevant skills")
        
        # Check education (10 points)
        if resume_content.get('education'):
            score += 10
        else:
            feedback.append("Add education details")
        
        # Check formatting (15 points)
        if len(resume_content.get('professional_summary', '').split()) <= 200:
            score += 5
        if resume_content.get('languages'):
            score += 5
        if resume_content.get('certifications'):
            score += 5
        else:
            feedback.append("Add certifications if applicable")
        
        return {
            "score": min(score, 100),
            "feedback": feedback,
            "strengths": self._get_strengths(resume_content),
            "weaknesses": feedback
        }
    
    def _get_strengths(self, resume_content: Dict) -> List[str]:
        """Identify resume strengths"""
        strengths = []
        
        if len(resume_content.get('work_experience', [])) >= 3:
            strengths.append("Strong work history")
        
        if resume_content.get('certifications'):
            strengths.append("Relevant certifications")
        
        skills_count = sum(len(v) for v in resume_content.get('skills', {}).values() if isinstance(v, list))
        if skills_count >= 15:
            strengths.append("Comprehensive skill set")
        
        if resume_content.get('languages') and len(resume_content['languages']) > 1:
            strengths.append("Multilingual")
        
        return strengths


resume_generation_service = ResumeGenerationService()
