from abc import ABC, abstractmethod
from typing import Optional
import google.generativeai as genai
from groq import Groq
from app.core.config import settings


class GenAIProvider(ABC):
    """Abstract base class for GenAI providers"""
    
    @abstractmethod
    async def generate_explanation(self, prompt: str) -> str:
        """Generate explanation text"""
        pass


class GeminiProvider(GenAIProvider):
    """Google Gemini implementation"""
    
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.GEMINI_MODEL)
    
    async def generate_explanation(self, prompt: str) -> str:
        try:
            response = self.model.generate_content(
                prompt,
                generation_config={
                    "temperature": settings.GENAI_TEMPERATURE,
                    "max_output_tokens": settings.GENAI_MAX_TOKENS,
                }
            )
            return response.text
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")


class GroqProvider(GenAIProvider):
    """Groq implementation - FIXED"""
    
    def __init__(self):
        # Initialize Groq client without proxies parameter
        self.client = Groq(
            api_key=settings.GROQ_API_KEY
        )
    
    async def generate_explanation(self, prompt: str) -> str:
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert AI recruiter assistant. Provide clear, concise explanations."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                model=settings.GROQ_MODEL,
                temperature=settings.GENAI_TEMPERATURE,
                max_tokens=settings.GENAI_MAX_TOKENS,
            )
            return chat_completion.choices[0].message.content
        except Exception as e:
            raise Exception(f"Groq API error: {str(e)}")


class GenAIService:
    """Factory class to get the configured GenAI provider"""
    
    _instance: Optional[GenAIProvider] = None
    
    @classmethod
    def get_provider(cls) -> GenAIProvider:
        """Get the configured GenAI provider instance"""
        if cls._instance is None:
            if settings.GENAI_PROVIDER == "gemini":
                if not settings.GEMINI_API_KEY:
                    raise ValueError("GEMINI_API_KEY not configured")
                cls._instance = GeminiProvider()
            elif settings.GENAI_PROVIDER == "groq":
                if not settings.GROQ_API_KEY:
                    raise ValueError("GROQ_API_KEY not configured")
                cls._instance = GroqProvider()
            else:
                raise ValueError(f"Unknown GenAI provider: {settings.GENAI_PROVIDER}")
        
        return cls._instance


# Convenience function
async def generate_match_explanation(
    job_title: str,
    job_requirements: str,
    candidate_skills: list,
    candidate_experience: str,
    match_score: float
) -> dict:
    """Generate explanation for candidate-job match"""
    
    provider = GenAIService.get_provider()
    
    prompt = f"""
Analyze this candidate-job match and provide a concise explanation:

Job Title: {job_title}
Job Requirements: {job_requirements}

Candidate Skills: {', '.join(candidate_skills)}
Candidate Experience: {candidate_experience}

Match Score: {match_score}/100

Provide:
1. Top 3 strengths (why this candidate is a good fit)
2. Top 3 gaps or weaknesses (what's missing or concerning)
3. Overall recommendation (1-2 sentences)

Format your response as JSON with keys: strengths (array), weaknesses (array), recommendation (string)
"""
    
    response_text = await provider.generate_explanation(prompt)
    
    # Parse response (you can add JSON parsing logic here)
    return {
        "raw_explanation": response_text,
        "prompt_used": prompt
    }
