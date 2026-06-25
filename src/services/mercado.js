import { api } from '@/boot/axios'

export function getOperacionesActivas(params = {}) {
  return api.get('/mercado/operaciones-activas', {
    params,
  })
}

export function getLibroOrdenes(parMonedaId, opciones = {}) {
  return api.get(`/mercado/libro/${parMonedaId}`, {
    params: {
      verTodasOrdenes: opciones.verTodasOrdenes ?? false,
      verTodasOfertas: opciones.verTodasOfertas ?? false,
    },
  })
}

export function getResumenOrden(payload) {
  return api.post('/mercado/ordenes/resumen', payload)
}

export function crearOrden(payload) {
  return api.post('/mercado/ordenes', payload)
}

export function getResumenOferta(payload) {
  return api.post('/mercado/ofertas/resumen', payload)
}

export function crearOferta(payload) {
  return api.post('/mercado/ofertas', payload)
}
