import { api } from '@/boot/axios'

export function buscarUsuarios(filtro = {}) {
  return api.get('/GestionUsuariosAdmin/usuarios', { params: filtro })
}

export function obtenerDetalleUsuario(usuarioId) {
  return api.get(`/GestionUsuariosAdmin/usuarios/${usuarioId}`)
}

export function restringirUsuario(usuarioId, mensaje) {
  return api.post(`/GestionUsuariosAdmin/usuarios/${usuarioId}/restringir`, { mensaje })
}

export function habilitarUsuario(usuarioId, mensaje) {
  return api.post(`/GestionUsuariosAdmin/usuarios/${usuarioId}/habilitar`, { mensaje })
}
