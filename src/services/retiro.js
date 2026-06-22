import { api } from '@/boot/axios'

export function getMetodosCobro() {
  return api.get('/retiro/metodos-cobro')
}

export function calcular(payload) {
  return api.post('/retiro/calcular', payload)
}

export function registrar(payload) {
  return api.post('/retiro', payload)
}

export function subirVoucher(retiroId, archivo) {
  const formData = new FormData()
  formData.append('archivo', archivo)
  return api.post(`/retiro/${retiroId}/voucher`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
