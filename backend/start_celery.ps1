# Start Celery Worker
Write-Host "Starting Celery Worker..." -ForegroundColor Green

# Activate virtual environment
.\venv\Scripts\activate

# Start Celery worker
celery -A app.celery_app worker --loglevel=info --pool=solo
