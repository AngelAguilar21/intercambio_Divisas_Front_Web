import { api } from '@/boot/axios'

export function getOfertas(filtro = {}) {
  return api.get('/ofertas', { params: filtro })
}

export function crearOferta(payload) {
  return api.post('/ofertas', payload)
}
