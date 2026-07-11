<template>
  <q-header bordered class="xc-landing-header">
    <q-toolbar class="xc-landing-toolbar">
      <div class="xc-landing-logo">
        <q-icon name="currency_exchange" size="24px" color="primary" />
        <span>X-Chang</span>
      </div>

      <q-space />

      <nav class="xc-landing-nav" aria-label="Secciones">
        <a href="#beneficios">Beneficios</a>
        <a href="#como-funciona">Cómo funciona</a>
        <a href="#testimonios">Testimonios</a>
        <a href="#faq">FAQ</a>
      </nav>

      <q-space class="xc-landing-nav-spacer" />

      <q-btn
        outline
        no-caps
        color="primary"
        label="Iniciar sesión"
        class="q-mr-sm xc-login-btn"
        :to="{ name: 'login' }"
      />
      <q-btn unelevated no-caps color="primary" label="Crear cuenta" :to="{ name: 'register' }" />
    </q-toolbar>
  </q-header>
</template>

<script setup></script>

<style scoped>
.xc-landing-header {
  background: var(--xchang-surface);
  color: var(--xchang-page-text);
  border-color: var(--xchang-border);
}

.xc-landing-toolbar {
  max-width: 1180px;
  margin: 0 auto;
  width: 100%;
  padding: 10px 24px;
}

.xc-landing-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--xchang-page-text);
  white-space: nowrap;
  flex-shrink: 0;
}

.xc-landing-nav {
  display: flex;
  gap: 28px;
}

.xc-landing-nav a {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--xchang-text-secondary);
  text-decoration: none;
}

.xc-landing-nav a:hover {
  color: var(--xchang-blue);
}

@media (max-width: 1023px) {
  .xc-landing-nav,
  .xc-landing-nav-spacer {
    display: none;
  }
}

.xc-login-btn {
  font-weight: 700;
}
</style>
