import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const TIMEOUT_MS = 2 * 60 * 1000 // 2 minutos
const EVENTOS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']

export function useInactivityTimer() {
  const authStore = useAuthStore()
  const router = useRouter()

  let timer = null

  function resetTimer() {
    if (!authStore.isAuthenticated) return
    clearTimeout(timer)
    timer = setTimeout(cerrarSesion, TIMEOUT_MS)
  }

  async function cerrarSesion() {
    await authStore.logout()
    router.push({ name: 'login' })
  }

  onMounted(() => {
    if (!authStore.isAuthenticated) return
    EVENTOS.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }))
    resetTimer()
  })

  onUnmounted(() => {
    clearTimeout(timer)
    EVENTOS.forEach((ev) => window.removeEventListener(ev, resetTimer))
  })
}
