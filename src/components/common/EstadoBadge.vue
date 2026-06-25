<template>
  <span class="xc-estado-badge" :class="clase">{{ estado }}</span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  estado: { type: String, required: true },
})

const clases = {
  Activa: 'xc-estado-activa',
  'Parcialmente ejecutada': 'xc-estado-parcial',
  Completada: 'xc-estado-completada',
  Cancelada: 'xc-estado-cancelada',
}

const clase = computed(() => clases[props.estado] || 'xc-estado-completada')
</script>

<style scoped>
.xc-estado-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
}

.xc-estado-activa {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}

.xc-estado-parcial {
  background: rgba(217, 119, 6, 0.14);
  color: #92400e;
}

.xc-estado-completada {
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
}

.xc-estado-cancelada {
  background: rgba(220, 38, 38, 0.1);
  color: #b91c1c;
}
</style>
