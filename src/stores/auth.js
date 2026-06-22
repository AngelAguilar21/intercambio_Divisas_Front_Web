import { defineStore } from 'pinia'
import * as authService from '@/services/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('xchang_token') || null,
    user: JSON.parse(localStorage.getItem('xchang_user') || 'null'),
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.rol === 'Administrador',
  },

  actions: {
    setSession(authResponse) {
      this.token = authResponse.token
      this.user = authResponse.usuario
      localStorage.setItem('xchang_token', this.token)
      localStorage.setItem('xchang_user', JSON.stringify(this.user))
    },

    async login(payload) {
      const { data } = await authService.login(payload)
      this.setSession(data)
      return data
    },

    async register(payload) {
      return await authService.register(payload)
    },

    async logout() {
      try {
        if (this.token) await authService.logout(this.token)
      } finally {
        this.clearSession()
      }
    },

    clearSession() {
      this.token = null
      this.user = null
      localStorage.removeItem('xchang_token')
      localStorage.removeItem('xchang_user')
    },

    async fetchProfile() {
      const { data } = await authService.getMe()
      this.user = { ...this.user, ...data }
      localStorage.setItem('xchang_user', JSON.stringify(this.user))
      return data
    },
  },
})
