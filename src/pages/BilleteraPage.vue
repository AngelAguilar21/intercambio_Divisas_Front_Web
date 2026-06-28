<template>
  <q-page class="q-pa-md">
    <div class="xc-page-head">
      <span class="xc-section-kicker">
        <q-icon name="account_balance_wallet" size="14px" />
        Billetera
      </span>
      <h1 class="xc-section-title">Mi billetera</h1>
      <div class="xc-section-bar" aria-hidden="true" />
      <p class="xc-page-head-desc">Saldo disponible por cada moneda de tu cuenta.</p>
    </div>

    <div v-if="cargando" class="row q-col-gutter-md">
      <div v-for="n in 4" :key="n" class="col-12 col-sm-6 col-md-4">
        <q-skeleton height="140px" class="xc-wallet-skeleton" />
      </div>
    </div>

    <q-banner v-else-if="saldos.length === 0" dense class="xchang-banner xchang-banner--empty">
      No existen fondos disponibles
    </q-banner>

    <div v-else class="row q-col-gutter-md">
      <div v-for="(saldo, i) in saldos" :key="saldo.monedaId" class="col-12 col-sm-6 col-md-4">
        <q-card
          flat
          bordered
          class="xc-wallet-card xc-card-accent-hover xc-enter"
          :style="{ '--xc-delay': `${i * 70}ms` }"
        >
          <div class="row items-center justify-between">
            <div class="row items-center q-gutter-sm">
              <img
                v-if="urlBandera(saldo.codigoISO)"
                :src="urlBandera(saldo.codigoISO, 80)"
                :alt="saldo.codigoISO"
                class="xc-wallet-bandera"
              />
              <div>
                <div class="xc-wallet-code">{{ saldo.codigoISO }}</div>
                <div class="xc-wallet-nombre">{{ saldo.nombre }}</div>
              </div>
            </div>
          </div>

          <div class="xc-wallet-saldo xc-figure">
            {{ formatearSaldo(saldo.saldoDisponible) }}
          </div>
          <div class="xc-wallet-label">Saldo disponible</div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useBilleteraStore } from '@/stores/billetera'
import { urlBandera } from '@/utils/monedaBandera'

const billeteraStore = useBilleteraStore()

const cargando = computed(() => billeteraStore.cargando && !billeteraStore.cargado)
const saldos = computed(() => billeteraStore.saldos.filter((s) => s.saldoDisponible > 0))

function formatearSaldo(valor) {
  return Number(valor).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

onMounted(() => {
  if (!billeteraStore.cargado) billeteraStore.cargar()
})
</script>

<style scoped>
.xc-wallet-card {
  padding: 20px;
  min-height: 140px;
}

.xc-wallet-bandera {
  width: 40px;
  height: 30px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.xc-wallet-code {
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.xc-wallet-nombre {
  font-size: 0.78rem;
  color: var(--xchang-text-secondary);
}

.xc-wallet-saldo {
  font-size: 1.7rem;
  font-weight: 800;
  margin-top: 18px;
  color: var(--xchang-page-text);
}

.xc-wallet-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--xchang-text-secondary);
  margin-top: 2px;
}

.xc-wallet-skeleton {
  border-radius: var(--xchang-radius-lg);
}
</style>
