<template>
  <div class="fullscreen xc-404 flex flex-center text-center q-pa-md">
    <div class="xc-enter">
      <q-icon name="explore_off" size="64px" class="q-mb-md" style="opacity: 0.9" />
      <div class="text-h1 text-weight-bold">404</div>
      <div class="text-h6 q-mb-xl" style="opacity: 0.85">
        No encontramos esta pantalla. Quizás cambió de moneda.
      </div>

      <q-btn unelevated color="white" text-color="primary" to="/" label="Volver al inicio" />
    </div>
  </div>
</template>

<style scoped>
.xc-404 {
  background: var(--q-primary);
  color: #fff;
}
</style>
