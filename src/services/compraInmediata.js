import { api } from '@/boot/axios'

export function getResumen(payload) {
  return api.post('/comprainmediata/resumen', payload)
}

export function confirmar(payload) {
  return api.post('/comprainmediata/confirmar', payload)
}

export function buscarRuta(payload) {
  return api.post('/comprainmediata/buscar-ruta', payload)
}

export function confirmarRuta(payload) {
  return api.post('/comprainmediata/confirmar-ruta', payload)
}

export function cancelarBusquedaRuta(busquedaRutaId) {
  return api.delete(`/comprainmediata/cancelar-ruta/${busquedaRutaId}`)
}
