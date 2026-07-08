import { api } from '@/boot/axios'

export function getOfertas(params = {}) {
  return api.get('/ofertas', { params })
}

export function crearOferta(payload) {
  return api.post('/ofertas', payload)
}
