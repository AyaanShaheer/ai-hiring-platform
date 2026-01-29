from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.core.config import settings
from app.api.v1.api import api_router

# Import all models to ensure they're registered
from app.db import base  # This ensures all models are loaded

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for generated resumes
generated_resumes_dir = Path("generated_resumes")
generated_resumes_dir.mkdir(exist_ok=True)  # Ensure directory exists
app.mount("/generated_resumes", StaticFiles(directory=str(generated_resumes_dir)), name="generated_resumes")

# Include API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "genai_provider": settings.GENAI_PROVIDER
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "genai": settings.GENAI_PROVIDER}

@app.on_event("startup")
async def startup_event():
    """Seed templates on startup if needed"""
    try:
        from app.db.seed_templates import seed_resume_templates
        await seed_resume_templates()
    except Exception as e:
        print(f"Template seeding info: {e}")

