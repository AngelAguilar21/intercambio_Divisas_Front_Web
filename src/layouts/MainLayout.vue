<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          <q-icon name="currency_exchange" class="q-mr-sm" />
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
          <q-btn flat dense label="Iniciar sesión" :to="{ name: 'login' }" />
          <q-btn flat dense label="Registrarse" :to="{ name: 'register' }" />
        </template>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Navegación</q-item-label>

        <q-item
          v-for="link in navLinks"
          :key="link.key"
          v-ripple
          clickable
          :to="link.name ? { name: link.name } : undefined"
          @click="link.action === 'logout' ? onLogout() : undefined"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>{{ link.label }}</q-item-section>
        </q-item>

        <template v-if="authStore.isAdmin">
          <q-separator class="q-my-sm" />
          <q-item-label header>Administrador</q-item-label>

          <q-item v-ripple clickable :to="{ name: 'admin-dashboard' }">
            <q-item-section avatar>
              <q-icon name="admin_panel_settings" />
            </q-item-section>
            <q-item-section>Administración</q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificacionesStore } from '@/stores/notificaciones'

const router = useRouter()
const authStore = useAuthStore()
const notifStore = useNotificacionesStore()
const leftDrawerOpen = ref(false)

const navLinks = computed(() => {
  const links = [
    { key: 'dashboard', name: 'dashboard', label: 'Menú principal', icon: 'home' },
    { key: 'monedas', name: 'monedas', label: 'Monedas', icon: 'paid' },
    { key: 'configuracion', name: 'configuracion', label: 'Configuración', icon: 'settings' },
  ]

  if (!authStore.isAuthenticated) {
    links.push({ key: 'login', name: 'login', label: 'Iniciar sesión', icon: 'login' })
    return links
  }

  return [
    { key: 'dashboard', name: 'dashboard', label: 'Menú principal', icon: 'home' },
    { key: 'monedas', name: 'monedas', label: 'Monedas', icon: 'paid' },
    { key: 'transacciones', name: 'transacciones', label: 'Transacciones', icon: 'receipt_long' },
    { key: 'historial', name: 'historial', label: 'Historial', icon: 'history' },
    { key: 'perfil', name: 'perfil', label: 'Usuario', icon: 'person' },
    { key: 'configuracion', name: 'configuracion', label: 'Configuración', icon: 'settings' },
    { key: 'logout', action: 'logout', label: 'Cerrar sesión', icon: 'logout' },
  ]
})

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
  router.push({ name: 'dashboard' })
}
</script>
