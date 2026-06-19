import { create } from 'zustand';
import { authApi, User } from '../api/auth.api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authApi.login(email);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (e) {
      set({ error: (e as Error).message || 'Error al iniciar sesión', isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    } catch (e) {
      set({ error: 'Error al cerrar sesión', isLoading: false });
    }
  },

  checkSession: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const user = await authApi.getProfile();
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (e) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user_id');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: 'Sesión expirada' });
    }
  }
}));
