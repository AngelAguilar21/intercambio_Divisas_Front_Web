import { api } from '@/boot/axios'

export function buscarUsuarios(filtro = {}) {
  return api.get('/gestionusuariosadmin/usuarios', { params: filtro })
}

export function obtenerDetalleUsuario(usuarioId) {
  return api.get(`/gestionusuariosadmin/usuarios/${usuarioId}`)
}

export function restringirUsuario(usuarioId, mensaje) {
  return api.post(`/gestionusuariosadmin/usuarios/${usuarioId}/restringir`, { mensaje })
}

export function habilitarUsuario(usuarioId, mensaje) {
  return api.post(`/gestionusuariosadmin/usuarios/${usuarioId}/habilitar`, { mensaje })
}
