export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const SUBSCRIPTION_LIMITS = {
    free: {
        resumes_per_month: 10,
        jobs_per_month: 3,
    },
    pro: {
        resumes_per_month: 100,
        jobs_per_month: 20,
    },
    enterprise: {
        resumes_per_month: -1, // unlimited
        jobs_per_month: -1, // unlimited
    },
};

export const APPLICATION_STATUSES = {
    pending: { label: 'Pending', color: 'gray' },
    shortlisted: { label: 'Shortlisted', color: 'blue' },
    rejected: { label: 'Rejected', color: 'red' },
    interviewing: { label: 'Interviewing', color: 'yellow' },
    hired: { label: 'Hired', color: 'green' },
} as const;

export const INTERVIEW_TYPES = {
    phone: { label: 'Phone', icon: 'Phone' },
    video: { label: 'Video', icon: 'Video' },
    'in-person': { label: 'In-Person', icon: 'Users' },
    technical: { label: 'Technical', icon: 'Code' },
} as const;

export const INTERVIEW_STATUSES = {
    scheduled: { label: 'Scheduled', color: 'blue' },
    completed: { label: 'Completed', color: 'green' },
    cancelled: { label: 'Cancelled', color: 'red' },
    'no-show': { label: 'No Show', color: 'orange' },
} as const;

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    JOBS: '/jobs',
    JOB_DETAIL: '/jobs/:id',
    CREATE_JOB: '/jobs/new',
    RESUMES: '/resumes',
    RESUME_DETAIL: '/resumes/:id',
    UPLOAD_RESUME: '/resumes/upload',
    APPLICATIONS: '/applications',
    APPLICATION_DETAIL: '/applications/:id',
    ANALYTICS: '/analytics',
    INTERVIEWS: '/interviews',
    INTERVIEW_DETAIL: '/interviews/:id',
    SCHEDULE_INTERVIEW: '/interviews/schedule',
    PROFILE: '/profile',
} as const;
