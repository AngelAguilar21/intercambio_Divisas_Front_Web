<template>
  <section id="como-funciona" class="xc-section xc-section--alt">
    <div class="xc-section-inner">
      <div class="xc-section-head">
        <span class="xc-section-kicker">
          <q-icon name="route" size="14px" />
          Cómo funciona
        </span>
        <h2 class="xc-section-title">Cuatro pasos para tu primer cambio</h2>
        <div class="xc-section-bar" aria-hidden="true" />
      </div>

      <div class="xc-pasos-grid">
        <div
          v-for="(paso, i) in pasos"
          :key="paso.titulo"
          class="xc-paso xc-enter"
          :style="{ '--xc-delay': `${i * 80}ms` }"
        >
          <div class="xc-paso-num-wrap">
            <div class="xc-paso-num">{{ i + 1 }}</div>
            <div v-if="i < pasos.length - 1" class="xc-paso-linea" />
          </div>
          <div class="xc-icon-badge xc-paso-icon">
            <q-icon :name="paso.icono" size="22px" color="primary" />
          </div>
          <div class="xc-paso-titulo">{{ paso.titulo }}</div>
          <div class="xc-paso-desc">{{ paso.descripcion }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const pasos = [
  {
    icono: 'person_add',
    titulo: 'Registra tu cuenta',
    descripcion: 'Crea tu cuenta en minutos con tu correo y datos básicos.',
  },
  {
    icono: 'fact_check',
    titulo: 'Verifica tu identidad',
    descripcion: 'Confirma tu identidad para proteger tu cuenta y tus fondos.',
  },
  {
    icono: 'sync_alt',
    titulo: 'Realiza el cambio',
    descripcion: 'Elige el par de divisas, el monto y confirma con la comisión ya visible.',
  },
  {
    icono: 'account_balance_wallet',
    titulo: 'Recibe tu dinero',
    descripcion: 'El monto convertido se acredita en tu billetera X-Chang al instante.',
  },
]
</script>

<style scoped>
.xc-pasos-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.xc-paso {
  text-align: center;
  padding: 0 8px;
}

.xc-paso-num-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.xc-paso-num {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--xchang-blue) 0%, var(--xchang-blue-dark) 100%);
  color: #ffffff;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 0 5px var(--xchang-blue-pale);
}

.xc-paso-linea {
  position: absolute;
  top: 50%;
  left: calc(50% + 20px);
  width: calc(100% - 20px);
  height: 3px;
  border-radius: 100px;
  background: linear-gradient(90deg, var(--xchang-blue) 0%, var(--xchang-blue-pale) 100%);
  transform: translateY(-50%);
}

.xc-paso-icon {
  margin: 0 auto 14px;
  transition: transform 0.25s ease;
}

.xc-paso:hover .xc-paso-icon {
  transform: scale(1.08);
}

.xc-paso-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: var(--xchang-page-text);
  margin-bottom: 8px;
}

.xc-paso-desc {
  font-size: 0.88rem;
  line-height: 1.55;
  color: var(--xchang-text-secondary);
}

@media (max-width: 1023px) {
  .xc-pasos-grid {
    grid-template-columns: repeat(2, 1fr);
    row-gap: 36px;
  }

  .xc-paso-linea {
    display: none;
  }
}

@media (max-width: 599px) {
  .xc-pasos-grid {
    grid-template-columns: 1fr;
  }
}
</style>
