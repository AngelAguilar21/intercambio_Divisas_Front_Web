<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="leftDrawerOpen = !leftDrawerOpen" />

        <q-toolbar-title>
          <q-icon name="currency_exchange" class="q-mr-sm" />
          X-Chang
        </q-toolbar-title>

        <q-btn flat round dense icon="notifications" @click="onAbrirNotificaciones">
          <q-badge v-if="notifStore.noLeidas > 0" color="red" floating>{{ notifStore.noLeidas }}</q-badge>
          <q-menu anchor="bottom right" self="top right" @show="notifStore.fetchLista()">
            <q-list style="min-width: 320px; max-width: 380px">
              <q-item-label header class="row items-center">
                <span class="col">Notificaciones</span>
                <q-btn flat dense size="sm" label="Marcar todas leídas" @click="notifStore.marcarTodasLeidas()" />
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
                  <q-item-label caption>{{ new Date(n.fechaCreacion).toLocaleString() }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>

        <q-btn flat round dense icon="account_circle">
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 200px">
              <q-item>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ authStore.user?.nombreUsuario }}</q-item-label>
                  <q-item-label caption>{{ authStore.user?.correoElectronico }}</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item v-close-popup clickable :to="{ name: 'perfil' }">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>Mi perfil</q-item-section>
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
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header>Navegación</q-item-label>

        <q-item v-for="link in navLinks" :key="link.name" v-ripple clickable :to="{ name: link.name }">
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>{{ link.label }}</q-item-section>
        </q-item>

        <template v-if="authStore.isAdmin">
          <q-separator class="q-my-sm" />
          <q-item-label header>Administración</q-item-label>
          <q-item v-for="link in adminLinks" :key="link.name" v-ripple clickable :to="{ name: link.name }">
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>{{ link.label }}</q-item-section>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificacionesStore } from '@/stores/notificaciones'

const router = useRouter()
const authStore = useAuthStore()
const notifStore = useNotificacionesStore()
const leftDrawerOpen = ref(false)

const navLinks = computed(() => [
  { name: 'dashboard', label: 'Inicio', icon: 'home' },
  { name: 'billetera', label: 'Mi billetera', icon: 'account_balance_wallet' },
  { name: 'mercado', label: 'Mercado', icon: 'show_chart' },
  { name: 'mis-ofertas', label: 'Mis ofertas de venta', icon: 'sell' },
  { name: 'mis-ordenes', label: 'Mis órdenes de compra', icon: 'shopping_cart' },
  { name: 'compra-inmediata', label: 'Compra inmediata', icon: 'bolt' },
  { name: 'venta-inmediata', label: 'Venta inmediata', icon: 'bolt' },
  { name: 'deposito', label: 'Depositar', icon: 'add_card' },
  { name: 'retiro', label: 'Retirar', icon: 'payments' },
  { name: 'historial', label: 'Historial', icon: 'history' },
  { name: 'calificaciones', label: 'Calificaciones', icon: 'star' },
  { name: 'disputas', label: 'Disputas', icon: 'gavel' },
])

const adminLinks = [
  { name: 'admin-dashboard', label: 'Panel', icon: 'dashboard' },
  { name: 'admin-usuarios', label: 'Usuarios', icon: 'group' },
  { name: 'admin-disputas', label: 'Disputas', icon: 'gavel' },
  { name: 'admin-configuracion', label: 'Configuración', icon: 'settings' },
  { name: 'admin-reportes', label: 'Reportes', icon: 'summarize' },
  { name: 'admin-auditoria', label: 'Auditoría', icon: 'fact_check' },
]

let intervalo = null
onMounted(() => {
  notifStore.fetchContador()
  intervalo = setInterval(() => notifStore.fetchContador(), 30000)
})
onUnmounted(() => {
  if (intervalo) clearInterval(intervalo)
})

function onAbrirNotificaciones() {
  // El contenido se carga al abrir el menú (@show); el click solo alterna el botón.
}

async function onLogout() {
  await authStore.logout()
  router.push({ name: 'login' })
}
</script>
