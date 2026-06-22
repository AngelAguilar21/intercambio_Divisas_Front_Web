import { api } from '@/boot/axios'

export function getBilletera() {
  return api.get('/billetera')
}
