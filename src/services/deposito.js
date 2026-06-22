import { api } from '@/boot/axios'

export function getMetodosPago() {
  return api.get('/deposito/metodos-pago')
}

export function calcular(payload) {
  return api.post('/deposito/calcular', payload)
}

export function registrar(payload) {
  return api.post('/deposito', payload)
}

export function subirVoucher(depositoId, archivo) {
  const formData = new FormData()
  formData.append('archivo', archivo)
  return api.post(`/deposito/${depositoId}/voucher`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
