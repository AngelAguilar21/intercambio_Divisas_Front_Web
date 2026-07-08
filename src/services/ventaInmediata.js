import { api } from '@/boot/axios'

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function getResumen(payload = {}) {
  return api.post('/VentaInmediata/resumen', {
    ParMonedaId: toNumber(payload.ParMonedaId ?? payload.parMonedaId),
    CantidadAVender: toNumber(payload.CantidadAVender ?? payload.cantidadAVender),
  })
}

export function confirmar(payload = {}) {
  return api.post('/VentaInmediata/confirmar', {
    ParMonedaId: toNumber(payload.ParMonedaId ?? payload.parMonedaId),
    CantidadAVender: toNumber(payload.CantidadAVender ?? payload.cantidadAVender),
    VenderCantidadDisponible: Boolean(payload.VenderCantidadDisponible ?? payload.venderCantidadDisponible ?? false),
  })
}

export function getTiempoBusqueda(saltos) {
  return api.get(`/VentaInmediata/tiempo-busqueda/${saltos}`)
}

export function buscarRuta(payload = {}) {
  return api.post('/VentaInmediata/buscar-ruta', {
    ParMonedaId: toNumber(payload.ParMonedaId ?? payload.parMonedaId),
    CantidadAVender: toNumber(payload.CantidadAVender ?? payload.cantidadAVender),
    CantidadMaximaSaltos: toNumber(payload.CantidadMaximaSaltos ?? payload.cantidadMaximaSaltos ?? 1),
  })
}

export function cancelarRuta(busquedaRutaId) {
  return api.delete(`/VentaInmediata/cancelar-ruta/${busquedaRutaId}`)
}

export function cancelarBusquedaRuta(busquedaRutaId) {
  return cancelarRuta(busquedaRutaId)
}

export function confirmarRuta(payload = {}) {
  return api.post('/VentaInmediata/confirmar-ruta', {
    BusquedaRutaId: toNumber(payload.BusquedaRutaId ?? payload.busquedaRutaId),
  })
}
