<template>
  <q-drawer
    :model-value="modelValue"
    show-if-above
    bordered
    class="xchang-drawer"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <q-list class="q-pa-sm">
      <q-item-label header>Navegación</q-item-label>

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
          <q-icon :name="link.icon" />
        </q-item-section>
        <q-item-section>{{ link.label }}</q-item-section>
      </q-item>

      <template v-if="authStore.isAdmin">
        <q-separator class="q-my-sm" />
        <q-item-label header>Administrador</q-item-label>

        <q-item
          v-for="link in adminLinks"
          :key="link.key"
          v-ripple
          clickable
          class="xchang-nav-item"
          :class="{ 'xchang-nav-active': esActivo(link) }"
          :to="{ name: link.name }"
        >
          <q-item-section avatar>
            <q-icon :name="link.icon" />
          </q-item-section>
          <q-item-section>{{ link.label }}</q-item-section>
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

const adminLinks = [
  {
    key: 'admin-dashboard',
    name: 'admin-dashboard',
    label: 'Administración',
    icon: 'admin_panel_settings',
    matches: ['admin-dashboard'],
  },
  {
    key: 'admin-usuarios',
    name: 'admin-usuarios',
    label: 'Gestión de usuarios',
    icon: 'manage_accounts',
    matches: ['admin-usuarios'],
  },
  {
    key: 'admin-auditoria',
    name: 'admin-auditoria',
    label: 'Log de auditoría',
    icon: 'fact_check',
    matches: ['admin-auditoria'],
  },
]

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

.xchang-nav-item {
  border-radius: var(--xchang-radius-sm);
  margin-bottom: 2px;
  color: var(--xchang-text-secondary);
}

.xchang-nav-active {
  background: var(--xchang-blue-pale);
  color: var(--q-primary);
  font-weight: 700;
}
</style>
