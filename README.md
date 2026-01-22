# 🎯 AI Hiring Platform

A complete AI-powered hiring and recruitment platform built with FastAPI (Backend) and React + TypeScript + Vite (Frontend). Features intelligent candidate-job matching, resume parsing, fraud detection, and interview management.

![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue.svg)

## ✨ Features

### 🤖 AI-Powered Matching
- **Intelligent Resume Parsing**: Automatically extract candidate information, skills, experience from PDF/DOCX resumes
- **Smart Job-Candidate Matching**: Multi-dimensional matching algorithm considering:
  - Skill match scoring
  - Experience level alignment
  - Semantic similarity using sentence transformers
  - Overall compatibility scoring (0-100%)
- **AI Explanations**: Generate detailed explanations for match scores using Google Gemini

### 🛡️ Fraud Detection
- **Resume Inflation Detection**: Identify exaggerated claims and inconsistencies
- **Bias Flag Detection**: Flag potentially biased or discriminatory content
- **Risk Scoring**: Automated fraud risk assessment

### 📊 Analytics & Insights
- **Recruiter Dashboard**: Real-time metrics and KPIs
- **Job Performance Analytics**: Track application quality per job
- **Skills Analytics**: Identify skill gaps and demand trends
- **Time-series Trends**: Visualize hiring activity over time
- **AI-Generated Insights**: Actionable recommendations

### 🎤 Interview Management
- **Interview Scheduling**: Manage phone, video, in-person, and technical interviews
- **AI Interview Analysis**: Automated analysis of video interviews (coming soon)
- **Recording Storage**: Secure video/audio storage
- **Interview Feedback**: Structured feedback and scoring

### 💼 Complete Recruitment Workflow
- Job creation and management
- Resume upload and processing
- Application tracking with status updates
- Interview scheduling and management
- Recruiter notes and override scoring
- Export capabilities (CSV)

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI (async/await)
- **Database**: PostgreSQL with asyncpg
- **ORM**: SQLAlchemy 2.0 (async)
- **AI/ML**:
  - Google Gemini 2.0 Flash (via LangChain)
  - Sentence Transformers (all-MiniLM-L6-v2)
  - spaCy (NLP)
- **Task Queue**: Celery + Redis
- **File Processing**: PyPDF2, python-docx
- **Authentication**: JWT tokens
- **API Docs**: Swagger/OpenAPI

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: TailwindCSS 3.4
- **Routing**: React Router v6
- **HTTP**: Axios
- **UI**: Custom glassmorphism components
- **Icons**: Lucide React

## 📦 Project Structure

```
ai_hiring_platform/
├── backend/
│   ├── app/
│   │   ├── api/          # API routes & endpoints
│   │   ├── models/       # SQLAlchemy models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   ├── db/           # Database configuration
│   │   └── core/         # Config, security
│   ├── alembic/          # Database migrations
│   ├── uploads/          # Resume file storage
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   └── config/       # Configuration
│   ├── public/           # Static assets
│   └── package.json
│
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 16+
- Redis 7+ (for Celery tasks)
- Google Gemini API key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai-hiring-platform.git
cd ai-hiring-platform
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Create .env file
cp .env.example .env
# Edit .env with your configuration:
# - DATABASE_URL
# - GOOGLE_API_KEY
# - JWT_SECRET_KEY
# - REDIS_URL

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Start Celery Worker (Optional, for background tasks)

```bash
cd backend
celery -A app.celery_app worker --loglevel=info -P solo
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 📚 API Documentation

### Key Endpoints

#### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get current user

#### Jobs
- `GET /api/v1/jobs` - List all jobs
- `POST /api/v1/jobs` - Create job
- `GET /api/v1/jobs/{id}` - Get job details
- `PUT /api/v1/jobs/{id}` - Update job

#### Resumes
- `POST /api/v1/resumes/upload` - Upload resume
- `GET /api/v1/resumes` - List resumes
- `GET /api/v1/resumes/{id}` - Get resume details

#### Matching
- `POST /api/v1/matching/match` - Create job-candidate match
- `GET /api/v1/matching/job/{job_id}/matches` - Get matches for a job
- `GET /api/v1/matching/applications/{id}` - Get application details
- `PUT /api/v1/matching/applications/{id}` - Update application status

#### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard metrics
- `GET /api/v1/analytics/job/{id}` - Job analytics
- `GET /api/v1/analytics/skills` - Skills analytics

## 🔐 Environment Variables

### Backend (.env)
```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/ai_hiring

# AI Services
GOOGLE_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_key  # Optional

# Security
JWT_SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis (for Celery)
REDIS_URL=redis://localhost:6379/0

# File Upload
MAX_UPLOAD_SIZE_MB=5
UPLOAD_FOLDER=uploads

# CORS
CORS_ORIGINS=http://localhost:3000
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## 🐳 Docker Deployment (Optional)

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 📝 Database Schema

### Core Models
- **User**: Recruiters and admins
- **Job**: Job postings with requirements
- **Resume**: Candidate resumes with parsed data
- **Application**: Job-candidate matches with scores
- **Interview**: Interview scheduling and management

### Relationships
- User → Jobs (1:many)
- User → Resumes (1:many)
- Job + Resume → Application (many:many)
- Application → Interview (1:many)

## 🛣️ Roadmap

- [x] AI-powered resume parsing
- [x] Intelligent job-candidate matching
- [x] Fraud detection
- [x] Interview management
- [x] Analytics dashboard
- [ ] Video interview analysis (AI)
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Advanced scheduling (calendar integration)
- [ ] Candidate portal
- [ ] ATS integrations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - Initial work

## 🙏 Acknowledgments

- FastAPI for the excellent web framework
- Google Gemini for AI capabilities
- Hugging Face for transformer models
- React team for the frontend framework

## 📞 Support

For support, email support@example.com or create an issue in the repository.

---

⭐ Star this repo if you find it helpful!
