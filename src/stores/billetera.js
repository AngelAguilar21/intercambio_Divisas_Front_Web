import { defineStore } from 'pinia'
import { getBilletera } from '@/services/billetera'

export const useBilleteraStore = defineStore('billetera', {
  state: () => ({
    saldos: [],
    cargando: false,
    cargado: false,
  }),

  actions: {
    async cargar() {
      this.cargando = true
      try {
        const { data } = await getBilletera()
        this.saldos = data.saldos || []
        this.cargado = true
      } finally {
        this.cargando = false
      }
    },

    async refrescar() {
      await this.cargar()
    },

    limpiar() {
      this.saldos = []
      this.cargado = false
    },
  },
})
