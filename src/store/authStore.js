import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Conectar a microservicio de auth
          // const response = await fetch('/api/auth/login', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ email, password }),
          //   credentials: 'include'
          // })
          // if (!response.ok) throw new Error('Credenciales incorrectas')
          // const data = await response.json()

          await new Promise((r) => setTimeout(r, 500))

          set({
            user: { email, name: 'Usuario Demo' },
            token: 'mock-jwt-token',
            isAuthenticated: true,
            isLoading: false,
          })
          return true
        } catch (err) {
          set({ error: err.message, isLoading: false })
          return false
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Conectar a microservicio
          // await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })

          await new Promise((r) => setTimeout(r, 500))

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          })
        } catch (err) {
          set({ error: err.message, isLoading: false })
        }
      },

      checkAuth: async () => {
        set({ isLoading: true, error: null })
        try {
          // TODO: Verificar cookie con microservicio
          // const response = await fetch('/api/auth/me', { credentials: 'include' })
          // if (response.ok) {
          //   const data = await response.json()
          //   set({ user: data.user, token: 'valid', isAuthenticated: true, isLoading: false })
          // } else {
          //   set({ user: null, token: null, isAuthenticated: false, isLoading: false })
          // }

          await new Promise((r) => setTimeout(r, 500))

          const token = get().token
          if (token) {
            set({ isAuthenticated: true, isLoading: false })
          } else {
            set({ isAuthenticated: false, isLoading: false })
          }
        } catch (err) {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false, error: err.message })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'bookstack-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
