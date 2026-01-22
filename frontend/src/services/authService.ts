import api from '../config/api';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '../types';

export const authService = {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    async getCurrentUser(): Promise<User> {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout');
    },

    setToken(token: string): void {
        localStorage.setItem('access_token', token);
    },

    getToken(): string | null {
        return localStorage.getItem('access_token');
    },

    removeToken(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
    },
};
