import { api } from '@/boot/axios'

export function getDetalleCancelacion(tipo, id) {
  return api.get('/cancelacion/detalle', { params: { tipo, id } })
}

export function confirmarCancelacion(payload) {
  return api.post('/cancelacion', payload)
}
