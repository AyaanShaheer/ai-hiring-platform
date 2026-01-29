import api from '../config/api';
import type {
    ResumeTemplate,
    Resume,
    ResumeCreate,
    ResumeUpdate,
    OptimizeRequest,
    ATSScoreResponse,
    ResumeListResponse
} from '../types/resume';

const BASE_PATH = '/resume-builder';

export const resumeBuilderService = {
    // Get all templates
    getTemplates: async (country?: string, templateType?: string): Promise<ResumeTemplate[]> => {
        const params = new URLSearchParams();
        if (country) params.append('country', country);
        if (templateType) params.append('template_type', templateType);

        const response = await api.get(`${BASE_PATH}/templates${params.toString() ? `?${params.toString()}` : ''}`);
        return response.data;
    },

    // Get specific template
    getTemplate: async (id: number): Promise<ResumeTemplate> => {
        const response = await api.get(`${BASE_PATH}/templates/${id}`);
        return response.data;
    },

    // Create new resume
    createResume: async (data: ResumeCreate): Promise<Resume> => {
        const response = await api.post(`${BASE_PATH}/`, data);
        return response.data;
    },

    // Get user's resumes
    getResumes: async (skip = 0, limit = 20): Promise<ResumeListResponse> => {
        const response = await api.get(`${BASE_PATH}/?skip=${skip}&limit=${limit}`);
        return response.data;
    },

    // Get specific resume
    getResume: async (id: number): Promise<Resume> => {
        const response = await api.get(`${BASE_PATH}/${id}`);
        return response.data;
    },

    // Update resume
    updateResume: async (id: number, data: ResumeUpdate): Promise<Resume> => {
        const response = await api.put(`${BASE_PATH}/${id}`, data);
        return response.data;
    },

    // AI optimize resume
    optimizeResume: async (id: number, options: OptimizeRequest): Promise<Resume> => {
        const response = await api.post(`${BASE_PATH}/${id}/optimize`, options);
        return response.data;
    },

    // Get ATS score
    getATSScore: async (id: number): Promise<ATSScoreResponse> => {
        const response = await api.get(`${BASE_PATH}/${id}/ats-score`);
        return response.data;
    },

    // Regenerate PDF
    regeneratePDF: async (id: number): Promise<{ message: string; task_id?: string }> => {
        const response = await api.post(`${BASE_PATH}/${id}/regenerate-pdf`);
        return response.data;
    },

    // Delete resume
    deleteResume: async (id: number): Promise<void> => {
        await api.delete(`${BASE_PATH}/${id}`);
    },
};
