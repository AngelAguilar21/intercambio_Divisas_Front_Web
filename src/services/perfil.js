import { api } from '@/boot/axios'

export function getPerfil() {
  return api.get('/perfil')
}

export function actualizarPerfil(payload) {
  return api.put('/perfil', payload)
}
