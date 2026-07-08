// Correos/notificaciones quedan pausados por ahora. El frontend mantiene la API local
// Servicio temporal para evitar errores en la barra mientras se implementa el módulo de notificaciones.
export function getContador() {
  return Promise.resolve({ data: { noLeidas: 0 } })
}

export function getContadorNoLeidas() {
  return getContador()
}

export function getNotificaciones() {
  return Promise.resolve({ data: { lista: [], noLeidas: 0 } })
}

export function marcarLeida() {
  return Promise.resolve({ data: {} })
}

export function marcarTodasLeidas() {
  return Promise.resolve({ data: {} })
}
