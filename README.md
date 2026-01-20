# 🎯 AI-Powered Hiring & Resume Intelligence Platform

A production-grade, end-to-end AI-powered hiring platform that helps recruiters match candidates to jobs using Machine Learning, NLP, and GenAI.

[![Python](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Features

### ✅ **Completed Features**

| Feature | Status | Description |
|---------|--------|-------------|
| 🔐 Authentication | ✅ Complete | JWT-based auth with RBAC (recruiter/candidate roles) |
| 📄 Resume Parsing | ✅ Complete | Upload PDF/DOCX with NLP extraction (skills, experience, education) |
| 💼 Job Management | ✅ Complete | CRUD operations with auto skill/experience extraction |
| 🤖 AI Matching | ✅ Complete | Multi-factor scoring (Skills 50%, Experience 30%, Semantic 20%) |
| 💡 GenAI Explanations | ✅ Complete | Groq-powered match explanations with strengths/weaknesses |
| 🚨 Fraud Detection | ✅ Complete | Resume inflation detection with AI analysis |
| ⚖️ Bias Detection | ✅ Complete | Fair hiring compliance with bias flagging |
| 🎯 Smart Recommendations | ✅ Complete | FAISS vector search for candidate suggestions |
| 📧 Personalized Outreach | ✅ Complete | AI-generated recruitment messages |
| 🔍 Semantic Search | ✅ Complete | Natural language candidate search |

### 🚧 **In Progress / Planned**
- 📧 Email Automation (Celery + SendGrid)
- 📊 Advanced Analytics Dashboard
- 🎓 Skill Gap Analysis
- 💳 Stripe Payment Integration
- 🖥️ Frontend Dashboard (Next.js)
- 🐳 Docker Containerization
- ☸️ Kubernetes Deployment

---

## 🛠️ Tech Stack

### **Backend**
- **Framework:** FastAPI (Python 3.12)
- **Database:** PostgreSQL 16 (Async SQLAlchemy)
- **ORM:** SQLAlchemy 2.0
- **Migrations:** Alembic
- **Authentication:** JWT (python-jose)

### **AI/ML Stack**
- **NLP:** spaCy, sentence-transformers
- **Vector Search:** FAISS (Facebook AI Similarity Search)
- **GenAI:** Groq / Google Gemini
- **Embeddings:** all-MiniLM-L6-v2 (384-dim)

### **Infrastructure**
- **Containerization:** Docker
- **Database:** PostgreSQL in Docker
- **Task Queue:** Celery + Redis (planned)
- **Deployment:** Kubernetes (planned)

---

## 📋 Prerequisites

- Python 3.11+
- PostgreSQL 16+ (or Docker)
- Redis (optional, for caching/tasks)
- Groq API Key or Google Gemini API Key

---

## 🚀 Quick Start

### **1. Clone Repository**

\`\`\`bash
git clone https://github.com/AyaanShaheer/ai-hiring-platform.git
cd ai-hiring-platform
\`\`\`

### **2. Backend Setup**

\`\`\`powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm
\`\`\`

### **3. Database Setup (Docker)**

\`\`\`bash
# Start PostgreSQL in Docker
docker run --name postgres-ai-hiring \\
  -e POSTGRES_USER=postgres \\
  -e POSTGRES_PASSWORD=postgres \\
  -e POSTGRES_DB=ai_hiring_platform \\
  -p 5432:5432 \\
  -d postgres:16-alpine
\`\`\`

### **4. Environment Configuration**

Create \`backend/.env\`:

\`\`\`env
# Application
APP_NAME=AI Hiring Platform
ENVIRONMENT=development
DEBUG=True

# API
API_V1_PREFIX=/api/v1
SECRET_KEY=your-secret-key-min-32-chars-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/ai_hiring_platform

# Redis (optional)
REDIS_URL=redis://localhost:6379/0

# GenAI - Choose one provider
GENAI_PROVIDER=groq
GROQ_API_KEY=your-groq-api-key-here

# Alternative: Google Gemini
# GENAI_PROVIDER=gemini
# GEMINI_API_KEY=your-gemini-api-key-here

# GenAI Settings
GENAI_TEMPERATURE=0.7
GENAI_MAX_TOKENS=1024
GROQ_MODEL=llama-3.1-70b-versatile
GEMINI_MODEL=gemini-pro

# File Upload
MAX_UPLOAD_SIZE_MB=10
ALLOWED_EXTENSIONS=.pdf,.docx

# Stripe (for future use)
STRIPE_SECRET_KEY=sk_test_dummy
STRIPE_PUBLISHABLE_KEY=pk_test_dummy
STRIPE_WEBHOOK_SECRET=whsec_dummy
\`\`\`

### **5. Run Database Migrations**

\`\`\`powershell
cd backend
alembic upgrade head
\`\`\`

### **6. Start Development Server**

\`\`\`powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
\`\`\`

Visit: [**http://localhost:8000/docs**](http://localhost:8000/docs) for interactive API documentation

---

## 📊 Database Schema

### **Users**
- Authentication & authorization
- Subscription tiers (Free, Pro, Enterprise)
- Monthly usage tracking

### **Jobs**
- Job postings with auto-parsed skills
- Experience requirements (min/max)
- Embedding vectors for semantic search

### **Resumes**
- Uploaded files (PDF/DOCX)
- NLP-extracted candidate information
- Skills, experience, education
- Fraud detection scores
- Embedding vectors

### **Applications**
- Candidate-job matches
- Multi-factor match scores
- AI-generated explanations
- Recruiter actions & notes

---

## 🧪 API Endpoints

### **Authentication**
- \`POST /api/v1/auth/register\` - Register new user
- \`POST /api/v1/auth/login\` - Login and get JWT token
- \`GET /api/v1/auth/me\` - Get current user info

### **Resumes**
- \`POST /api/v1/resumes/upload\` - Upload and parse resume
- \`GET /api/v1/resumes/\` - List all resumes
- \`GET /api/v1/resumes/{id}\` - Get resume details
- \`DELETE /api/v1/resumes/{id}\` - Delete resume

### **Jobs**
- \`POST /api/v1/jobs/\` - Create job posting
- \`GET /api/v1/jobs/\` - List all jobs
- \`GET /api/v1/jobs/{id}\` - Get job details
- \`PUT /api/v1/jobs/{id}\` - Update job
- \`DELETE /api/v1/jobs/{id}\` - Delete job

### **Matching**
- \`POST /api/v1/matching/match\` - Match resume to job
- \`GET /api/v1/matching/job/{job_id}/matches\` - Get ranked candidates
- \`GET /api/v1/matching/applications/{id}\` - Get application details
- \`PUT /api/v1/matching/applications/{id}\` - Update application status
- \`POST /api/v1/matching/applications/{id}/explain\` - Regenerate AI explanation

### **Fraud Detection**
- \`POST /api/v1/fraud/analyze/{resume_id}\` - Analyze resume for fraud
- \`GET /api/v1/fraud/resume/{resume_id}/fraud-score\` - Get fraud score

### **Bias Detection**
- \`POST /api/v1/bias/analyze-job/{job_id}\` - Analyze job for bias
- \`GET /api/v1/bias/job/{job_id}/fairness-report\` - Get fairness report

### **Recommendations**
- \`POST /api/v1/recommendations/job/{job_id}/recommend\` - Get AI candidate recommendations
- \`POST /api/v1/recommendations/job/{job_id}/outreach/{resume_id}\` - Generate outreach message
- \`GET /api/v1/recommendations/candidates/search\` - Semantic candidate search

---

## 🎯 AI Features Deep Dive

### **1. Multi-Factor Matching Algorithm**

\`\`\`
Overall Score = (Skill Match × 50%) + (Experience Match × 30%) + (Semantic Similarity × 20%)
\`\`\`

- **Skill Match:** Percentage of required skills present in resume
- **Experience Match:** Alignment with years of experience requirement
- **Semantic Similarity:** AI-based content similarity using sentence transformers

### **2. GenAI-Powered Explanations**

Using Groq's Llama 3.1 70B model to generate:
- Match explanations with strengths/weaknesses
- Missing skills identification
- Hiring recommendations (hire/interview/reject)
- Actionable insights for recruiters

### **3. Fraud Detection**

**Rule-Based Checks:**
- Skill inflation (too many skills for experience level)
- Title inflation (senior titles with junior experience)
- Unrealistic achievement claims (500%+ improvements)
- Buzzword spam detection

**AI Analysis:**
- Authenticity assessment
- Consistency verification
- Verification suggestions

### **4. Bias Detection**

**Protected Characteristics:**
- Age, gender, ethnicity, religion
- Disability, marital status, pregnancy

**Fair Hiring Compliance:**
- Job description bias analysis
- Scoring pattern analysis
- EEO law compliance recommendations

### **5. Smart Recommendations**

**FAISS Vector Search:**
- 384-dimensional embeddings using all-MiniLM-L6-v2
- Cosine similarity for semantic matching
- Top-K candidate retrieval in milliseconds

**AI-Generated Outreach:**
- Personalized recruitment messages
- Skill-specific mentions
- Professional yet friendly tone

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
│   │   │       │   ├── bias.py
│   │   │       │   ├── fraud.py
│   │   │       │   ├── jobs.py
│   │   │       │   ├── matching.py
│   │   │       │   ├── recommendations.py
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
│   │   │   ├── bias_detection_service.py
│   │   │   ├── fraud_detection_service.py
│   │   │   ├── genai_service.py
│   │   │   ├── job_parser.py
│   │   │   ├── matching_service.py
│   │   │   ├── recommendation_service.py
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
- User ownership validation
- SQL injection prevention (SQLAlchemy ORM)
- File upload validation
- Rate limiting (planned)

---

## 📈 Performance

- **Async/Await:** Non-blocking I/O with FastAPI
- **Vector Search:** Sub-millisecond similarity search with FAISS
- **Database:** Connection pooling with SQLAlchemy
- **Caching:** Redis for frequently accessed data (planned)

---

## 🧪 Testing

Coming soon:
- Unit tests with pytest
- Integration tests
- End-to-end tests
- Load testing

---

## 📝 API Documentation

Interactive API docs available at:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 🚀 Deployment

Coming soon:
- Docker Compose setup
- Kubernetes manifests
- CI/CD pipeline (GitHub Actions)
- Production deployment guide

---

## 🤝 Contributing

This is a portfolio/learning project. Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

Built as a production-grade portfolio project demonstrating:
- Full-stack development
- AI/ML integration
- Cloud-native architecture
- DevOps practices
- Modern software engineering

---

## 🎯 Roadmap

### **Phase 1: Core Backend** ✅ Completed
- [✅] Authentication & Authorization
- [✅] Resume Upload & Parsing
- [✅] Job Management
- [✅] AI-Powered Matching
- [✅] GenAI Explanations
- [✅] Fraud Detection
- [✅] Bias Detection
- [✅] Smart Recommendations

### **Phase 2: Advanced Features** 🚧 In Progress
- [ ] Email Automation (Celery + SendGrid)
- [ ] Advanced Analytics Dashboard
- [ ] Skill Gap Analysis
- [ ] Stripe Payment Integration

### **Phase 3: Frontend** 📅 Planned
- [ ] Next.js recruiter dashboard
- [ ] Resume upload interface
- [ ] Job posting UI
- [ ] Candidate ranking view
- [ ] Real-time notifications

### **Phase 4: Production** 📅 Planned
- [ ] Docker containerization
- [ ] Kubernetes deployment
- [ ] CI/CD pipelines
- [ ] Monitoring & logging
- [ ] Performance optimization

---

## 📊 Statistics

- **API Endpoints:** 35+
- **AI Services:** 7
- **Database Models:** 4
- **Lines of Code:** ~4000+
- **Features:** 10 major AI/ML features

---

## 🙏 Acknowledgments

- FastAPI for the excellent async framework
- Groq for powerful GenAI capabilities
- Sentence Transformers for semantic embeddings
- FAISS for efficient vector search
- PostgreSQL for robust data storage

---

## 📧 Contact

For questions or collaboration opportunities, please open an issue on GitHub.

**Built with ❤️ using FastAPI, PostgreSQL, AI/ML, and GenAI**
