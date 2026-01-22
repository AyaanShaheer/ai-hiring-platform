import api from '../config/api';
import type { DashboardMetrics, JobAnalytics, SkillsAnalytics, TrendData } from '../types';

export const analyticsService = {
    async getDashboardMetrics(days: number = 30): Promise<DashboardMetrics> {
        const response = await api.get<DashboardMetrics>('/analytics/dashboard', {
            params: { days },
        });
        return response.data;
    },

    async getJobAnalytics(jobId: number): Promise<JobAnalytics> {
        const response = await api.get<JobAnalytics>(`/analytics/job/${jobId}`);
        return response.data;
    },

    async getSkillsAnalytics(): Promise<SkillsAnalytics[]> {
        const response = await api.get<SkillsAnalytics[]>('/analytics/skills');
        return response.data;
    },

    async getTrends(days: number = 30): Promise<TrendData[]> {
        const response = await api.get<TrendData[]>('/analytics/trends', {
            params: { days },
        });
        return response.data;
    },

    async exportData(exportType: 'jobs' | 'resumes' | 'applications'): Promise<Blob> {
        const response = await api.get(`/analytics/export/${exportType}`, {
            responseType: 'blob',
        });
        return response.data;
    },
};
