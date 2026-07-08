import { api } from '@/boot/axios'

export function buscarAuditoria(filtro = {}) {
  return api.get('/AuditoriaAdministrativa/registros', { params: filtro })
}

export function exportarExcel(payload = {}) {
  return api.post('/AuditoriaAdministrativa/exportar-excel', payload, { responseType: 'blob' })
}

export function exportarPdf(payload = {}) {
  return api.post('/AuditoriaAdministrativa/exportar-pdf', payload, { responseType: 'blob' })
}
