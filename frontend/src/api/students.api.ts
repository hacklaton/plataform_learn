import { apiClient } from './api.client';

export interface StudentEnrollment {
  id: string;
  course: { id: string; title: string; subject: string };
}

export interface StudentGrade {
  id: string;
  assessmentName: string;
  value: number;
  weight: number;
  feedback?: string | null;
  createdAt: string;
  course: { id: string; title: string };
}

export interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  enrollmentCode: string;
  grade?: string | null;
  user: { id: string; email: string; isActive: boolean; createdAt: string };
  enrollments: StudentEnrollment[];
  grades?: StudentGrade[];
}

export interface CreateStudentPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  enrollmentCode: string;
  grade?: string;
}

export interface UpdateStudentPayload {
  firstName?: string;
  lastName?: string;
  grade?: string;
  isActive?: boolean;
}

export const studentsApi = {
  list: async (): Promise<Student[]> => {
    const res = await apiClient.get<{ success: boolean; data: Student[] }>('/students');
    return res.data.data;
  },

  getById: async (id: string): Promise<Student> => {
    const res = await apiClient.get<{ success: boolean; data: Student }>(`/students/${id}`);
    return res.data.data;
  },

  create: async (payload: CreateStudentPayload): Promise<Student> => {
    const res = await apiClient.post<{ success: boolean; data: Student }>('/students', payload);
    return res.data.data;
  },

  update: async (id: string, payload: UpdateStudentPayload): Promise<Student> => {
    const res = await apiClient.patch<{ success: boolean; data: Student }>(`/students/${id}`, payload);
    return res.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/students/${id}`);
  },
};
