import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import api from '@/lib/api'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  login: (login: string, password: string) => Promise<void>
  register: (data: {
    phone: string
    username: string
    full_name?: string
    email?: string
    password: string
    password_confirm: string
    role: 'creator' | 'student'
  }) => Promise<void>
  logout: () => void
  fetchUser: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (login: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          await api.login(login, password)
          const user = await api.getMe()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch (err: unknown) {
          const error = err as { response?: { data?: { detail?: string; error?: string } } }
          const message =
            error.response?.data?.detail ||
            error.response?.data?.error ||
            'Ошибка входа'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.register(data)
          set({ user: response.user, isAuthenticated: true, isLoading: false })
        } catch (err: unknown) {
          const error = err as { response?: { data?: Record<string, string[]> } }
          let message = 'Ошибка регистрации'
          if (error.response?.data) {
            const errors = Object.values(error.response.data).flat()
            if (errors.length > 0) {
              message = errors[0]
            }
          }
          set({ error: message, isLoading: false })
          throw err
        }
      },

      logout: () => {
        api.logout()
        set({ user: null, isAuthenticated: false })
      },

      fetchUser: async () => {
        if (!api.isAuthenticated()) {
          set({ user: null, isAuthenticated: false })
          return
        }

        set({ isLoading: true })
        try {
          const user = await api.getMe()
          set({ user, isAuthenticated: true, isLoading: false })
        } catch {
          set({ user: null, isAuthenticated: false, isLoading: false })
          api.logout()
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
