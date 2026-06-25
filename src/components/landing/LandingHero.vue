<template>
  <section class="xc-hero">
    <div class="xc-hero-inner">
      <div class="xc-hero-copy xc-enter">
        <span class="xc-hero-kicker">Cambio de divisas P2P</span>
        <h1 class="xc-hero-title">
          Cambia tus divisas al <span class="xc-hero-title-accent">mejor precio</span>, sin
          sorpresas
        </h1>
        <p class="xc-hero-subtitle">
          X-Chang conecta compradores y vendedores de divisas en un mercado abierto y
          transparente. Tú decides el precio, ves la comisión antes de confirmar y recibes tu
          dinero en minutos.
        </p>

        <div class="xc-hero-badges">
          <div v-for="badge in badges" :key="badge.texto" class="xc-hero-badge">
            <q-icon :name="badge.icono" size="18px" color="primary" />
            <span>{{ badge.texto }}</span>
          </div>
        </div>
      </div>

      <div class="xc-hero-calc xc-enter" style="--xc-delay: 120ms">
        <CurrencyCalculator />
      </div>
    </div>
  </section>
</template>

<script setup>
import CurrencyCalculator from '@/components/landing/CurrencyCalculator.vue'

const badges = [
  { icono: 'verified_user', texto: 'Identidad verificada' },
  { icono: 'lock', texto: 'Fondos protegidos' },
  { icono: 'bolt', texto: 'Liquidación en minutos' },
]
</script>

<style scoped>
.xc-hero {
  background: linear-gradient(180deg, var(--xchang-blue-pale) 0%, var(--xchang-page-bg) 65%);
  padding: 64px 24px 80px;
}

.xc-hero-inner {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 56px;
  align-items: center;
}

.xc-hero-kicker {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--xchang-blue-dark);
  background: var(--xchang-blue-pale);
  padding: 6px 14px;
  border-radius: 100px;
  margin-bottom: 18px;
}

.xc-hero-title {
  font-size: clamp(2.1rem, 4vw, 3.2rem);
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--xchang-page-text);
  margin: 0 0 18px;
}

.xc-hero-title-accent {
  color: var(--xchang-blue);
}

.xc-hero-subtitle {
  font-size: 1.05rem;
  line-height: 1.65;
  color: var(--xchang-text-secondary);
  max-width: 520px;
  margin: 0 0 28px;
}

.xc-hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
}

.xc-hero-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--xchang-page-text);
}

@media (max-width: 1023px) {
  .xc-hero-inner {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .xc-hero-copy {
    text-align: center;
  }

  .xc-hero-subtitle {
    margin-inline: auto;
  }

  .xc-hero-badges {
    justify-content: center;
  }
}

@media (max-width: 599px) {
  .xc-hero {
    padding: 40px 16px 56px;
  }
}
</style>
