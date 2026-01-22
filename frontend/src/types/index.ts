// User types
export interface User {
    id: number;
    email: string;
    full_name: string;
    company_name?: string;
    role: 'admin' | 'recruiter' | 'viewer';
    subscription_tier: 'free' | 'pro' | 'enterprise';
    is_active: boolean;
    is_verified: boolean;
    resumes_processed_this_month: number;
    jobs_created_this_month: number;
    created_at: string;
    updated_at?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    full_name: string;
    company_name?: string;
    role?: 'recruiter' | 'viewer';
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user: User;
}

// Job types
export interface Job {
    id: number;
    recruiter_id: number;
    title: string;
    company: string;
    description: string;
    requirements: string;
    location: string;
    required_skills: string[];
    experience_years_min?: number;
    experience_years_max?: number;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
}

export interface JobCreate {
    title: string;
    company: string;
    description: string;
    requirements: string;
    location: string;
    job_type?: string;
    experience_level?: string;
    min_experience_years?: number;
    max_experience_years?: number;
    salary_min?: number;
    salary_max?: number;
    required_skills?: string[];
    preferred_skills?: string[];
    benefits?: string[];
}


export interface JobUpdate {
    title?: string;
    company?: string;
    description?: string;
    requirements?: string;
    location?: string;
    is_active?: boolean;
}

// Resume types
export interface Resume {
    id: number;
    uploader_id: number;
    filename: string;
    file_path: string;
    file_size_kb: number;
    raw_text?: string;
    candidate_name?: string;
    candidate_email?: string;
    candidate_phone?: string;
    skills: string[];
    experience_years?: number;
    education?: string[];
    processing_status: 'pending' | 'completed' | 'failed';
    fraud_score?: number;
    created_at: string;
    updated_at?: string;
}

// Application types
export interface Application {
    id: number;
    job_id: number;
    resume_id: number;
    match_score: number; // Backend uses match_score, not overall_score
    skill_match_score: number;
    experience_match_score: number;
    semantic_similarity_score: number;
    explanation?: string; // Backend uses explanation, not ai_explanation
    strengths?: string[];
    weaknesses?: string[];
    bias_flags?: string[];
    recruiter_status: 'pending' | 'shortlisted' | 'rejected' | 'interviewing' | 'hired'; // Backend uses recruiter_status
    recruiter_notes?: string;
    recruiter_override_score?: number;
    created_at: string;
    updated_at?: string;
    // Flat fields returned by backend
    job_title?: string;
    candidate_name?: string;
    candidate_email?: string;
    // Nested objects (for backwards compatibility)
    job?: Job;
    resume?: Resume;
    // Computed properties for backwards compatibility
    overall_score?: number; // Alias for match_score
    ai_explanation?: string; // Alias for explanation
    ai_recommendation?: 'hire' | 'interview' | 'reject';
    status?: string; // Alias for recruiter_status
}

export interface ApplicationCreate {
    job_id: number;
    resume_id: number;
}

export interface ApplicationUpdate {
    recruiter_status?: 'pending' | 'shortlisted' | 'rejected' | 'interviewing' | 'hired';
    recruiter_notes?: string;
}

// Interview types
export interface Interview {
    id: number;
    application_id: number;
    recruiter_id: number;
    scheduled_at: string;
    interview_type: 'phone' | 'video' | 'in-person' | 'technical';
    status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
    meeting_link?: string;
    notes?: string;
    rating?: number;
    recording_path?: string;
    transcript?: string;
    ai_analysis?: string;
    created_at: string;
    updated_at?: string;
    application?: Application;
}

export interface InterviewScheduleRequest {
    application_id: number;
    scheduled_at: string;
    interview_type: 'phone' | 'video' | 'in-person' | 'technical';
    meeting_link?: string;
    notes?: string;
}

export interface InterviewUpdate {
    scheduled_at?: string;
    interview_type?: 'phone' | 'video' | 'in-person' | 'technical';
    meeting_link?: string;
    notes?: string;
    status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
}

// Analytics types
export interface DashboardMetrics {
    total_jobs: number;
    active_jobs: number;
    total_resumes: number;
    total_applications: number;
    average_match_score: number;
    total_interviews: number;
    upcoming_interviews: number;
}

export interface JobAnalytics {
    job_id: number;
    total_applications: number;
    average_match_score: number;
    top_candidates: Application[];
    skills_distribution: Record<string, number>;
}

export interface SkillsAnalytics {
    skill_name: string;
    demand_count: number;
    supply_count: number;
    gap: number;
}

export interface TrendData {
    date: string;
    applications: number;
    jobs: number;
    interviews: number;
}

// API Response types
export interface ApiError {
    detail: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    skip: number;
    limit: number;
}
