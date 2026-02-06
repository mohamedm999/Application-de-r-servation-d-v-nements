import api from './axios';
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types';

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  me: () => api.get<User>('/auth/me').then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', { refreshToken }).then((r) => r.data),

  logout: () => {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    return api.post('/auth/logout', refreshToken ? { refreshToken } : {}).then((r) => r.data);
  },
};
