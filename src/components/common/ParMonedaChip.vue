<template>
  <span class="row items-center no-wrap xc-par-chip">
    <span class="xc-moneda-chip">
      <img v-if="urlBandera(origen)" :src="urlBandera(origen)" :alt="origen" class="xc-bandera" />
      {{ origen }}
    </span>
    <q-icon name="arrow_forward" size="14px" class="q-mx-xs" style="opacity: 0.5" />
    <span class="xc-moneda-chip">
      <img
        v-if="urlBandera(destino)"
        :src="urlBandera(destino)"
        :alt="destino"
        class="xc-bandera"
      />
      {{ destino }}
    </span>
  </span>
</template>

<script setup>
import { urlBandera } from '@/utils/monedaBandera'

defineProps({
  origen: { type: String, required: true },
  destino: { type: String, required: true },
})
</script>

<style scoped>
.xc-moneda-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  background: var(--xchang-page-bg);
  border: 1px solid var(--xchang-border-light);
  color: var(--xchang-page-text);
}

.xc-bandera {
  width: 16px;
  height: 12px;
  object-fit: cover;
  border-radius: 2px;
  flex-shrink: 0;
}
</style>
