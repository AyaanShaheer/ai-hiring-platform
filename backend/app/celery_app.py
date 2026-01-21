from celery import Celery
from app.core.config import settings

# Force Redis broker URL format
broker_url = settings.CELERY_BROKER_URL
if not broker_url.startswith('redis://'):
    broker_url = 'redis://localhost:6379/0'

result_backend = settings.CELERY_RESULT_BACKEND
if not result_backend.startswith('redis://'):
    result_backend = 'redis://localhost:6379/0'

print(f"🔗 Celery Broker: {broker_url}")
print(f"🔗 Celery Backend: {result_backend}")

# Initialize Celery with explicit Redis configuration
celery_app = Celery(
    "ai_hiring_platform",
    broker=broker_url,
    backend=result_backend,
)

# Configure Celery to use Redis
celery_app.conf.update(
    # Core settings
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    # Task settings
    task_track_started=True,
    task_time_limit=300,
    task_soft_time_limit=240,
    
    # Redis-specific settings
    broker_connection_retry=True,
    broker_connection_retry_on_startup=True,
    broker_connection_max_retries=10,
    
    # Result backend settings
    result_backend=result_backend,
    result_expires=3600,
    
    # Task routing
    task_routes={
        'app.tasks.email_tasks.*': {'queue': 'emails'},
    },
    
    # Important: Force Redis transport
    broker_transport='redis',
    result_backend_transport_options={'master_name': 'mymaster'},
)

# Auto-discover tasks
celery_app.autodiscover_tasks(['app.tasks'])

print("✅ Celery configured successfully!")
