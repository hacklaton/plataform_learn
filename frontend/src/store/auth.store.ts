import { create } from 'zustand';
import { authApi, User } from '../api/auth.api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authApi.login(email, password);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (e: any) {
      const message =
        e?.response?.data?.error ??
        e?.message ??
        'Credenciales inválidas. Verifica tu correo y contraseña.';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } finally {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
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
    } catch {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_refresh_token');
      localStorage.removeItem('auth_user');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: 'Sesión expirada' });
    }
  },
}));
