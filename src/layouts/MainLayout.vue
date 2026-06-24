<template>
  <q-layout view="lHh Lpr lFf" class="xc-layout">
    <!-- Sidebar -->
    <q-drawer
      v-model="drawer"
      :width="240"
      :breakpoint="768"
      show-if-above
      class="xc-sidebar"
    >
      <!-- Brand -->
      <div class="xc-sidebar__brand">
        <div class="xc-sidebar__logo">
          <span class="xc-sidebar__logo-icon">X</span>
        </div>
        <div>
          <div class="xc-sidebar__brand-name">X-Chang</div>
          <div class="xc-sidebar__brand-sub">Exchange Platform</div>
        </div>
      </div>

      <hr class="xc-divider xc-sidebar__sep" />

      <!-- Navigation -->
      <q-list class="xc-nav" padding>
        <q-item
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          exact
          clickable
          v-ripple
          class="xc-nav__item"
          active-class="xc-nav__item--active"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" size="20px" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="xc-nav__label">{{ item.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Spacer -->
      <q-space />

      <!-- User footer -->
      <div class="xc-sidebar__user">
        <q-avatar size="36px" class="xc-sidebar__avatar">
          <span>{{ userInitials }}</span>
        </q-avatar>
        <div class="xc-sidebar__user-info">
          <div class="xc-sidebar__user-name">{{ userName }}</div>
          <div class="xc-sidebar__user-email">{{ userEmail }}</div>
        </div>
        <q-btn flat round dense icon="logout" size="sm" class="xc-sidebar__logout" @click="logout" />
      </div>
    </q-drawer>

    <!-- Top Header (mobile) -->
    <q-header class="xc-header" bordered>
      <q-toolbar>
        <q-btn flat round dense icon="menu" class="xc-header__menu" @click="drawer = !drawer" />
        <div class="xc-header__title">X-Chang</div>
        <q-space />
        <q-btn flat round dense icon="notifications_none" class="xc-header__action">
          <q-badge color="negative" floating rounded>3</q-badge>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Page content -->
    <q-page-container class="xc-content">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const drawer = ref(false)

const userName = computed(() => authStore.user?.nombreUsuario || 'Usuario')
const userEmail = computed(() => authStore.user?.correoElectronico || '')
const userInitials = computed(() => (authStore.user?.nombreUsuario || 'U').slice(0, 2).toUpperCase())

const navItems = [
  { path: '/',         icon: 'dashboard',              label: 'Dashboard' },
  { path: '/exchange', icon: 'currency_exchange',       label: 'Intercambio' },
  { path: '/wallet',   icon: 'account_balance_wallet',  label: 'Billetera' },
  { path: '/orders',   icon: 'receipt_long',            label: 'Órdenes' },
  { path: '/history',  icon: 'history',                 label: 'Historial' },
  { path: '/profile',  icon: 'person_outline',          label: 'Perfil' },
]

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.xc-layout {
  background: var(--xc-bg);
}

// ── Sidebar ──────────────────────────────────────────────
.xc-sidebar {
  background: #fff;
  border-right: 1px solid var(--xc-border-light) !important;
  display: flex;
  flex-direction: column;
}

.xc-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px 20px;
}

.xc-sidebar__logo {
  width: 40px;
  height: 40px;
  background: var(--xc-primary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.xc-sidebar__logo-icon {
  color: #fff;
  font-size: 1.2rem;
  font-weight: 800;
  font-style: italic;
}

.xc-sidebar__brand-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--xc-text);
  letter-spacing: -.01em;
}

.xc-sidebar__brand-sub {
  font-size: .7rem;
  color: var(--xc-text-secondary);
  margin-top: 1px;
}

.xc-sidebar__sep {
  margin: 0 16px 8px;
  background: var(--xc-border-light);
}

// Navigation
.xc-nav {
  padding: 4px 10px !important;
}

.xc-nav__item {
  border-radius: 10px !important;
  margin-bottom: 2px;
  min-height: 42px;
  color: var(--xc-text-secondary);
  transition: background .15s ease, color .15s ease;

  &:hover {
    background: var(--xc-bg) !important;
    color: var(--xc-text);
  }
}

:deep(.xc-nav__item--active) {
  background: var(--xc-primary-light) !important;
  color: var(--xc-primary) !important;

  .q-icon { color: var(--xc-primary); }
}

.xc-nav__label {
  font-size: .875rem;
  font-weight: 500;
}

// User section
.xc-sidebar__user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 16px;
  border-top: 1px solid var(--xc-border-light);
  margin-top: auto;
}

.xc-sidebar__avatar {
  background: var(--xc-primary);
  color: #fff;
  font-size: .8rem;
  font-weight: 600;
  flex-shrink: 0;
}

.xc-sidebar__user-info {
  flex: 1;
  min-width: 0;
}

.xc-sidebar__user-name {
  font-size: .85rem;
  font-weight: 600;
  color: var(--xc-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.xc-sidebar__user-email {
  font-size: .7rem;
  color: var(--xc-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.xc-sidebar__logout {
  color: var(--xc-text-tertiary);
  flex-shrink: 0;
  &:hover { color: var(--xc-negative); }
}

// ── Header (mobile) ──────────────────────────────────────
.xc-header {
  background: rgba(255,255,255,.92) !important;
  backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--xc-border-light) !important;
  color: var(--xc-text) !important;
}

.xc-header__menu,
.xc-header__action { color: var(--xc-text); }

.xc-header__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--xc-text);
  letter-spacing: -.01em;
}

// ── Content ───────────────────────────────────────────────
.xc-content {
  background: var(--xc-bg);
}
</style>
