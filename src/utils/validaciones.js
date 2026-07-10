export const RANGO_OPTIONS = [
  { label: 'Último día', value: 'UltimoDia' },
  { label: 'Última semana', value: 'UltimaSemana' },
  { label: 'Último mes', value: 'UltimoMes' },
  { label: 'Último año', value: 'UltimoAno' },
  { label: 'Tiempo total', value: 'Total' },
]

export function validarRequerido(valor, mensaje) {
  return valor !== null && valor !== undefined && String(valor).trim() !== '' ? true : mensaje
}

export function validarNombreUsuario(valor) {
  const val = String(valor || '').trim()
  if (val.length < 2) return 'Mínimo 2 caracteres'
  if (val.length > 30) return 'Máximo 30 caracteres'
  return true
}

export function validarCorreo(valor) {
  const val = String(valor || '').trim()
  if (val.length < 5) return 'Mínimo 5 caracteres'
  if (val.length > 100) return 'Máximo 100 caracteres'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Correo inválido'
  return true
}

export function validarIdentificadorAcceso(valor) {
  const val = String(valor || '').trim()
  if (val.length < 2) return 'Mínimo 2 caracteres'
  if (val.length > 100) return 'Máximo 100 caracteres'
  return true
}

export function validarPassword(valor, { exigirComplejidad = false } = {}) {
  const val = String(valor || '')
  if (val.length < 8) return 'Mínimo 8 caracteres'
  if (val.length > 50) return 'Máximo 50 caracteres'
  if (exigirComplejidad && !/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(val)) {
    return 'La contraseña debe contener una mayúscula, un número y un carácter especial'
  }
  return true
}

export function validarConfirmarPassword(confirmacion, password) {
  return confirmacion === password ? true : 'Las contraseñas no coinciden'
}

export function validarMonto(valor) {
  if (valor === null || valor === undefined || valor === '') return 'Monto inválido'
  const n = Number(valor)
  if (!Number.isFinite(n)) return 'Monto inválido'
  if (n <= 0) return 'El monto debe ser mayor a 0'
  if (n > 1_000_000) return 'Monto máximo excedido'
  return true
}

export function validarCantidad(valor) {
  if (valor === null || valor === undefined || valor === '') return 'La cantidad debe ser mayor a 0'
  const n = Number(valor)
  if (!Number.isFinite(n) || n <= 0) return 'La cantidad debe ser mayor a 0'
  return true
}

export function validarPrecio(valor) {
  if (valor === null || valor === undefined || valor === '') return 'El precio debe ser mayor a 0'
  const n = Number(valor)
  if (!Number.isFinite(n) || n <= 0) return 'El precio debe ser mayor a 0'
  return true
}

export function validarSaltos(valor) {
  if (valor === null || valor === undefined || valor === '') return 'Mínimo 1 salto'
  const n = Number(valor)
  if (!Number.isInteger(n) || n < 1) return 'Mínimo 1 salto'
  if (n > 5) return 'Máximo 5 saltos'
  return true
}

export function validarFechaDesdeHasta(desde, hasta) {
  if (!desde || !hasta) return true
  return new Date(desde) <= new Date(hasta) ? true : 'La fecha final debe ser posterior a la fecha inicial'
}

export function normalizarMensajeError(error, fallback = 'Valor inválido') {
  const mensajeOriginal = error?.response?.data?.mensaje || error?.response?.data?.message || error?.message || ''
  const mensaje = String(mensajeOriginal).trim()
  const lower = mensaje.toLowerCase()

  if (!mensaje) return fallback
  if (lower.includes('credencial')) return 'Credenciales inválidas'
  if (lower.includes('usuario ya')) return 'Usuario ya registrado'
  if (lower.includes('correo ya')) return 'Correo ya registrado'
  if (lower.includes('correo') && lower.includes('invál')) return 'Correo inválido'
  if (lower.includes('saldo')) return 'Saldo insuficiente'
  if (lower.includes('liquidez')) return 'Liquidez insuficiente'
  if (lower.includes('monto')) return lower.includes('mayor') ? 'El monto debe ser mayor a 0' : 'Monto inválido'
  if (lower.includes('cantidad')) return 'La cantidad debe ser mayor a 0'
  if (lower.includes('precio')) return 'El precio debe ser mayor a 0'
  if (lower.includes('restringido')) return 'Usuario restringido'

  return mensaje || fallback
}
