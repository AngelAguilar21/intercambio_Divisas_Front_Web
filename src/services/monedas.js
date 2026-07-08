import { api } from '@/boot/axios'

export function getMonedas() {
  return api.get('/Moneda')
}
