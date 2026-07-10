import { defineStore } from 'pinia'
import * as notifService from '@/services/notificaciones'

export const useNotificacionesStore = defineStore('notificaciones', {
  state: () => ({
    items: [],
    noLeidas: 0,
  }),

  actions: {
    async fetchContador() {
      try {
        const { data } = await notifService.getContador()
        this.noLeidas = data.noLeidas
      } catch {
        // endpoint aún no implementado en el backend
      }
    },

    async fetchLista(soloNoLeidas = false) {
      try {
        const { data } = await notifService.getNotificaciones({ soloNoLeidas, tamanoPagina: 30 })
        this.items = data.lista
        this.noLeidas = data.noLeidas
      } catch {
        // endpoint aún no implementado en el backend
      }
    },

    async marcarLeida(id) {
      await notifService.marcarLeida(id)
      const item = this.items.find((n) => n.notificacionUsuarioId === id)
      if (item) item.leida = true
      await this.fetchContador()
    },

    async marcarTodasLeidas() {
      await notifService.marcarTodasLeidas()
      this.items.forEach((n) => (n.leida = true))
      this.noLeidas = 0
    },
  },
})
