import { api } from '@/boot/axios'

export function getResumen(payload) {
  return api.post('/ventainmediata/resumen', payload)
}

export function confirmar(payload) {
  return api.post('/ventainmediata/confirmar', payload)
}

export function buscarRuta(payload) {
  return api.post('/ventainmediata/buscar-ruta', payload)
}

export function confirmarRuta(payload) {
  return api.post('/ventainmediata/confirmar-ruta', payload)
}

export function cancelarBusquedaRuta(busquedaRutaId) {
  return api.delete(`/ventainmediata/cancelar-ruta/${busquedaRutaId}`)
}
