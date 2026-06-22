import { api } from '@/boot/axios'

export function getDashboard() {
  return api.get('/admin/dashboard')
}

export function getConfiguracion() {
  return api.get('/admin/configuracion')
}

export function actualizarConfiguracion(clave, valor) {
  return api.put(`/admin/configuracion/${clave}`, { valor })
}

export function getHistorialConfiguracion(clave) {
  return api.get(`/admin/configuracion/${clave}/historial`)
}

export function getReporteTransacciones(filtro = {}) {
  return api.get('/admin/reportes/transacciones', { params: filtro })
}
