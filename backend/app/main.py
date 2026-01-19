from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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
