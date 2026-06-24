import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from 'src/services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('xc_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('xc_user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  async function login(identificadorAcceso, password) {
    const res = await api.post('/api/auth/login', { identificadorAcceso, password })
    token.value = res.data.token
    user.value = res.data.usuario
    localStorage.setItem('xc_token', res.data.token)
    localStorage.setItem('xc_user', JSON.stringify(res.data.usuario))
    return res.data
  }

  async function logout() {
    try {
      await api.post('/api/auth/logout', { token: token.value })
    } catch {}
    token.value = null
    user.value = null
    localStorage.removeItem('xc_token')
    localStorage.removeItem('xc_user')
  }

  async function register(data) {
    const res = await api.post('/api/auth/register', data)
    return res.data
  }

  return { token, user, isAuthenticated, login, logout, register }
})
