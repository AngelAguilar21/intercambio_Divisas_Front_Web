import { api } from '@/boot/axios'

export function buscarAuditoria(filtro = {}) {
  return api.get('/auditoriaadministrativa/registros', { params: filtro })
}

export function exportarExcel(filtro = {}) {
  return api.post('/auditoriaadministrativa/exportar-excel', filtro, { responseType: 'blob' })
}

export function exportarPdf(filtro = {}) {
  return api.post('/auditoriaadministrativa/exportar-pdf', filtro, { responseType: 'blob' })
}
