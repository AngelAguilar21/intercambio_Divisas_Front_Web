import { api } from '@/boot/axios'

export function getPaises() {
  return api.get('/Pais')
}
