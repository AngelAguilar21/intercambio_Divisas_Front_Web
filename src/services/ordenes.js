import { api } from '@/boot/axios'

export function getOrdenes(params = {}) {
  return api.get('/ordenes', { params })
}

export function getOrden(id) {
  return api.get(`/ordenes/${id}`)
}

export function crearOrden(payload) {
  return api.post('/ordenes', payload)
}
