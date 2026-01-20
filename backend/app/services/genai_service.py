from abc import ABC, abstractmethod
from typing import Optional, Dict, List
import google.generativeai as genai
from groq import Groq
from app.core.config import settings
import json


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
    """Groq implementation"""
    
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
    
    async def generate_explanation(self, prompt: str) -> str:
        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are an expert AI recruiter assistant. Provide clear, concise, and actionable explanations."
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


async def generate_match_explanation(
    job_title: str,
    job_description: str,
    job_requirements: str,
    candidate_name: str,
    candidate_skills: List[str],
    candidate_experience_years: float,
    required_skills: List[str],
    required_experience_min: int,
    skill_match_score: float,
    experience_match_score: float,
    overall_match_score: float
) -> Dict:
    """Generate detailed explanation for candidate-job match using GenAI"""
    
    provider = GenAIService.get_provider()
    
    prompt = f"""Analyze this candidate-job match and provide a detailed, actionable explanation.

**Job Details:**
- Title: {job_title}
- Description: {job_description[:500]}
- Requirements: {job_requirements[:500] if job_requirements else 'Not specified'}
- Required Skills: {', '.join(required_skills)}
- Minimum Experience: {required_experience_min} years

**Candidate Profile:**
- Name: {candidate_name}
- Skills: {', '.join(candidate_skills)}
- Experience: {candidate_experience_years} years

**Match Scores:**
- Skill Match: {skill_match_score}%
- Experience Match: {experience_match_score}%
- Overall Match: {overall_match_score}%

Please provide a JSON response with the following structure:
{{
    "summary": "A 2-3 sentence overview of the match quality",
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
    "missing_skills": ["skill 1", "skill 2"],
    "recommendation": "hire/interview/reject",
    "reasoning": "1-2 sentences explaining the recommendation"
}}

Focus on:
1. Specific skills that match or are missing
2. Experience level alignment
3. Practical hiring recommendation
4. Actionable insights for the recruiter

Respond ONLY with valid JSON, no additional text.
"""
    
    try:
        response_text = await provider.generate_explanation(prompt)
        
        # Try to parse JSON response
        # Remove markdown code blocks if present
        response_text = response_text.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        parsed_response = json.loads(response_text)
        
        return {
            "summary": parsed_response.get("summary", ""),
            "strengths": parsed_response.get("strengths", []),
            "weaknesses": parsed_response.get("weaknesses", []),
            "missing_skills": parsed_response.get("missing_skills", []),
            "recommendation": parsed_response.get("recommendation", "interview"),
            "reasoning": parsed_response.get("reasoning", ""),
            "raw_response": response_text
        }
    except json.JSONDecodeError as e:
        # Fallback if JSON parsing fails
        return {
            "summary": response_text[:200],
            "strengths": ["Unable to parse structured response"],
            "weaknesses": [],
            "missing_skills": [],
            "recommendation": "interview",
            "reasoning": "AI response parsing failed",
            "raw_response": response_text
        }
    except Exception as e:
        raise Exception(f"Error generating explanation: {str(e)}")
