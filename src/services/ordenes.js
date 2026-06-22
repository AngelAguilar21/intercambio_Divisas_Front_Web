import { api } from '@/boot/axios'

export function getOrdenes(filtro = {}) {
  return api.get('/ordenes', { params: filtro })
}

export function getOrdenPorId(id) {
  return api.get(`/ordenes/${id}`)
}

export function crearOrden(payload) {
  return api.post('/ordenes', payload)
}

export function getLibroOrdenes(parMonedaId) {
  return api.get(`/ordenes/libro/${parMonedaId}`)
}

export function getLibroOrdenesDetalle(parMonedaId, limite = 10) {
  return api.get(`/ordenes/libro/${parMonedaId}/detalle`, { params: { limite } })
}
