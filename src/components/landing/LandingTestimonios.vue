<template>
  <section id="testimonios" class="xc-section">
    <div class="xc-section-inner">
      <div class="xc-section-head">
        <span class="xc-section-kicker">
          <q-icon name="favorite" size="14px" />
          Testimonios
        </span>
        <h2 class="xc-section-title">Personas que ya cambian con X-Chang</h2>
        <div class="xc-section-bar" aria-hidden="true" />
      </div>

      <div class="xc-test-grid">
        <div
          v-for="(t, i) in testimonios"
          :key="t.nombre"
          class="xc-test-card xc-card-accent-hover xc-enter"
          :style="{ '--xc-delay': `${i * 80}ms` }"
        >
          <q-icon name="format_quote" size="32px" class="xc-test-quote-icon" />
          <div class="xc-test-stars">
            <q-icon v-for="n in 5" :key="n" name="star" size="16px" color="warning" />
          </div>
          <p class="xc-test-quote">“{{ t.cita }}”</p>
          <div class="xc-test-autor">
            <div class="xc-test-avatar">{{ t.iniciales }}</div>
            <div>
              <div class="xc-test-nombre">{{ t.nombre }}</div>
              <div class="xc-test-rol">{{ t.rol }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const testimonios = [
  {
    iniciales: 'MR',
    nombre: 'Mariana Rojas',
    rol: 'Freelancer, cobra en USD',
    cita:
      'Antes perdía tiempo comparando casas de cambio. Ahora veo la comisión antes de confirmar y el dinero llega a mi cuenta el mismo día.',
  },
  {
    iniciales: 'JC',
    nombre: 'Jorge Castillo',
    rol: 'Pequeño importador',
    cita:
      'El libro de órdenes me permite poner mi propio precio cuando no tengo apuro, y usar la compra inmediata cuando sí lo necesito.',
  },
  {
    iniciales: 'LA',
    nombre: 'Lucía Alvarado',
    rol: 'Estudiante con beca en el extranjero',
    cita:
      'La verificación fue rápida y el seguimiento de mis operaciones en el historial me da mucha tranquilidad.',
  },
]
</script>

<style scoped>
.xc-test-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.xc-test-card {
  background: var(--xchang-surface);
  border: 1px solid var(--xchang-border);
  border-radius: var(--xchang-radius-lg);
  padding: 28px 24px;
  box-shadow: var(--xchang-shadow-sm);
  display: flex;
  flex-direction: column;
}

.xc-test-quote-icon {
  position: absolute;
  top: 18px;
  right: 20px;
  color: var(--xchang-blue-pale);
}

.xc-test-stars {
  display: flex;
  gap: 2px;
  margin-bottom: 14px;
}

.xc-test-quote {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--xchang-page-text);
  flex: 1;
  margin: 0 0 20px;
}

.xc-test-autor {
  display: flex;
  align-items: center;
  gap: 12px;
}

.xc-test-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--xchang-blue-pale);
  color: var(--xchang-blue-dark);
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.xc-test-nombre {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--xchang-page-text);
}

.xc-test-rol {
  font-size: 0.78rem;
  color: var(--xchang-text-secondary);
}

@media (max-width: 1023px) {
  .xc-test-grid {
    grid-template-columns: 1fr;
  }
}
</style>
