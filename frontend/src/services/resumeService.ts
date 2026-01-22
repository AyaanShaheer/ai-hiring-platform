import api from '../config/api';
import type { Resume } from '../types';

export const resumeService = {
    async getResumes(): Promise<Resume[]> {
        const response = await api.get<Resume[]>('/resumes/');
        return response.data;
    },

    async getResume(id: number): Promise<Resume> {
        const response = await api.get<Resume>(`/resumes/${id}`);
        return response.data;
    },

    async uploadResume(file: File): Promise<Resume> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<Resume>('/resumes/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async deleteResume(id: number): Promise<void> {
        await api.delete(`/resumes/${id}`);
    },
};
