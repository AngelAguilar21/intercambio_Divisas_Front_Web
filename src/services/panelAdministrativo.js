import { api } from '@/boot/axios'

export function getResumen(filtro = {}) {
  return api.get('/panelAdministrativo/resumen', { params: filtro })
}

export function getActividadReciente(filtro = {}) {
  return api.get('/panelAdministrativo/actividad-reciente', { params: filtro })
}

export function exportarActividadExcel(filtro = {}) {
  return api.post('/panelAdministrativo/actividad-reciente/exportar-excel', filtro, {
    responseType: 'blob',
  })
}

export function exportarActividadPdf(filtro = {}) {
  return api.post('/panelAdministrativo/actividad-reciente/exportar-pdf', filtro, {
    responseType: 'blob',
  })
}
