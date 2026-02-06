import api from './axios';
import type { User, UserRole } from '@/types';

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

export const usersApi = {
  findAll: () =>
    api.get<User[]>('/users').then((r) => r.data),

  findOne: (id: string) =>
    api.get<User>(`/users/${id}`).then((r) => r.data),

  create: (data: CreateUserRequest) =>
    api.post<User>('/users', data).then((r) => r.data),

  update: (id: string, data: UpdateUserRequest) =>
    api.patch<User>(`/users/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/users/${id}`).then((r) => r.data),
};
