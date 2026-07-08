import { api } from '@/boot/axios'

export function getResumen(params = {}) {
  return api.get('/PanelAdministrativo/resumen', { params })
}

export function getActividadReciente(params = {}) {
  return api.get('/PanelAdministrativo/actividad-reciente', { params })
}

export function exportarActividadExcel(payload) {
  return api.post('/PanelAdministrativo/actividad-reciente/exportar-excel', payload, { responseType: 'blob' })
}

export function exportarActividadPdf(payload) {
  return api.post('/PanelAdministrativo/actividad-reciente/exportar-pdf', payload, { responseType: 'blob' })
}
