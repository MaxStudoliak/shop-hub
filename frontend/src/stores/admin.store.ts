import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Admin } from '@/types'

interface AdminStore {
  admin: Admin | null
  token: string | null
  setAuth: (admin: Admin, token: string) => void
  logout: () => void
  isAuthenticated: () => boolean
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,

      setAuth: (admin, token) => {
        localStorage.setItem('admin_token', token)
        set({ admin, token })
      },

      logout: () => {
        localStorage.removeItem('admin_token')
        set({ admin: null, token: null })
      },

      isAuthenticated: () => {
        return !!get().token
      },
    }),
    {
      name: 'admin-storage',
    }
  )
)
