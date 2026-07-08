import { api } from '@/boot/axios'

export function getOperacionesActivas(params = {}) {
  return api.get('/Mercado/operaciones-activas', { params })
}

export function getLibroOrdenes(parMonedaId, opciones = {}) {
  return api.get(`/Mercado/libro/${parMonedaId}`, {
    params: {
      verTodasOrdenes: opciones.verTodasOrdenes ?? false,
      verTodasOfertas: opciones.verTodasOfertas ?? false,
    },
  })
}

export function getResumenOrden(payload) {
  return api.post('/Mercado/ordenes/resumen', payload)
}

export function crearOrden(payload) {
  return api.post('/Mercado/ordenes', payload)
}

export function getResumenOferta(payload) {
  return api.post('/Mercado/ofertas/resumen', payload)
}

export function crearOferta(payload) {
  return api.post('/Mercado/ofertas', payload)
}
