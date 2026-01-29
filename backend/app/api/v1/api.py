from fastapi import APIRouter
from app.api.v1.endpoints import auth, resumes, jobs, matching, fraud, bias, recommendations, emails, analytics, interviews, resume_builder
from app.services.genai_service import GenAIService

api_router = APIRouter()

# Include routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["resumes"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(matching.router, prefix="/matching", tags=["matching"])
api_router.include_router(fraud.router, prefix="/fraud", tags=["fraud-detection"])
api_router.include_router(bias.router, prefix="/bias", tags=["bias-detection"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(emails.router, prefix="/emails", tags=["emails"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])
api_router.include_router(resume_builder.router, prefix="/resume-builder", tags=["resume-builder"])

@api_router.get("/test")
async def test_endpoint():
    return {
        "message": "API v1 is working",
        "genai_provider": GenAIService.get_provider().__class__.__name__
    }


@api_router.get("/test-genai")
async def test_genai():
    """Test GenAI provider connectivity"""
    try:
        provider = GenAIService.get_provider()
        response = await provider.generate_explanation(
            "Explain in one sentence what makes a good software engineer."
        )
        return {
            "status": "success",
            "provider": provider.__class__.__name__,
            "response": response
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e)
        }
