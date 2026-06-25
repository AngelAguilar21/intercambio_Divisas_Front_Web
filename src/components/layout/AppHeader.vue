<template>
  <q-header class="xchang-header">
    <q-toolbar>
      <q-btn flat dense round icon="menu" aria-label="Menu" @click="$emit('toggle-drawer')" />

      <q-toolbar-title class="row items-center no-wrap text-weight-bold">
        <q-icon name="currency_exchange" color="primary" class="q-mr-sm" />
        X-Chang
      </q-toolbar-title>

      <q-btn
        v-if="authStore.isAuthenticated"
        flat
        round
        dense
        icon="notifications"
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

      <q-btn v-if="authStore.isAuthenticated" flat round dense icon="account_circle">
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
        <q-btn flat dense color="primary" label="Iniciar sesión" :to="{ name: 'login' }" />
        <q-btn
          unelevated
          dense
          color="primary"
          label="Registrarse"
          class="q-px-md q-ml-sm"
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
  background: var(--xchang-surface);
  color: var(--xchang-page-text);
  box-shadow: var(--xchang-shadow-sm);
}
</style>
