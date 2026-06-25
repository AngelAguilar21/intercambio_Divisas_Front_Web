<template>
  <section id="beneficios" class="xc-section">
    <div class="xc-section-inner">
      <div class="xc-section-head">
        <span class="xc-section-kicker">
          <q-icon name="auto_awesome" size="14px" />
          Por qué X-Chang
        </span>
        <h2 class="xc-section-title">Una forma más inteligente de cambiar divisas</h2>
        <div class="xc-section-bar" aria-hidden="true" />
      </div>

      <div class="xc-benef-grid">
        <div
          v-for="(item, i) in beneficios"
          :key="item.titulo"
          class="xc-benef-card xc-card-accent-hover xc-enter"
          :style="{ '--xc-delay': `${i * 70}ms` }"
        >
          <div class="xc-icon-badge xc-benef-icon">
            <q-icon :name="item.icono" size="26px" color="primary" />
          </div>
          <div class="xc-benef-titulo">{{ item.titulo }}</div>
          <div class="xc-benef-desc">{{ item.descripcion }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const beneficios = [
  {
    icono: 'trending_up',
    titulo: 'Mejor tipo de cambio',
    descripcion:
      'Accede a precios competitivos definidos por el propio mercado de usuarios, sin márgenes ocultos de intermediarios.',
  },
  {
    icono: 'bolt',
    titulo: 'Operaciones rápidas',
    descripcion:
      'Ejecuta compras y ventas inmediatas o programa órdenes; tu dinero se liquida en minutos, no en días.',
  },
  {
    icono: 'shield',
    titulo: 'Seguridad garantizada',
    descripcion:
      'Verificación de identidad, fondos resguardados en billetera propia y monitoreo continuo de cada operación.',
  },
  {
    icono: 'visibility',
    titulo: 'Transparencia total',
    descripcion:
      'Tasa, comisión y monto final visibles antes de confirmar. Sin letras pequeñas ni costos sorpresa.',
  },
]
</script>

<style scoped>
.xc-benef-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.xc-benef-card {
  background: var(--xchang-surface);
  border: 1px solid var(--xchang-border);
  border-radius: var(--xchang-radius-lg);
  padding: 30px 22px;
  box-shadow: var(--xchang-shadow-sm);
}

.xc-benef-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 18px;
  transition: transform 0.25s ease;
}

.xc-benef-card:hover .xc-benef-icon {
  transform: scale(1.08);
}

.xc-benef-titulo {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--xchang-page-text);
  margin-bottom: 8px;
}

.xc-benef-desc {
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--xchang-text-secondary);
}

@media (max-width: 1023px) {
  .xc-benef-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 599px) {
  .xc-benef-grid {
    grid-template-columns: 1fr;
  }
}
</style>
