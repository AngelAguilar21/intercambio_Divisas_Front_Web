import { api } from '@/boot/axios'

export function obtenerTemaVisual() {
  return api.get('/configuracion/tema-visual')
}

export function actualizarTemaVisual(temaVisual) {
  return api.put('/configuracion/tema-visual', { temaVisual })
}
