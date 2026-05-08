import { create } from 'zustand'
import api from '../api/axios'

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('itx_token') || null,
  loading: true,

  setUser: (user) => set({ user }),

  login: async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    const { token, user } = res.data
    localStorage.setItem('itx_token', token)
    set({ token, user })
    return user
  },

  logout: () => {
    localStorage.removeItem('itx_token')
    set({ user: null, token: null })
  },

  fetchMe: async () => {
    const token = localStorage.getItem('itx_token')
    if (!token) { set({ loading: false }); return }
    try {
      const res = await api.get('/auth/me')
      set({ user: res.data.user, loading: false })
    } catch {
      localStorage.removeItem('itx_token')
      set({ user: null, token: null, loading: false })
    }
  },
}))

export default useAuthStore
