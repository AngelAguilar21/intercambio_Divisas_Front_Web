import { api } from '@/boot/axios'

export function getHistorial(filtro = {}) {
  return api.get('/historial-transacciones', { params: filtro })
}

export function getParaExportar(filtro = {}) {
  return api.get('/historial-transacciones/exportar', { params: filtro })
}
