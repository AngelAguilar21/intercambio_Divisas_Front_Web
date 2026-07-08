import { api } from '@/boot/axios'

export function getMetodosPago() {
  return api.get('/Deposito/metodos-pago')
}

export function calcular(payload) {
  return api.post('/Deposito/calcular', payload)
}

export function registrar(payload) {
  return api.post('/Deposito', payload)
}

export function subirVoucher() {
  return Promise.resolve({ data: { mensaje: 'Carga de voucher pendiente.' } })
}
