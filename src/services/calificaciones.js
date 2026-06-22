import { api } from '@/boot/axios'

export function getPendientes() {
  return api.get('/calificaciones/pendientes')
}

export function crearCalificacion(payload) {
  return api.post('/calificaciones', payload)
}

export function getCalificacionesUsuario(usuarioId) {
  return api.get(`/calificaciones/usuario/${usuarioId}`)
}

export function reportarCalificacion(id) {
  return api.post(`/calificaciones/${id}/reportar`)
}
