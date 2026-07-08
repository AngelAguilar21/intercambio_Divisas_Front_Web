import { api } from '@/boot/axios'

export function getDetalleCancelacion(tipoOperacion, referenciaId) {
  return api.get('/Cancelacion/detalle', {
    params: { tipoOperacion, referenciaId },
  })
}

export function confirmarCancelacion(payload) {
  return api.post('/Cancelacion', payload)
}
