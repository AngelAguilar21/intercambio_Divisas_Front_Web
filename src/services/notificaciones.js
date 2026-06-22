import { api } from '@/boot/axios'

export function getNotificaciones(params = {}) {
  return api.get('/notificaciones', { params })
}

export function getContador() {
  return api.get('/notificaciones/contador')
}

export function marcarLeida(id) {
  return api.post(`/notificaciones/${id}/leida`)
}

export function marcarTodasLeidas() {
  return api.post('/notificaciones/marcar-todas-leidas')
}
