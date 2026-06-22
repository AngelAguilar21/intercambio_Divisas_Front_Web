import { api } from '@/boot/axios'

export function login(payload) {
  return api.post('/auth/login', payload)
}

export function register(payload) {
  return api.post('/auth/register', payload)
}

export function logout(token) {
  return api.post('/auth/logout', { token })
}

export function refresh(token) {
  return api.post('/auth/refresh', { token })
}

export function getMe() {
  return api.get('/auth/me')
}

export function getMenu() {
  return api.get('/auth/menu')
}

export function verificarCorreo(token) {
  return api.post('/auth/verificar-correo', { token })
}

export function reenviarVerificacion(correoElectronico) {
  return api.post('/auth/reenviar-verificacion', { correoElectronico })
}

export function forgotPassword(correoElectronico) {
  return api.post('/auth/forgot-password', { correoElectronico })
}

export function resetPassword(payload) {
  return api.post('/auth/reset-password', payload)
}
