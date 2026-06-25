import { api } from '@/boot/axios'

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function normalizarCompraPayload(payload = {}) {
  return {
    ParMonedaId: toNumber(payload.ParMonedaId ?? payload.parMonedaId),
    CantidadAObtener: toNumber(payload.CantidadAObtener ?? payload.cantidadAObtener),
  }
}

function normalizarConfirmarCompraPayload(payload = {}) {
  return {
    ParMonedaId: toNumber(payload.ParMonedaId ?? payload.parMonedaId),
    CantidadAObtener: toNumber(payload.CantidadAObtener ?? payload.cantidadAObtener),
    ComprarCantidadDisponible: Boolean(
      payload.ComprarCantidadDisponible ?? payload.comprarCantidadDisponible ?? false,
    ),
  }
}

function normalizarRutaCompraPayload(payload = {}) {
  return {
    ParMonedaId: toNumber(payload.ParMonedaId ?? payload.parMonedaId),
    CantidadAObtener: toNumber(payload.CantidadAObtener ?? payload.cantidadAObtener),
    CantidadMaximaSaltos: toNumber(
      payload.CantidadMaximaSaltos ?? payload.cantidadMaximaSaltos ?? 1,
    ),
  }
}

export function getResumen(payload) {
  return api.post('/CompraInmediata/resumen', normalizarCompraPayload(payload))
}

export function confirmar(payload) {
  return api.post('/CompraInmediata/confirmar', normalizarConfirmarCompraPayload(payload))
}

export function getTiempoBusqueda(saltos) {
  return api.get(`/CompraInmediata/tiempo-busqueda/${saltos}`)
}

export function buscarRuta(payload) {
  return api.post('/CompraInmediata/buscar-ruta', normalizarRutaCompraPayload(payload))
}

export function cancelarRuta(busquedaRutaId) {
  return api.delete(`/CompraInmediata/cancelar-ruta/${busquedaRutaId}`)
}

export function cancelarBusquedaRuta(busquedaRutaId) {
  return cancelarRuta(busquedaRutaId)
}

export function confirmarRuta(payload) {
  return api.post('/CompraInmediata/confirmar-ruta', {
    BusquedaRutaId: toNumber(payload.BusquedaRutaId ?? payload.busquedaRutaId),
  })
}
