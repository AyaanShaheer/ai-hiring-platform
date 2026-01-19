from pydantic_settings import BaseSettings
from typing import Optional, Literal
from pathlib import Path


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "AI Hiring Platform"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    
    # Redis
    REDIS_URL: str
    
    # GenAI Provider Selection
    GENAI_PROVIDER: Literal["gemini", "groq"] = "gemini"
    
    # Gemini Configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-pro"
    
    # Groq Configuration
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.1-70b-versatile"
    
    # GenAI Settings
    GENAI_TEMPERATURE: float = 0.3
    GENAI_MAX_TOKENS: int = 1000
    
    # Stripe
    STRIPE_SECRET_KEY: str
    STRIPE_PUBLISHABLE_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    
    # File Upload
    UPLOAD_DIR: str = "uploads/resumes"
    TEMP_DIR: str = "uploads/temp"
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: str = ".pdf,.docx"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    @property
    def allowed_extensions_list(self) -> list[str]:
        """Parse ALLOWED_EXTENSIONS string into list"""
        return [ext.strip() for ext in self.ALLOWED_EXTENSIONS.split(",")]
    
    @property
    def max_upload_size_bytes(self) -> int:
        """Convert MB to bytes"""
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    
    @property
    def upload_dir_path(self) -> Path:
        """Get upload directory as Path object"""
        return Path(self.UPLOAD_DIR)
    
    @property
    def temp_dir_path(self) -> Path:
        """Get temp directory as Path object"""
        return Path(self.TEMP_DIR)
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

# Ensure upload directories exist
settings.upload_dir_path.mkdir(parents=True, exist_ok=True)
settings.temp_dir_path.mkdir(parents=True, exist_ok=True)
