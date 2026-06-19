import { apiClient } from './api.client';

export interface UserListItem {
  id: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'GUARDIAN';
  isActive: boolean;
  name: string;
  code: string;
}

export interface RegisterUserDto {
  email: string;
  passwordHash: string; // the backend uses this field for password register request
  role: 'ADMIN' | 'TEACHER' | 'STUDENT' | 'GUARDIAN';
  firstName: string;
  lastName: string;
  department?: string;
  enrollmentCode?: string;
  grade?: string;
  phone?: string;
}

export const userApi = {
  getAllUsers: async (): Promise<UserListItem[]> => {
    const response = await apiClient.get<{ success: boolean; data: any[] }>('/users');
    return response.data.data.map((u) => {
      const firstName = u.profile?.firstName ?? '';
      const lastName = u.profile?.lastName ?? '';
      const name = [firstName, lastName].filter(Boolean).join(' ') || u.email.split('@')[0].toUpperCase();
      const code = u.profile?.enrollmentCode || u.profile?.department || 'N/A';
      return {
        id: u.id,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        name,
        code,
      };
    });
  },

  deactivateUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  registerUser: async (data: any): Promise<void> => {
    // Note: register expects 'password' from body because authController destructures req.body.password,
    // which maps to 'passwordHash' inside UserService.register.
    await apiClient.post('/auth/register', data);
  },
};
