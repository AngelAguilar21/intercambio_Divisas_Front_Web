<template>
  <q-page class="q-pa-md">
    <div class="text-h5 text-weight-bold q-mb-xs">Mi billetera</div>
    <div class="text-body2 q-mb-lg" style="color: var(--xchang-text-secondary)">
      Saldo disponible por cada moneda de tu cuenta.
    </div>

    <div v-if="cargando" class="row q-col-gutter-md">
      <div v-for="n in 4" :key="n" class="col-12 col-sm-6 col-md-4">
        <q-skeleton height="140px" class="xc-wallet-skeleton" />
      </div>
    </div>

    <q-banner v-else-if="saldos.length === 0" dense class="xchang-banner xchang-banner--empty">
      Aún no tienes saldos registrados en tu billetera.
    </q-banner>

    <div v-else class="row q-col-gutter-md">
      <div v-for="(saldo, i) in saldos" :key="saldo.monedaId" class="col-12 col-sm-6 col-md-4">
        <q-card
          flat
          bordered
          class="xc-wallet-card xc-enter"
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
import { computed, onMounted, ref } from 'vue'
import { getBilletera } from '@/services/billetera'
import { urlBandera } from '@/utils/monedaBandera'

const billetera = ref(null)
const cargando = ref(false)

const saldos = computed(() => billetera.value?.saldos || [])

function formatearSaldo(valor) {
  return Number(valor).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

onMounted(async () => {
  cargando.value = true
  try {
    const { data } = await getBilletera()
    billetera.value = data
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.xc-wallet-card {
  padding: 20px;
  min-height: 140px;
  border-left: 4px solid var(--xchang-accent);
  transition: border-color 0.2s ease;
}

.xc-wallet-card:hover {
  border-left-color: var(--q-primary);
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
