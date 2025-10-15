import axios from 'axios'

export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000',
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: add JWT token
axiosClient.interceptors.request.use(
  (config) => {
    // Token will be added here from NextAuth session or localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor: handle 401, refresh token
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Refresh token logic will be implemented here
      // For now, just reject
    }
    return Promise.reject(error)
  }
)
