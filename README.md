# 🎯 AI-Powered Hiring & Resume Intelligence Platform

A production-grade, end-to-end AI-powered hiring platform that helps recruiters match candidates to jobs using Machine Learning, NLP, and GenAI.

## 🌟 Features Implemented

### ✅ Core Features (Completed)
- **User Authentication** - JWT-based authentication with role-based access control (RBAC)
- **Resume Upload & Parsing** - Upload PDF/DOCX resumes with automatic NLP-based parsing
  - Extract name, email, phone, skills, experience, education
  - Skill detection using keyword matching
  - Experience calculation from resume text
- **Job Posting Management** - Create, update, delete job postings with auto-parsing
  - Automatic skill extraction from job descriptions
  - Experience requirement detection
- **AI-Powered Candidate Matching** - Multi-factor scoring algorithm
  - Skill match (50% weight)
  - Experience match (30% weight)
  - Semantic similarity using sentence transformers (20% weight)
- **Application Management** - Track candidate applications with recruiter actions
  - Shortlist/reject candidates
  - Add recruiter notes
  - Override match scores

### 🚧 Planned Features (Next Phase)
- Frontend (Next.js + React)
- GenAI Explanations (Groq/Gemini integration)
- Resume Fraud Detection
- Bias-Aware Scoring
- Stripe Payment Integration
- Email Notifications
- Kubernetes Deployment on Azure/CentOS

---

## 🛠️ Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.12)
- **Database:** PostgreSQL 16
- **ORM:** SQLAlchemy 2.0 (Async)
- **Migrations:** Alembic
- **Authentication:** JWT (python-jose)
- **ML/NLP:** spaCy, sentence-transformers
- **GenAI:** Groq / Google Gemini
- **Caching:** Redis

### Infrastructure
- **Containerization:** Docker
- **Database:** PostgreSQL in Docker
- **Deployment:** (Planned) Kubernetes on CentOS 9

---

## 📋 Prerequisites

- Python 3.11+
- PostgreSQL 16+ (or Docker)
- Redis (optional, for caching)
- Node.js 20+ (for frontend, future)

---

## 🚀 Quick Start

### 1. Clone Repository

