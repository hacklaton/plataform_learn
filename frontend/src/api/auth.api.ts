import { apiClient } from './api.client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'TEACHER' | 'ADMIN' | 'DIRECTOR';
}

export const authApi = {
  login: async (email: string, _password?: string): Promise<{ user: User; token: string }> => {
    try {
      // Register or sync user with real backend
      const response = await apiClient.post('/users', {
        name: email.split('@')[0].toUpperCase(),
        email: email,
      });
      const user = response.data;
      const token = 'mock_jwt_token_for_' + user.id;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user_id', user.id);
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'TEACHER',
        },
        token,
      };
    } catch (e) {
      console.warn('Backend user sync failed, falling back to mock auth', e);
      const mockUser: User = {
        id: 'mock-user-123',
        name: 'Profesor Demo',
        email: email,
        role: 'TEACHER',
      };
      const token = 'mock_jwt_token';
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user_id', mockUser.id);
      return { user: mockUser, token };
    }
  },

  getProfile: async (): Promise<User> => {
    const userId = localStorage.getItem('auth_user_id');
    if (!userId || userId === 'mock-user-123') {
      return {
        id: 'mock-user-123',
        name: 'Profesor Demo',
        email: 'profesor@hacklaton.edu',
        role: 'TEACHER',
      };
    }
    try {
      const response = await apiClient.get(`/users/${userId}`);
      return {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: 'TEACHER',
      };
    } catch (e) {
      return {
        id: 'mock-user-123',
        name: 'Profesor Demo',
        email: 'profesor@hacklaton.edu',
        role: 'TEACHER',
      };
    }
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user_id');
  },

  checkHealth: async (): Promise<{ status: string; database: string; redis: string }> => {
    const response = await apiClient.get('/health');
    return response.data;
  }
};
