import api from '../config/api';
import type { Job, JobCreate, JobUpdate } from '../types';

export const jobService = {
    async getJobs(activeOnly: boolean = true): Promise<Job[]> {
        const response = await api.get<Job[]>('/jobs/', {
            params: { active_only: activeOnly },
        });
        return response.data;
    },

    async getJob(id: number): Promise<Job> {
        const response = await api.get<Job>(`/jobs/${id}`);
        return response.data;
    },

    async createJob(data: JobCreate): Promise<Job> {
        const response = await api.post<Job>('/jobs/', data);
        return response.data;
    },

    async updateJob(id: number, data: JobUpdate): Promise<Job> {
        const response = await api.put<Job>(`/jobs/${id}`, data);
        return response.data;
    },

    async deleteJob(id: number): Promise<void> {
        await api.delete(`/jobs/${id}`);
    },

    async deactivateJob(id: number): Promise<Job> {
        const response = await api.post<Job>(`/jobs/${id}/deactivate`);
        return response.data;
    },
};
