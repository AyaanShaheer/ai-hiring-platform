// Resume Builder Types

export type CountryCode = 'US' | 'UK' | 'DE' | 'FR' | 'NL' | 'EUROPASS';

export type TemplateType = 'chronological' | 'functional' | 'professional' | 'europass' | 'modern';

export interface Location {
    city: string;
    country: string;
}

export interface PersonalInfo {
    full_name: string;
    email: string;
    phone: string;
    location: Location;
    linkedin?: string;
    website?: string;
}

export interface WorkExperience {
    title: string;
    company: string;
    location: string;
    duration: string;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
    description?: string;
    responsibilities?: string[];
    achievements?: string[];
}

export interface Education {
    degree: string;
    institution: string;
    location: string;
    year: string;
    gpa?: string;
    honors?: string;
}

export interface Skills {
    technical: string[];
    soft: string[];
    tools: string[];
}

export interface Language {
    language: string;
    proficiency: 'Native' | 'Fluent' | 'Professional' | 'Basic';
}

export interface Certification {
    name: string;
    issuer: string;
    year: string;
    credential_id?: string;
}

export interface Project {
    title: string;
    description: string;
    technologies: string[];
    url?: string;
}

export interface ResumeTemplate {
    id: number;
    name: string;
    country: CountryCode;
    template_type: TemplateType;
    description: string;
    max_pages: number;
    requires_photo: boolean;
    is_active: boolean;
    created_at: string;
}

export interface Resume {
    id: number;
    user_id: number;
    template_id: number;
    personal_info: PersonalInfo;
    target_job_title: string;
    target_industry: string;
    target_country: CountryCode;
    professional_summary?: string;
    ai_optimized_summary?: string;
    work_experience: WorkExperience[];
    education: Education[];
    skills: Skills;
    languages: Language[];
    certifications: Certification[];
    projects: Project[];
    references: any[];
    version: number;
    pdf_url?: string;
    ats_score?: number;
    ai_suggestions?: string[];
    is_active: boolean;
    created_at: string;
    updated_at?: string;
    template?: ResumeTemplate;
}

export interface ResumeCreate {
    template_id: number;
    personal_info: PersonalInfo;
    target_job_title: string;
    target_industry: string;
    target_country: CountryCode;
    professional_summary?: string;
    work_experience: WorkExperience[];
    education: Education[];
    skills: Skills;
    languages?: Language[];
    certifications?: Certification[];
    projects?: Project[];
    references?: any[];
}

export interface ResumeUpdate {
    template_id?: number;
    personal_info?: PersonalInfo;
    target_job_title?: string;
    target_industry?: string;
    target_country?: CountryCode;
    professional_summary?: string;
    work_experience?: WorkExperience[];
    education?: Education[];
    skills?: Skills;
    languages?: Language[];
    certifications?: Certification[];
    projects?: Project[];
    references?: any[];
}

export interface OptimizeRequest {
    resume_id: number;
    optimize_summary?: boolean;
    optimize_experience?: boolean;
    suggest_skills?: boolean;
}

export interface ATSScoreResponse {
    score: number;
    feedback: string[];
    strengths: string[];
    weaknesses: string[];
}

export interface ResumeListResponse {
    items: Resume[];
    total: number;
    skip: number;
    limit: number;
}
