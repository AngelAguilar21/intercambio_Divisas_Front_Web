import { api } from '@/boot/axios'

export function abrirDisputa(payload) {
  return api.post('/disputas', payload)
}

export function getMisDisputas() {
  return api.get('/disputas')
}

export function getTodasLasDisputas() {
  return api.get('/disputas/admin')
}

export function resolverDisputa(id, payload) {
  return api.post(`/disputas/${id}/resolver`, payload)
}
