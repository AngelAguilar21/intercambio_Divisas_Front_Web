<template>
  <q-drawer
    :model-value="modelValue"
    show-if-above
    bordered
    class="xchang-drawer"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- Brand header -->
    <div class="xchang-drawer-brand">
      <div class="xchang-drawer-logo-badge">
        <q-icon name="currency_exchange" size="18px" color="white" />
      </div>
      <span class="xchang-drawer-logo-text">X-Chang</span>
    </div>

    <q-separator />

    <q-list class="q-pa-sm q-pt-md">
      <q-item-label header class="xchang-nav-header">Navegación</q-item-label>

      <q-item
        v-for="link in navLinks"
        :key="link.key"
        v-ripple
        clickable
        class="xchang-nav-item"
        :class="{ 'xchang-nav-active': esActivo(link) }"
        :to="link.name ? { name: link.name } : undefined"
        @click="link.action === 'logout' ? onLogout() : undefined"
      >
        <q-item-section avatar>
          <div class="xchang-nav-icon-wrap" :class="{ 'xchang-nav-icon-wrap--active': esActivo(link) }">
            <q-icon :name="link.icon" size="18px" />
          </div>
        </q-item-section>
        <q-item-section>{{ link.label }}</q-item-section>
      </q-item>

      <template v-if="authStore.isAdmin">
        <q-separator class="q-my-sm" />
        <q-item-label header class="xchang-nav-header">Administrador</q-item-label>

        <q-item
          v-ripple
          clickable
          class="xchang-nav-item"
          :class="{ 'xchang-nav-active': route.name === 'admin-dashboard' }"
          :to="{ name: 'admin-dashboard' }"
        >
          <q-item-section avatar>
            <div
              class="xchang-nav-icon-wrap"
              :class="{ 'xchang-nav-icon-wrap--active': route.name === 'admin-dashboard' }"
            >
              <q-icon name="admin_panel_settings" size="18px" />
            </div>
          </q-item-section>
          <q-item-section>Administración</q-item-section>
        </q-item>
      </template>
    </q-list>
  </q-drawer>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

defineProps({ modelValue: { type: Boolean, default: false } })
defineEmits(['update:modelValue'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navLinks = computed(() => {
  if (!authStore.isAuthenticated) {
    return [
      { key: 'landing', name: 'landing', label: 'Menú principal', icon: 'home' },
      {
        key: 'monedas',
        name: 'monedas',
        label: 'Monedas',
        icon: 'paid',
        matches: ['monedas', 'par-detalle'],
      },
      { key: 'configuracion', name: 'configuracion', label: 'Configuración', icon: 'settings' },
      { key: 'login', name: 'login', label: 'Iniciar sesión', icon: 'login' },
    ]
  }

  return [
    { key: 'dashboard', name: 'dashboard', label: 'Menú principal', icon: 'home' },
    {
      key: 'monedas',
      name: 'monedas',
      label: 'Monedas',
      icon: 'paid',
      matches: ['monedas', 'par-detalle'],
    },
    { key: 'transacciones', name: 'transacciones', label: 'Transacciones', icon: 'receipt_long' },
    { key: 'historial', name: 'historial', label: 'Historial', icon: 'history' },
    { key: 'perfil', name: 'perfil', label: 'Usuario', icon: 'person' },
    { key: 'configuracion', name: 'configuracion', label: 'Configuración', icon: 'settings' },
    { key: 'logout', action: 'logout', label: 'Cerrar sesión', icon: 'logout' },
  ]
})

function esActivo(link) {
  if (!link.name) return false
  if (link.matches) return link.matches.includes(route.name)
  return route.name === link.name
}

async function onLogout() {
  await authStore.logout()
  router.push({ name: 'landing' })
}
</script>

<style scoped>
.xchang-drawer {
  background: var(--xchang-surface);
  border-color: var(--xchang-border-light);
}

/* Brand header inside drawer */
.xchang-drawer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 20px 18px;
  background: linear-gradient(135deg, #0d1b3e 0%, #1a306e 55%, #2563eb 100%);
}

.xchang-drawer-logo-badge {
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

.xchang-drawer-logo-text {
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #ffffff;
}

/* Nav section label */
.xchang-nav-header {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--xchang-text-secondary);
  padding-bottom: 6px;
}

/* Nav items */
.xchang-nav-item {
  border-radius: var(--xchang-radius-sm);
  margin-bottom: 2px;
  color: var(--xchang-text-secondary);
  min-height: 44px;
  transition: background 0.15s;
}

.xchang-nav-item:hover {
  background: var(--xchang-blue-pale);
  color: var(--xchang-blue-dark);
}

.xchang-nav-active {
  background: var(--xchang-blue-pale);
  color: var(--xchang-blue);
  font-weight: 700;
}

/* Icon wrap */
.xchang-nav-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  color: inherit;
}

.xchang-nav-icon-wrap--active {
  background: linear-gradient(135deg, #2563eb, #6366f1);
  color: #ffffff;
  box-shadow: 0 3px 10px rgba(37, 99, 235, 0.3);
}

.xchang-nav-active .xchang-nav-icon-wrap--active {
  color: #ffffff;
}
</style>
