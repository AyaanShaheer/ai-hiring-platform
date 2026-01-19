# Import all models here so they are registered with SQLAlchemy
from app.db.base_class import Base
from app.models.user import User
from app.models.job import Job
from app.models.resume import Resume
from app.models.application import Application

# This ensures all models are imported and relationships can be resolved
__all__ = ["Base", "User", "Job", "Resume", "Application"]
