<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="xchang-header">
      <q-toolbar>
        <q-toolbar-title class="row items-center no-wrap text-weight-bold">
          <q-icon name="currency_exchange" color="primary" class="q-mr-sm" />
          X-Chang
        </q-toolbar-title>
        <q-btn flat round dense icon="close" :to="{ name: 'dashboard' }" aria-label="Cerrar" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="flex flex-center q-pa-md">
        <div class="auth-card">
          <router-view />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 440px;
}

.xchang-header {
  background: var(--xchang-surface);
  color: var(--xchang-page-text);
  box-shadow: var(--xchang-shadow-sm);
}
</style>
