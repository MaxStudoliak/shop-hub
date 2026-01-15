import axios from 'axios'
import { useUserStore } from '@/stores/user.store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const userApi = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

userApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = useUserStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      useUserStore.getState().logout()
    }
    return Promise.reject(error)
  }
)
