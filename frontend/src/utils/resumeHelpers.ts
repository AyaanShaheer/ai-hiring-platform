import type { CountryCode } from '../types/resume';

// Country code to emoji flag mapping
export const getCountryFlag = (countryCode: CountryCode | string): string => {
    const flags: Record<string, string> = {
        'US': '🇺🇸',
        'UK': '🇬🇧',
        'DE': '🇩🇪',
        'FR': '🇫🇷',
        'NL': '🇳🇱',
        'EUROPASS': '🇪🇺',
    };
    return flags[countryCode] || '🌐';
};

// Get Tailwind color classes based on ATS score
export const getATSScoreColor = (score: number): string => {
    if (score >= 70) return 'text-green-600 bg-green-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
};

// Get stroke color for ATS circle
export const getATSStrokeColor = (score: number): string => {
    if (score >= 70) return '#10b981'; // green-500
    if (score >= 40) return '#f59e0b'; // yellow-500
    return '#ef4444'; // red-500
};

// Format date for resume display (e.g., "Jan 2020" or "2020-01")
export const formatResumeDate = (date: string | null, isCurrent?: boolean): string => {
    if (isCurrent) return 'Present';
    if (!date) return '';

    // Try to parse and format as "Mon YYYY"
    try {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
            const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short' };
            return dateObj.toLocaleDateString('en-US', options);
        }
    } catch {
        // If parsing fails, return as-is
    }

    return date;
};

// Validate email format
export const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate URL format
export const validateURL = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

// Get proficiency level color badge classes
export const getProficiencyColor = (proficiency: string): string => {
    const colors: Record<string, string> = {
        'Native': 'bg-green-100 text-green-700',
        'Fluent': 'bg-blue-100 text-blue-700',
        'Professional': 'bg-purple-100 text-purple-700',
        'Basic': 'bg-gray-100 text-gray-700',
    };
    return colors[proficiency] || 'bg-gray-100 text-gray-700';
};

// Calculate completion percentage for resume
export const calculateResumeCompletion = (resume: Partial<any>): number => {
    const checks = [
        resume.personal_info?.full_name,
        resume.personal_info?.email,
        resume.target_job_title,
        resume.work_experience && resume.work_experience.length > 0,
        resume.education && resume.education.length > 0,
        resume.skills && (
            resume.skills.technical?.length > 0 ||
            resume.skills.soft?.length > 0 ||
            resume.skills.tools?.length > 0
        ),
        resume.professional_summary,
    ];

    const completed = checks.filter(Boolean).length;
    return Math.round((completed / checks.length) * 100);
};
