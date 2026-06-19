import { apiClient } from './api.client';

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  teacherId: string;
  assessmentName: string;
  value: number;
  weight: number;
  feedback?: string | null;
  createdAt: string;
  updatedAt: string;
  student: { id: string; firstName: string; lastName: string; enrollmentCode: string };
  course: { id: string; title: string; subject: string; teacherId: string };
  teacher: { id: string; firstName: string; lastName: string };
}

export interface CreateGradePayload {
  studentId: string;
  courseId: string;
  assessmentName: string;
  value: number;
  weight?: number;
  feedback?: string;
}

export interface UpdateGradePayload {
  assessmentName?: string;
  value?: number;
  weight?: number;
  feedback?: string;
}

export const gradesApi = {
  list: async (params?: { courseId?: string; studentId?: string }): Promise<Grade[]> => {
    const res = await apiClient.get<{ success: boolean; data: Grade[] }>('/grades', { params });
    return res.data.data;
  },

  create: async (payload: CreateGradePayload): Promise<Grade> => {
    const res = await apiClient.post<{ success: boolean; data: Grade }>('/grades', payload);
    return res.data.data;
  },

  update: async (id: string, payload: UpdateGradePayload): Promise<Grade> => {
    const res = await apiClient.patch<{ success: boolean; data: Grade }>(`/grades/${id}`, payload);
    return res.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/grades/${id}`);
  },
};
