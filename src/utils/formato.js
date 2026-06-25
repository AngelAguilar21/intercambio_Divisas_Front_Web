export function formatearMonto(valor, decimales = 2) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return '-'

  return Number(valor).toLocaleString('es-PE', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

export function formatearPorcentaje(valor, decimales = 2) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return '-'

  const signo = valor > 0 ? '+' : ''
  return `${signo}${Number(valor).toLocaleString('es-PE', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })}%`
}

export function formatearFecha(fecha) {
  if (!fecha) return '-'

  return new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatearFechaCorta(fecha) {
  if (!fecha) return '-'

  return new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
  })
}
