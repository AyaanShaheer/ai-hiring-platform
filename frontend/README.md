# AI Hiring Platform - Frontend

## Quick Start

### Prerequisites
- Node.js 20.11.1+ installed
- Backend running on `http://localhost:8000`
- PostgreSQL and Redis containers running

### Installation
```bash
cd d:/ai_hiring_platform/frontend
npm install
```

### Development
```bash
npm run dev
```
Visit: **http://localhost:3000**

### Build for Production
```bash
npm run build
```

## Features

✅ **Authentication**
- Login/Register with JWT tokens
- Protected routes
- Auto redirect on token expiry

✅ **Dashboard**
- Metrics cards (jobs, resumes, applications, match score)
- Quick action buttons
- Upcoming interviews widget

✅ **Job Management**
- Job listing with filters
- Create job form (full details)
- Job cards with skills and status badges

✅ **Resume Management**
- Resume listing with candidate info
- Drag-and-drop upload
- Skills display and fraud warnings

✅ **Applications**
- Candidate matches with AI scores
- Match score breakdowns
- AI recommendations

✅ **Analytics & Interviews**
- Placeholder pages (ready for integration)

## Tech Stack
- Vite 5.4.11
- React 18
- TypeScript
- TailwindCSS 3.4.1
- React Query
- React Router v6
- Axios

## Environment Variables
Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

## API Integration
All API calls go through service layers in `src/services/`. JWT tokens are automatically attached via Axios interceptors.

## Design
- Glassmorphism UI with CITEON branding
- Cyan/blue gradient color scheme
- Smooth animations and transitions
- Fully responsive

## Next Steps
- Add detail pages (job detail, resume detail, application detail)
- Build analytics charts
- Add interview calendar
- Implement search/filters
- Add toast notifications
