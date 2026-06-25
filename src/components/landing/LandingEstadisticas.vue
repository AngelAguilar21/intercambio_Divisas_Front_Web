<template>
  <section class="xc-stats">
    <div class="xc-stats-inner">
      <div
        v-for="(stat, i) in estadisticas"
        :key="stat.label"
        class="xc-stat xc-enter"
        :style="{ '--xc-delay': `${i * 70}ms` }"
      >
        <div class="xc-stat-valor xc-figure">{{ stat.valor }}</div>
        <div class="xc-stat-label">{{ stat.label }}</div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Cifras de referencia para comunicar escala de la plataforma; X-Chang aún no expone
// un endpoint público de métricas agregadas, por lo que se mantienen como contenido
// editorial del landing (no se presentan como datos en vivo).
const estadisticas = [
  { valor: 'US$ 48M+', label: 'Volumen transaccionado' },
  { valor: '120,000+', label: 'Usuarios activos' },
  { valor: '2.3M+', label: 'Operaciones realizadas' },
  { valor: '< 3 min', label: 'Tiempo promedio de procesamiento' },
]
</script>

<style scoped>
.xc-stats {
  background: linear-gradient(135deg, var(--xchang-blue) 0%, var(--xchang-blue-dark) 100%);
  padding: 56px 24px;
}

.xc-stats-inner {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  text-align: center;
}

.xc-stat-valor {
  font-size: clamp(1.8rem, 3vw, 2.4rem);
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.xc-stat-label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.78);
  margin-top: 6px;
}

@media (max-width: 1023px) {
  .xc-stats-inner {
    grid-template-columns: repeat(2, 1fr);
    row-gap: 32px;
  }
}
</style>