\`\`\`bash
git clone https://github.com/YOUR_USERNAME/ai-hiring-platform.git
cd ai-hiring-platform
\`\`\`

### 2. Backend Setup

\`\`\`powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm
\`\`\`

### 3. Database Setup (Docker)

\`\`\`powershell
# Start PostgreSQL in Docker
docker run --name postgres-ai-hiring \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ai_hiring_platform \
  -p 5432:5432 \
  -d postgres:16-alpine
\`\`\`

### 4. Environment Configuration

Create \`backend/.env\`:

\`\`\`env
# Application
APP_NAME=AI Hiring Platform
ENVIRONMENT=development
DEBUG=True

# API
API_V1_PREFIX=/api/v1
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/ai_hiring_platform

# Redis
REDIS_URL=redis://localhost:6379/0

# GenAI (choose one)
GENAI_PROVIDER=groq
GROQ_API_KEY=your-groq-api-key
# or
# GENAI_PROVIDER=gemini
# GEMINI_API_KEY=your-gemini-api-key

# Stripe (for future use)
STRIPE_SECRET_KEY=sk_test_dummy
STRIPE_PUBLISHABLE_KEY=pk_test_dummy
STRIPE_WEBHOOK_SECRET=whsec_dummy
\`\`\`

### 5. Run Migrations

\`\`\`powershell
cd backend
alembic upgrade head
\`\`\`

### 6. Start Server

\`\`\`powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

Visit: [**http://localhost:8000/docs**](http://localhost:8000/docs) for API documentation

---

## 📊 Database Schema

### Users
- Authentication & authorization
- Subscription tiers (Free, Pro, Enterprise)
- Usage tracking

### Jobs
- Job postings with auto-parsed skills
- Experience requirements
- Location & company info

### Resumes
- Uploaded files (PDF/DOCX)
- Parsed candidate information
- Skills, experience, education
- Fraud detection scores (future)

### Applications
- Candidate-job matches
- Multi-factor match scores
- Recruiter actions & notes

---

## 🧪 API Endpoints

### Authentication
- \`POST /api/v1/auth/register\` - Register new user
- \`POST /api/v1/auth/login\` - Login and get JWT token
- \`GET /api/v1/auth/me\` - Get current user info

### Resumes
- \`POST /api/v1/resumes/upload\` - Upload and parse resume
- \`GET /api/v1/resumes/\` - List all resumes
- \`GET /api/v1/resumes/{id}\` - Get resume details
- \`DELETE /api/v1/resumes/{id}\` - Delete resume

### Jobs
- \`POST /api/v1/jobs/\` - Create job posting
- \`GET /api/v1/jobs/\` - List all jobs
- \`GET /api/v1/jobs/{id}\` - Get job details
- \`PUT /api/v1/jobs/{id}\` - Update job
- \`DELETE /api/v1/jobs/{id}\` - Delete job

### Matching
- \`POST /api/v1/matching/match\` - Match resume to job
- \`GET /api/v1/matching/job/{job_id}/matches\` - Get ranked candidates for job
- \`GET /api/v1/matching/applications/{id}\` - Get application details
- \`PUT /api/v1/matching/applications/{id}\` - Update application status

---

## 🎯 Matching Algorithm

The AI matching system uses a weighted scoring approach:

\`\`\`
Overall Score = (Skill Match × 50%) + (Experience Match × 30%) + (Semantic Similarity × 20%)
\`\`\`

- **Skill Match:** Percentage of required skills present in resume
- **Experience Match:** Alignment with years of experience requirement
- **Semantic Similarity:** AI-based content similarity using sentence transformers

---

## 📁 Project Structure

\`\`\`
ai-hiring-platform/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       │   ├── auth.py
│   │   │       │   ├── jobs.py
│   │   │       │   ├── matching.py
│   │   │       │   └── resume.py
│   │   │       └── api.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── db/
│   │   │   ├── base.py
│   │   │   ├── base_class.py
│   │   │   └── session.py
│   │   ├── models/
│   │   │   ├── application.py
│   │   │   ├── job.py
│   │   │   ├── resume.py
│   │   │   └── user.py
│   │   ├── schemas/
│   │   │   ├── application.py
│   │   │   ├── job.py
│   │   │   ├── resume.py
│   │   │   └── user.py
│   │   ├── services/
│   │   │   ├── genai_service.py
│   │   │   ├── job_parser.py
│   │   │   ├── matching_service.py
│   │   │   ├── resume_parser.py
│   │   │   └── user_service.py
│   │   └── main.py
│   ├── alembic/
│   ├── uploads/
│   ├── .env
│   ├── requirements.txt
│   └── alembic.ini
├── frontend/ (coming soon)
├── .gitignore
└── README.md
\`\`\`

---

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- User ownership validation for all resources
- Rate limiting (planned)
- SQL injection prevention (SQLAlchemy ORM)

---

## 🤝 Contributing

This is a learning/portfolio project. Contributions, issues, and feature requests are welcome!

---

## 📝 License

MIT License - feel free to use this project for learning or portfolio purposes.

---

## 👨‍💻 Author

Built as a production-grade portfolio project demonstrating:
- Full-stack development
- AI/ML integration
- Cloud-native architecture
- DevOps practices

---

## 🚀 Roadmap

### Phase 1: Core Backend ✅ (Completed)
- [x] Authentication & Authorization
- [x] Resume Upload & Parsing
- [x] Job Management
- [x] AI-Powered Matching

### Phase 2: AI/ML Enhancements (Next)
- [ ] GenAI Explanations for matches
- [ ] Resume fraud detection
- [ ] Bias-aware scoring
- [ ] Advanced NLP features

### Phase 3: Frontend
- [ ] Next.js recruiter dashboard
- [ ] Resume upload interface
- [ ] Job posting UI
- [ ] Candidate ranking view

### Phase 4: Production Features
- [ ] Stripe payment integration
- [ ] Email notifications
- [ ] Multi-tenancy
- [ ] Analytics dashboard

### Phase 5: Deployment
- [ ] Docker containerization
- [ ] Kubernetes manifests
- [ ] CI/CD pipelines
- [ ] Azure/AWS deployment

---

## 📧 Contact

For questions or collaboration opportunities, please open an issue.

**Built with ❤️ using FastAPI, PostgreSQL, and AI/ML**
