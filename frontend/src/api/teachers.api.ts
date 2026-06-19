import { apiClient } from './api.client';

export interface Teacher {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  department?: string | null;
  user: { id: string; email: string; isActive: boolean; createdAt: string };
  courses: { id: string; title: string; subject: string }[];
}

export interface CreateTeacherPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department?: string;
}

export interface UpdateTeacherPayload {
  firstName?: string;
  lastName?: string;
  department?: string;
  isActive?: boolean;
}

export const teachersApi = {
  list: async (): Promise<Teacher[]> => {
    const res = await apiClient.get<{ success: boolean; data: Teacher[] }>('/teachers');
    return res.data.data;
  },

  getById: async (id: string): Promise<Teacher> => {
    const res = await apiClient.get<{ success: boolean; data: Teacher }>(`/teachers/${id}`);
    return res.data.data;
  },

  create: async (payload: CreateTeacherPayload): Promise<Teacher> => {
    const res = await apiClient.post<{ success: boolean; data: Teacher }>('/teachers', payload);
    return res.data.data;
  },

  update: async (id: string, payload: UpdateTeacherPayload): Promise<Teacher> => {
    const res = await apiClient.patch<{ success: boolean; data: Teacher }>(`/teachers/${id}`, payload);
    return res.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/teachers/${id}`);
  },
};
