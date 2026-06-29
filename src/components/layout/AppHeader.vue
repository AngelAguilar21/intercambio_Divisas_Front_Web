<template>
  <q-header class="xchang-header">
    <q-toolbar class="xchang-toolbar">
      <q-btn flat dense round icon="menu" color="white" aria-label="Menu" @click="$emit('toggle-drawer')" />

      <q-toolbar-title class="row items-center no-wrap q-ml-xs">
        <div class="xchang-logo-badge q-mr-sm">
          <q-icon name="currency_exchange" size="18px" color="white" />
        </div>
        <span class="xchang-logo-text">X-Chang</span>
      </q-toolbar-title>

      <WalletBar v-if="authStore.isAuthenticated" class="q-mr-sm" />

      <q-btn
        v-if="authStore.isAuthenticated"
        flat
        round
        dense
        icon="notifications"
        color="white"
        @click="onAbrirNotificaciones"
      >
        <q-badge v-if="notifStore.noLeidas > 0" color="red" floating>{{
          notifStore.noLeidas
        }}</q-badge>

        <q-menu anchor="bottom right" self="top right" @show="notifStore.fetchLista()">
          <q-list style="min-width: 320px; max-width: 380px">
            <q-item-label header class="row items-center">
              <span class="col">Notificaciones</span>
              <q-btn
                flat
                dense
                size="sm"
                label="Marcar todas leídas"
                @click="notifStore.marcarTodasLeidas()"
              />
            </q-item-label>

            <q-separator />

            <q-item v-if="notifStore.items.length === 0">
              <q-item-section>Sin notificaciones</q-item-section>
            </q-item>

            <q-item
              v-for="n in notifStore.items"
              :key="n.notificacionUsuarioId"
              clickable
              :class="{ 'bg-blue-1': !n.leida }"
              @click="notifStore.marcarLeida(n.notificacionUsuarioId)"
            >
              <q-item-section>
                <q-item-label class="text-weight-medium">{{ n.titulo }}</q-item-label>
                <q-item-label caption lines="2">{{ n.mensaje }}</q-item-label>
                <q-item-label caption>{{
                  new Date(n.fechaCreacion).toLocaleString()
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <q-btn v-if="authStore.isAuthenticated" flat round dense icon="account_circle" color="white">
        <q-menu anchor="bottom right" self="top right">
          <q-list style="min-width: 220px">
            <q-item>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{
                  authStore.user?.nombreUsuario
                }}</q-item-label>
                <q-item-label caption>{{ authStore.user?.correoElectronico }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item v-close-popup clickable :to="{ name: 'perfil' }">
              <q-item-section avatar>
                <q-icon name="person" />
              </q-item-section>
              <q-item-section>Usuario</q-item-section>
            </q-item>

            <q-item v-close-popup clickable :to="{ name: 'configuracion' }">
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>
              <q-item-section>Configuración</q-item-section>
            </q-item>

            <q-item v-close-popup clickable @click="onLogout">
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section>Cerrar sesión</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>

      <template v-else>
        <q-btn
          flat
          dense
          no-caps
          class="xchang-btn-ghost q-mr-xs"
          label="Iniciar sesión"
          :to="{ name: 'login' }"
        />
        <q-btn
          unelevated
          dense
          no-caps
          class="xchang-btn-cta q-px-md q-ml-sm"
          label="Registrarse"
          :to="{ name: 'register' }"
        />
      </template>
    </q-toolbar>
  </q-header>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificacionesStore } from '@/stores/notificaciones'
import WalletBar from '@/components/layout/WalletBar.vue'

defineEmits(['toggle-drawer'])

const router = useRouter()
const authStore = useAuthStore()
const notifStore = useNotificacionesStore()

let intervalo = null

function iniciarNotificaciones() {
  if (!authStore.isAuthenticated || intervalo) return

  notifStore.fetchContador()
  intervalo = setInterval(() => notifStore.fetchContador(), 30000)
}

function detenerNotificaciones() {
  if (intervalo) {
    clearInterval(intervalo)
    intervalo = null
  }
}

onMounted(() => {
  iniciarNotificaciones()
})

onUnmounted(() => {
  detenerNotificaciones()
})

watch(
  () => authStore.isAuthenticated,
  (autenticado) => {
    if (autenticado) iniciarNotificaciones()
    else detenerNotificaciones()
  },
)

function onAbrirNotificaciones() {}

async function onLogout() {
  detenerNotificaciones()
  await authStore.logout()
  router.push({ name: 'landing' })
}
</script>

<style scoped>
.xchang-header {
  background: linear-gradient(135deg, #0d1b3e 0%, #1a306e 55%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 2px 24px rgba(15, 23, 42, 0.45);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.xchang-toolbar {
  min-height: 64px;
}

.xchang-logo-badge {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.xchang-logo-text {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.xchang-btn-ghost {
  color: rgba(255, 255, 255, 0.92) !important;
  border: 1px solid rgba(255, 255, 255, 0.22) !important;
  border-radius: 100px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  padding: 0 14px !important;
  transition: background 0.2s;
}

.xchang-btn-ghost:hover {
  background: rgba(255, 255, 255, 0.16) !important;
}

.xchang-btn-cta {
  background: linear-gradient(135deg, #60a5fa 0%, #818cf8 100%) !important;
  color: #0d1b3e !important;
  font-weight: 800 !important;
  border-radius: 100px !important;
  box-shadow: 0 4px 14px rgba(96, 165, 250, 0.35);
  transition: box-shadow 0.2s, transform 0.15s;
}

.xchang-btn-cta:hover {
  box-shadow: 0 6px 20px rgba(96, 165, 250, 0.5);
  transform: translateY(-1px);
}
</style>
