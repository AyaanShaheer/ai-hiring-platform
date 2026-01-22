import api from '../config/api';
import type { Application, ApplicationCreate, ApplicationUpdate } from '../types';

export const applicationService = {
    async getApplications(): Promise<Application[]> {
        // Backend doesn't have a simple "get all applications" endpoint
        // We'll get applications for each job the recruiter has
        try {
            const response = await api.get<Application[]>('/applications/');
            return response.data;
        } catch (error) {
            // If that doesn't work, return empty array for now
            console.error('Failed to fetch applications:', error);
            return [];
        }
    },

    async getApplication(id: number): Promise<Application> {
        const response = await api.get<Application>(`/matching/applications/${id}`);
        return response.data;
    },

    async getJobMatches(jobId: number, minScore: number = 0): Promise<Application[]> {
        const response = await api.get<Application[]>(`/matching/job/${jobId}/matches`, {
            params: { min_score: minScore },
        });
        return response.data;
    },

    async createMatch(data: ApplicationCreate): Promise<Application> {
        const response = await api.post<Application>('/matching/match', data);
        return response.data;
    },

    async updateApplication(id: number, data: ApplicationUpdate): Promise<Application> {
        const response = await api.put<Application>(`/matching/applications/${id}`, data);
        return response.data;
    },

    async regenerateExplanation(id: number): Promise<Application> {
        const response = await api.post<Application>(`/matching/applications/${id}/explain`);
        return response.data;
    },

    async deleteApplication(id: number): Promise<void> {
        await api.delete(`/matching/applications/${id}`);
    },
};
