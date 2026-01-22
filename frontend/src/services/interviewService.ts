import api from '../config/api';
import type { Interview, InterviewScheduleRequest, InterviewUpdate } from '../types';

export const interviewService = {
    async getInterviews(statusFilter?: string, interviewType?: string): Promise<Interview[]> {
        const response = await api.get<Interview[]>('/interviews/', {
            params: { status_filter: statusFilter, interview_type: interviewType },
        });
        return response.data;
    },

    async getInterview(id: number): Promise<Interview> {
        const response = await api.get<Interview>(`/interviews/${id}`);
        return response.data;
    },

    async getUpcomingInterviews(days: number = 7): Promise<Interview[]> {
        const response = await api.get<Interview[]>('/interviews/upcoming', {
            params: { days },
        });
        return response.data;
    },

    async scheduleInterview(data: InterviewScheduleRequest): Promise<Interview> {
        const response = await api.post<Interview>('/interviews/schedule', data);
        return response.data;
    },

    async updateInterview(id: number, data: InterviewUpdate): Promise<Interview> {
        const response = await api.put<Interview>(`/interviews/${id}`, data);
        return response.data;
    },

    async completeInterview(id: number, notes?: string, rating?: number): Promise<Interview> {
        const response = await api.post<Interview>(`/interviews/${id}/complete`, null, {
            params: { notes, rating },
        });
        return response.data;
    },

    async cancelInterview(id: number): Promise<Interview> {
        const response = await api.post<Interview>(`/interviews/${id}/cancel`);
        return response.data;
    },

    async uploadRecording(id: number, file: File): Promise<Interview> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<Interview>(`/interviews/${id}/upload-recording`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async getTranscript(id: number): Promise<{ transcript: string }> {
        const response = await api.get<{ transcript: string }>(`/interviews/${id}/transcript`);
        return response.data;
    },

    async analyzeInterview(id: number): Promise<Interview> {
        const response = await api.post<Interview>(`/interviews/${id}/analyze`);
        return response.data;
    },
};
