import { apiClient } from './api.client';

export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'GUARDIAN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface BackendUser {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  profile: {
    firstName?: string;
    lastName?: string;
    [key: string]: unknown;
  } | null;
}

function mapBackendUser(u: BackendUser): User {
  const firstName = u.profile?.firstName ?? '';
  const lastName = u.profile?.lastName ?? '';
  const name = [firstName, lastName].filter(Boolean).join(' ') || u.email.split('@')[0].toUpperCase();
  return { id: u.id, email: u.email, role: u.role, name };
}

export const authApi = {
  login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await apiClient.post<{
      success: boolean;
      data: { user: BackendUser; tokens: { accessToken: string; refreshToken: string } };
    }>('/auth/login', { email, password });

    const { user: backendUser, tokens } = response.data.data;
    const user = mapBackendUser(backendUser);

    localStorage.setItem('auth_token', tokens.accessToken);
    localStorage.setItem('auth_refresh_token', tokens.refreshToken);
    localStorage.setItem('auth_user', JSON.stringify(user));

    return { user, token: tokens.accessToken };
  },

  getProfile: async (): Promise<User> => {
    const cached = localStorage.getItem('auth_user');
    if (cached) {
      try {
        return JSON.parse(cached) as User;
      } catch {
        // fall through to API call
      }
    }

    const response = await apiClient.get<{ success: boolean; data: BackendUser }>('/users/me');
    const user = mapBackendUser(response.data.data);
    localStorage.setItem('auth_user', JSON.stringify(user));
    return user;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('auth_user');
  },

  checkHealth: async (): Promise<{ status: string; database: string; redis: string }> => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};
