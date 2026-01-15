import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  city?: string
  zip?: string
  country?: string
}

interface UserStore {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  updateUser: (user: User) => void
  logout: () => void
  isAuthenticated: () => boolean
  getToken: () => string | null
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (user, token) => {
        set({ user, token })
      },

      updateUser: (user) => {
        set({ user })
      },

      logout: () => {
        set({ user: null, token: null })
      },

      isAuthenticated: () => {
        return !!get().token
      },

      getToken: () => {
        return get().token
      },
    }),
    {
      name: 'user-storage',
    }
  )
)
