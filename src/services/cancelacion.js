import { api } from '@/boot/axios'

export function getDetalleCancelacion(tipoOperacion, referenciaId) {
  return api.get('/Cancelacion/detalle', {
    params: {
      tipo: tipoOperacion,
      id: referenciaId,
      tipoOperacion,
      referenciaId,
      _ts: Date.now(),
    },
  })
}

export function confirmarCancelacion(payload) {
  return api.post('/Cancelacion', payload)
}
