from typing import List, Dict, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
from app.models.job import Job
from app.models.resume import Resume


class MatchingService:
    """Match candidates to jobs using multiple scoring algorithms"""
    
    def __init__(self):
        # Load sentence transformer model for semantic similarity
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
    
    def calculate_skill_match(self, resume_skills: List[str], job_skills: List[str]) -> float:
        """Calculate skill match score (0-100)"""
        if not job_skills or not resume_skills:
            return 0.0
        
        resume_skills_lower = [s.lower() for s in resume_skills]
        job_skills_lower = [s.lower() for s in job_skills]
        
        matched_skills = set(resume_skills_lower) & set(job_skills_lower)
        match_percentage = (len(matched_skills) / len(job_skills_lower)) * 100
        
        return min(match_percentage, 100.0)
    
    def calculate_experience_match(
        self, 
        resume_years: Optional[float], 
        job_min_years: Optional[int],
        job_max_years: Optional[int]
    ) -> float:
        """Calculate experience match score (0-100)"""
        if resume_years is None:
            return 50.0  # Neutral score if unknown
        
        if job_min_years is None:
            return 100.0  # No requirement, perfect match
        
        # If experience meets minimum requirement
        if resume_years >= job_min_years:
            # If there's a max and candidate is within range
            if job_max_years and resume_years <= job_max_years:
                return 100.0
            # If there's a max and candidate exceeds it
            elif job_max_years and resume_years > job_max_years:
                # Slight penalty for being overqualified
                excess = resume_years - job_max_years
                penalty = min(excess * 5, 20)  # Max 20% penalty
                return max(80.0, 100.0 - penalty)
            else:
                # No max, just meets minimum
                return 100.0
        else:
            # Below minimum - calculate how close they are
            shortfall = job_min_years - resume_years
            penalty = min(shortfall * 20, 80)  # 20% per year short, max 80% penalty
            return max(20.0, 100.0 - penalty)
    
    def calculate_semantic_similarity(self, resume_text: str, job_text: str) -> float:
        """Calculate semantic similarity using sentence transformers (0-100)"""
        if not resume_text or not job_text:
            return 0.0
        
        # Truncate texts to avoid memory issues
        resume_text = resume_text[:5000]
        job_text = job_text[:5000]
        
        # Generate embeddings
        resume_embedding = self.model.encode(resume_text, convert_to_numpy=True)
        job_embedding = self.model.encode(job_text, convert_to_numpy=True)
        
        # Calculate cosine similarity
        similarity = np.dot(resume_embedding, job_embedding) / (
            np.linalg.norm(resume_embedding) * np.linalg.norm(job_embedding)
        )
        
        # Convert to 0-100 scale
        return float(similarity * 100)
    
    def calculate_overall_match(
        self,
        skill_score: float,
        experience_score: float,
        semantic_score: float
    ) -> float:
        """Calculate weighted overall match score"""
        # Weights: skills 50%, experience 30%, semantic 20%
        overall_score = (
            skill_score * 0.5 +
            experience_score * 0.3 +
            semantic_score * 0.2
        )
        return round(overall_score, 2)
    
    def match_resume_to_job(self, resume: Resume, job: Job) -> Dict:
        """Match a resume to a job and return detailed scores"""
        
        # Calculate individual scores
        skill_score = self.calculate_skill_match(
            resume.skills or [],
            job.required_skills or []
        )
        
        experience_score = self.calculate_experience_match(
            resume.experience_years,
            job.experience_years_min,
            job.experience_years_max
        )
        
        # Combine job description and requirements for semantic matching
        job_text = f"{job.title}\n{job.description}"
        if job.requirements:
            job_text += f"\n{job.requirements}"
        
        semantic_score = self.calculate_semantic_similarity(
            resume.raw_text or "",
            job_text
        )
        
        # Calculate overall match
        overall_score = self.calculate_overall_match(
            skill_score,
            experience_score,
            semantic_score
        )
        
        return {
            'skill_match_score': round(skill_score, 2),
            'experience_match_score': round(experience_score, 2),
            'semantic_similarity_score': round(semantic_score, 2),
            'overall_match_score': overall_score
        }
