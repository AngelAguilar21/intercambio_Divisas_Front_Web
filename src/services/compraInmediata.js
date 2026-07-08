import { api } from '@/boot/axios'

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function getResumen(payload = {}) {
  return api.post('/CompraInmediata/resumen', {
    ParMonedaId: toNumber(payload.ParMonedaId ?? payload.parMonedaId),
    CantidadAObtener: toNumber(payload.CantidadAObtener ?? payload.cantidadAObtener),
  })
}

export function confirmar(payload = {}) {
  return api.post('/CompraInmediata/confirmar', {
    ParMonedaId: toNumber(payload.ParMonedaId ?? payload.parMonedaId),
    CantidadAObtener: toNumber(payload.CantidadAObtener ?? payload.cantidadAObtener),
    ComprarCantidadDisponible: Boolean(payload.ComprarCantidadDisponible ?? payload.comprarCantidadDisponible ?? false),
  })
}

export function getTiempoBusqueda(saltos) {
  return api.get(`/CompraInmediata/tiempo-busqueda/${saltos}`)
}

export function buscarRuta(payload = {}) {
  return api.post('/CompraInmediata/buscar-ruta', {
    ParMonedaId: toNumber(payload.ParMonedaId ?? payload.parMonedaId),
    CantidadAObtener: toNumber(payload.CantidadAObtener ?? payload.cantidadAObtener),
    CantidadMaximaSaltos: toNumber(payload.CantidadMaximaSaltos ?? payload.cantidadMaximaSaltos ?? 1),
  })
}

export function cancelarRuta(busquedaRutaId) {
  return api.delete(`/CompraInmediata/cancelar-ruta/${busquedaRutaId}`)
}

export function cancelarBusquedaRuta(busquedaRutaId) {
  return cancelarRuta(busquedaRutaId)
}

export function confirmarRuta(payload = {}) {
  return api.post('/CompraInmediata/confirmar-ruta', {
    BusquedaRutaId: toNumber(payload.BusquedaRutaId ?? payload.busquedaRutaId),
  })
}
