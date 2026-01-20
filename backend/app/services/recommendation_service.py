import numpy as np
import faiss
from typing import List, Dict, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sentence_transformers import SentenceTransformer

from app.models.job import Job
from app.models.resume import Resume
from app.services.genai_service import GenAIService
import json


class RecommendationService:
    """AI-powered candidate recommendation engine"""
    
    def __init__(self):
        # Load sentence transformer for embeddings
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.embedding_dim = 384  # Dimension for all-MiniLM-L6-v2
    
    def generate_job_embedding(self, job: Job) -> np.ndarray:
        """Generate embedding vector for a job"""
        
        # Combine all job information into a single text
        job_text = f"{job.title}\n{job.description}"
        if job.requirements:
            job_text += f"\n{job.requirements}"
        if job.required_skills:
            job_text += f"\nRequired skills: {', '.join(job.required_skills)}"
        if job.location:
            job_text += f"\nLocation: {job.location}"
        
        # Generate embedding
        embedding = self.model.encode(job_text, convert_to_numpy=True)
        return embedding
    
    def generate_resume_embedding(self, resume: Resume) -> np.ndarray:
        """Generate embedding vector for a resume"""
        
        # Combine resume information
        resume_text = ""
        if resume.candidate_name:
            resume_text += f"{resume.candidate_name}\n"
        if resume.raw_text:
            resume_text += resume.raw_text[:2000]  # First 2000 chars
        if resume.skills:
            resume_text += f"\nSkills: {', '.join(resume.skills)}"
        if resume.experience_years:
            resume_text += f"\nExperience: {resume.experience_years} years"
        
        # Generate embedding
        embedding = self.model.encode(resume_text, convert_to_numpy=True)
        return embedding
    
    async def find_matching_candidates(
        self,
        job: Job,
        all_resumes: List[Resume],
        top_k: int = 10,
        min_score: float = 0.5
    ) -> List[Dict]:
        """Find top matching candidates for a job using FAISS similarity search"""
        
        if not all_resumes:
            return []
        
        # Generate job embedding
        job_embedding = self.generate_job_embedding(job)
        
        # Generate embeddings for all resumes
        resume_embeddings = []
        valid_resumes = []
        
        for resume in all_resumes:
            try:
                embedding = self.generate_resume_embedding(resume)
                resume_embeddings.append(embedding)
                valid_resumes.append(resume)
            except Exception as e:
                print(f"Error generating embedding for resume {resume.id}: {e}")
                continue
        
        if not resume_embeddings:
            return []
        
        # Create FAISS index
        resume_embeddings_array = np.array(resume_embeddings).astype('float32')
        
        # Normalize vectors for cosine similarity
        faiss.normalize_L2(resume_embeddings_array)
        
        # Build index
        index = faiss.IndexFlatIP(self.embedding_dim)  # Inner Product for cosine similarity
        index.add(resume_embeddings_array)
        
        # Search for similar resumes
        job_embedding_normalized = job_embedding.reshape(1, -1).astype('float32')
        faiss.normalize_L2(job_embedding_normalized)
        
        # Get top_k results
        k = min(top_k, len(valid_resumes))
        distances, indices = index.search(job_embedding_normalized, k)
        
        # Prepare results
        recommendations = []
        for i, idx in enumerate(indices[0]):
            similarity_score = float(distances[0][i])
            
            # Convert cosine similarity to percentage (0-100)
            match_percentage = (similarity_score + 1) * 50  # Scale from [-1,1] to [0,100]
            
            if match_percentage >= (min_score * 100):
                resume = valid_resumes[idx]
                recommendations.append({
                    'resume_id': resume.id,
                    'candidate_name': resume.candidate_name,
                    'candidate_email': resume.candidate_email,
                    'similarity_score': round(match_percentage, 2),
                    'skills': resume.skills or [],
                    'experience_years': resume.experience_years,
                    'rank': i + 1
                })
        
        return recommendations
    
    async def generate_outreach_message(
        self,
        job_title: str,
        company: str,
        candidate_name: str,
        candidate_skills: List[str],
        match_score: float,
        job_description: str
    ) -> str:
        """Generate personalized outreach message using GenAI"""
        
        provider = GenAIService.get_provider()
        
        prompt = f"""Write a personalized, professional outreach email to a candidate for a job opportunity.

**Job Details:**
Position: {job_title}
Company: {company}
Job Description (excerpt): {job_description[:300]}

**Candidate Information:**
Name: {candidate_name}
Relevant Skills: {', '.join(candidate_skills[:10])}
Match Score: {match_score}%

Write a compelling, personalized email that:
1. Addresses the candidate by name
2. Mentions specific skills that make them a great fit
3. Briefly describes the role and company
4. Expresses genuine interest in their background
5. Includes a clear call-to-action
6. Keeps professional yet friendly tone
7. Length: 150-200 words

Format as plain text email (no HTML, no subject line - body only).
"""
        
        try:
            message = await provider.generate_explanation(prompt)
            return message.strip()
        except Exception as e:
            # Fallback message
            return f"""Hi {candidate_name},

I came across your profile and was impressed by your background in {', '.join(candidate_skills[:3])}.

We have an exciting opportunity for a {job_title} position at {company} that I think would be a great match for your skills and experience. With a {match_score}% compatibility score, you're among our top candidates.

Would you be interested in learning more about this opportunity? I'd love to schedule a brief call to discuss how your expertise could contribute to our team.

Looking forward to hearing from you!

Best regards"""
    
    async def generate_batch_recommendations(
        self,
        job: Job,
        all_resumes: List[Resume],
        top_k: int = 10,
        generate_messages: bool = False
    ) -> Dict:
        """Generate complete recommendation report with optional outreach messages"""
        
        # Find matching candidates
        recommendations = await self.find_matching_candidates(
            job=job,
            all_resumes=all_resumes,
            top_k=top_k
        )
        
        # Generate outreach messages if requested
        if generate_messages:
            for rec in recommendations:
                message = await self.generate_outreach_message(
                    job_title=job.title,
                    company=job.company,
                    candidate_name=rec['candidate_name'] or "there",
                    candidate_skills=rec['skills'],
                    match_score=rec['similarity_score'],
                    job_description=job.description
                )
                rec['outreach_message'] = message
        
        return {
            'job_id': job.id,
            'job_title': job.title,
            'total_candidates_screened': len(all_resumes),
            'recommendations_count': len(recommendations),
            'top_candidates': recommendations,
            'average_match_score': round(
                sum(r['similarity_score'] for r in recommendations) / len(recommendations), 2
            ) if recommendations else 0
        }
    
    async def update_embeddings_batch(
        self,
        db: AsyncSession,
        batch_size: int = 50
    ) -> Dict:
        """Batch update embeddings for all jobs and resumes"""
        
        stats = {
            'jobs_updated': 0,
            'resumes_updated': 0,
            'errors': []
        }
        
        # Update job embeddings
        try:
            jobs_result = await db.execute(select(Job))
            jobs = jobs_result.scalars().all()
            
            for job in jobs:
                try:
                    embedding = self.generate_job_embedding(job)
                    job.embedding_vector = embedding.tolist()
                    stats['jobs_updated'] += 1
                except Exception as e:
                    stats['errors'].append(f"Job {job.id}: {str(e)}")
            
            await db.commit()
        except Exception as e:
            stats['errors'].append(f"Job batch update failed: {str(e)}")
        
        # Update resume embeddings
        try:
            resumes_result = await db.execute(select(Resume))
            resumes = resumes_result.scalars().all()
            
            for resume in resumes:
                try:
                    embedding = self.generate_resume_embedding(resume)
                    resume.embedding_vector = embedding.tolist()
                    stats['resumes_updated'] += 1
                except Exception as e:
                    stats['errors'].append(f"Resume {resume.id}: {str(e)}")
            
            await db.commit()
        except Exception as e:
            stats['errors'].append(f"Resume batch update failed: {str(e)}")
        
        return stats
