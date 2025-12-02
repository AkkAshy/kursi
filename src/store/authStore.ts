import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (phone: string, password: string) => Promise<void>;
  loginWithUsername: (username: string, password: string) => Promise<void>;
  register: (data: { phone: string; password: string; role: string; username?: string }) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (phone: string, password: string) => {
        set({ isLoading: true });
        try {
          await api.login(phone, password);
          const profile = await api.getMe();
          set({ user: profile, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithUsername: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          // login принимает любой логин (phone или username)
          await api.login(username, password);
          const profile = await api.getMe();
          set({ user: profile, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          await api.register({
            phone: data.phone,
            username: data.username || data.phone,
            password: data.password,
            password_confirm: data.password,
            role: data.role as 'creator' | 'student',
          });
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        api.logout();
        set({ user: null, isAuthenticated: false });
      },

      fetchProfile: async () => {
        if (!api.isAuthenticated()) return;

        set({ isLoading: true });
        try {
          const profile = await api.getMe();
          set({ user: profile, isAuthenticated: true, isLoading: false });
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
