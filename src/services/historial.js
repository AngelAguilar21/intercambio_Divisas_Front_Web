import { api } from '@/boot/axios'

export function getHistorial(filtro = {}) {
  return api.get('/historial-transacciones', { params: filtro })
}

export function getParaExportar(filtro = {}) {
  return api.get('/historial-transacciones/exportar', { params: filtro })
}

export function exportarHistorialExcel(filtro = {}) {
  return api.post('/historial-transacciones/exportar-excel', filtro, { responseType: 'blob' })
}

export function exportarHistorialPdf(filtro = {}) {
  return api.post('/historial-transacciones/exportar-pdf', filtro, { responseType: 'blob' })
}
