import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 90000, // 90 sekund — AI quiz generatsiya uchun
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('itx_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('itx_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
