<template>
  <q-card flat bordered class="q-pa-md xc-stub">
    <div class="text-subtitle1 text-weight-medium q-mb-sm">Generar oferta de venta</div>
    <q-separator class="q-mb-md" />
    <div class="xc-stub-body flex flex-center column q-py-md">
      <q-icon name="sell" size="2rem" class="xc-stub-icon q-mb-sm" />
      <div class="text-body2 text-weight-medium">Componente US-014 — pendiente</div>
      <div class="text-caption q-mt-xs xc-stub-par">
        Par: {{ monedaOrigen }} / {{ monedaDestino }}
      </div>
    </div>
  </q-card>
</template>

<script setup>
defineProps({
  parMonedaId: { type: Number, required: true },
  monedaOrigen: { type: String, required: true },
  monedaDestino: { type: String, required: true },
})
</script>

<style scoped>
.xc-stub {
  border: 1px dashed var(--xchang-border);
  min-height: 140px;
}

.xc-stub-body {
  color: var(--xchang-text-secondary);
}

.xc-stub-icon {
  color: var(--xchang-text-secondary);
  opacity: 0.5;
}

.xc-stub-par {
  color: var(--xchang-text-secondary);
}
</style>
