import { defineStore } from 'pinia'
import { Dark } from 'quasar'
import * as authService from '@/services/auth'
import * as configuracionService from '@/services/configuracion'
import { useBilleteraStore } from '@/stores/billetera'

const TOKEN_KEY = 'xchang_token'
const USER_KEY = 'xchang_user'
const THEME_KEY = 'xchang_tema_visual'

function normalizarTema(tema) {
  return tema === 'Claro' ? 'Claro' : 'Oscuro'
}

function obtenerUsuarioLocal() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}

const usuarioLocal = obtenerUsuarioLocal()

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: usuarioLocal,
    temaVisual: normalizarTema(
      usuarioLocal?.temaVisual || localStorage.getItem(THEME_KEY) || 'Oscuro',
    ),
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) =>
      ['Administrador', 'ADM'].includes(state.user?.rol) || state.user?.rolCodigo === 'ADM',
    isRestricted: (state) => state.user?.estado === 'Restringido',
    canOperate: (state) => state.user?.estado === 'Activo',
  },

  actions: {
    applyTheme(tema = this.temaVisual) {
      const temaNormalizado = normalizarTema(tema)
      this.temaVisual = temaNormalizado
      localStorage.setItem(THEME_KEY, temaNormalizado)
      Dark.set(temaNormalizado === 'Oscuro')
      document.documentElement.setAttribute(
        'data-theme',
        temaNormalizado === 'Oscuro' ? 'oscuro' : 'claro',
      )
      document.body.classList.toggle('xchang-dark', temaNormalizado === 'Oscuro')
    },

    applyStoredTheme() {
      this.applyTheme(this.user?.temaVisual || this.temaVisual)
    },

    setSession(authResponse) {
      this.token = authResponse.token
      this.user = authResponse.usuario
      localStorage.setItem(TOKEN_KEY, this.token)
      localStorage.setItem(USER_KEY, JSON.stringify(this.user))
      this.applyTheme(this.user?.temaVisual || 'Oscuro')
    },

    async login(payload) {
      const { data } = await authService.login(payload)
      this.setSession(data)
      return data
    },

    async register(payload) {
      this.clearSession()

      const { data } = await authService.register(payload)

      this.setSession(data)

      return data
    },

    async logout() {
      try {
        if (this.token) {
          await authService.logout()
        }
      } catch (error) {
        const status = error.response?.status

        if (status !== 401) {
          console.error('No se pudo cerrar sesión en el backend:', error)
        }
      } finally {
        this.clearSession()
      }
    },

    clearSession() {
      this.token = null
      this.user = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      this.applyTheme(localStorage.getItem(THEME_KEY) || 'Oscuro')
      useBilleteraStore().limpiar()
    },

    async fetchProfile() {
      const { data } = await authService.getMe()
      this.user = { ...this.user, ...data }
      localStorage.setItem(USER_KEY, JSON.stringify(this.user))
      if (data?.temaVisual) this.applyTheme(data.temaVisual)
      return data
    },

    async cargarTemaVisualDesdeBackend() {
      if (!this.isAuthenticated) {
        this.applyTheme(localStorage.getItem(THEME_KEY) || 'Oscuro')
        return { temaVisual: this.temaVisual }
      }
      const { data } = await configuracionService.obtenerTemaVisual()
      const tema = data.temaVisual || 'Oscuro'
      this.user = { ...this.user, temaVisual: tema }
      localStorage.setItem(USER_KEY, JSON.stringify(this.user))
      this.applyTheme(tema)
      return data
    },

    async actualizarTemaVisual(temaVisual) {
      const tema = normalizarTema(temaVisual)
      if (!this.isAuthenticated) {
        this.applyTheme(tema)
        return { temaVisual: tema }
      }
      const { data } = await configuracionService.actualizarTemaVisual(tema)
      const temaActualizado = data.temaVisual || tema
      this.user = { ...this.user, temaVisual: temaActualizado }
      localStorage.setItem(USER_KEY, JSON.stringify(this.user))
      this.applyTheme(temaActualizado)
      return data
    },
  },
})
