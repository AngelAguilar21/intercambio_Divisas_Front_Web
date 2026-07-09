import { getResumen } from './panelAdministrativo'

export function getDashboard() {
  return getResumen()
}

export function getConfiguracion() {
  return Promise.resolve({ data: {} })
}

export function actualizarConfiguracion() {
  return Promise.resolve({ data: {} })
}

export function getReporteTransacciones() {
  return Promise.resolve({ data: [] })
}
