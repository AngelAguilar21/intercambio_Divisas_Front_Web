import { api } from '@/boot/axios'

export function getMetodosCobro() {
  return api.get('/Retiro/metodos-cobro')
}

export function calcular(payload) {
  return api.post('/Retiro/calcular', payload)
}

export function registrar(payload) {
  return api.post('/Retiro', payload)
}

export function subirVoucher() {
  return Promise.resolve({ data: { mensaje: 'Carga de voucher pendiente.' } })
}
