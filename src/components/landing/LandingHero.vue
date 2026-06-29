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
            <q-icon :name="badge.icono" size="16px" color="white" style="opacity: 0.75" />
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
  background: linear-gradient(160deg, #0d1b3e 0%, #1a306e 38%, #1e3a8a 60%, #dbeafe 100%);
  padding: 72px 24px 88px;
  position: relative;
  overflow: hidden;
}

/* Decorative glow blobs */
.xc-hero::before {
  content: '';
  position: absolute;
  top: -80px;
  right: -80px;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%);
  pointer-events: none;
}

.xc-hero::after {
  content: '';
  position: absolute;
  bottom: -60px;
  left: -60px;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.14) 0%, transparent 70%);
  pointer-events: none;
}

.xc-hero-inner {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 56px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.xc-hero-kicker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #93c5fd;
  background: rgba(147, 197, 253, 0.12);
  border: 1px solid rgba(147, 197, 253, 0.25);
  padding: 6px 14px;
  border-radius: 100px;
  margin-bottom: 18px;
}

.xc-hero-title {
  font-size: clamp(2.1rem, 4vw, 3.2rem);
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #ffffff;
  margin: 0 0 18px;
}

.xc-hero-title-accent {
  background: linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.xc-hero-subtitle {
  font-size: 1.05rem;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.65);
  max-width: 520px;
  margin: 0 0 32px;
}

.xc-hero-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
}

.xc-hero-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 100px;
  padding: 6px 14px;
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
    padding: 48px 16px 60px;
  }
}
</style>
