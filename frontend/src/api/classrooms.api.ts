import { apiClient } from './api.client';

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface Classroom {
  id: string;
  title: string;
  subject: string;
  description?: string | null;
  durationMonths: number;
  targetLevel: CourseLevel;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  teacher?: { id: string; firstName: string; lastName: string };
  _count?: { enrollments: number; grades: number };
}

export interface ClassroomEnrollment {
  id: string;
  student: { id: string; firstName: string; lastName: string; enrollmentCode?: string };
}

export interface ClassroomDetail extends Classroom {
  enrollments: ClassroomEnrollment[];
}

export interface CreateClassroomPayload {
  title: string;
  subject: string;
  durationMonths: number;
  targetLevel: CourseLevel;
  description?: string;
  teacherId?: string; // requerido cuando lo crea un ADMIN
}

export interface UpdateClassroomPayload {
  title?: string;
  subject?: string;
  description?: string;
  durationMonths?: number;
  targetLevel?: CourseLevel;
}

export const classroomsApi = {
  // ADMIN: todos los salones
  listAll: async (): Promise<Classroom[]> => {
    const res = await apiClient.get<{ success: boolean; data: Classroom[] }>('/courses/all');
    return res.data.data;
  },

  // TEACHER: sus salones
  listMine: async (): Promise<Classroom[]> => {
    const res = await apiClient.get<{ success: boolean; data: Classroom[] }>('/courses');
    return res.data.data;
  },

  getById: async (id: string): Promise<ClassroomDetail> => {
    const res = await apiClient.get<{ success: boolean; data: ClassroomDetail }>(`/courses/${id}`);
    return res.data.data;
  },

  create: async (payload: CreateClassroomPayload): Promise<Classroom> => {
    const res = await apiClient.post<{ success: boolean; data: Classroom }>('/courses/simple', payload);
    return res.data.data;
  },

  update: async (id: string, payload: UpdateClassroomPayload): Promise<Classroom> => {
    const res = await apiClient.patch<{ success: boolean; data: Classroom }>(`/courses/${id}`, payload);
    return res.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/courses/${id}`);
  },

  enroll: async (courseId: string, studentId: string): Promise<void> => {
    await apiClient.post(`/courses/${courseId}/enroll`, { studentId });
  },

  unenroll: async (courseId: string, studentId: string): Promise<void> => {
    await apiClient.delete(`/courses/${courseId}/enroll/${studentId}`);
  },
};
