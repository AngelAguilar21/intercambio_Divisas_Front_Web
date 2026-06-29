<template>
  <q-card flat bordered class="xc-mc-card xc-card-accent xc-enter">
    <!-- Card header -->
    <div class="xc-mc-header">
      <div class="xc-mc-header-icon">
        <q-icon name="swap_horiz" size="18px" color="white" />
      </div>
      <div class="col">
        <div class="xc-mc-header-title">Cambiar divisas</div>
        <div class="xc-mc-header-sub">Ejecución inmediata al mejor precio</div>
      </div>
    </div>

    <div class="xc-mc-body">
    <div class="xc-mc-field-group">
      <label class="xc-mc-label">Envías</label>
      <div class="xc-mc-field">
        <q-input
          v-model.number="monto"
          type="number"
          min="0"
          dense
          borderless
          class="xc-mc-input"
          input-class="xc-mc-input-text"
        />
        <q-select
          v-model="monedaOrigen"
          dense
          borderless
          emit-value
          map-options
          :options="opcionesMoneda"
          class="xc-mc-select"
        />
      </div>
    </div>

    <div class="xc-mc-swap-wrap">
      <div class="xc-mc-swap-line"></div>
      <q-btn
        round
        unelevated
        size="sm"
        icon="swap_vert"
        class="xc-mc-swap-btn"
        aria-label="Invertir monedas"
        @click="invertir"
      />
      <div class="xc-mc-swap-line"></div>
    </div>

    <div class="xc-mc-field-group">
      <label class="xc-mc-label">Recibes (estimado)</label>
      <div class="xc-mc-field">
        <div class="xc-mc-resultado xc-figure">
          {{ cargandoResumen ? '…' : formatearMonto(totalARecibir) }}
        </div>
        <q-select
          v-model="monedaDestino"
          dense
          borderless
          emit-value
          map-options
          :options="opcionesMoneda"
          class="xc-mc-select"
        />
      </div>
    </div>

    </div><!-- /.xc-mc-body -->

    <div class="xc-mc-rates">
    <q-separator class="q-mb-md" />

    <q-banner v-if="errorMessage" dense rounded class="xchang-banner xchang-banner--error q-mb-sm">
      {{ errorMessage }}
    </q-banner>

    <template v-if="resumen">
      <div class="xc-mc-info-row">
        <span>Tasa aplicada</span>
        <span class="xc-figure">{{ formatearMonto(resumen.precioPromedioCompra, 4) }}</span>
      </div>
      <div class="xc-mc-info-row">
        <span>Comisión</span>
        <span class="xc-figure">
          {{
            resumen.comisionAplicada !== undefined && resumen.comisionAplicada !== null
              ? `${formatearMonto(resumen.comisionAplicada)} ${monedaDestino}`
              : 'Incluida en la tasa mostrada'
          }}
        </span>
      </div>
      <div class="xc-mc-info-row xc-mc-info-row--total">
        <span>Total a recibir</span>
        <span class="xc-figure">{{ formatearMonto(totalARecibir) }} {{ monedaDestino }}</span>
      </div>

      <q-banner
        v-if="!resumen.liquidezSuficiente"
        dense
        rounded
        class="xchang-banner xchang-banner--warning q-mt-sm"
      >
        Liquidez parcial: solo se ejecutará {{ formatearMonto(resumen.cantidadEjecutable) }}
        {{ monedaOrigen }} al confirmar.
      </q-banner>

      <q-banner
        v-if="!resumen.saldoSuficiente"
        dense
        rounded
        class="xchang-banner xchang-banner--error q-mt-sm"
      >
        Saldo insuficiente en {{ monedaOrigen }}.
      </q-banner>
    </template>

    <q-btn
      unelevated
      size="lg"
      no-caps
      class="full-width q-mt-md xc-mc-cta"
      label="Confirmar cambio"
      icon-right="check_circle"
      :loading="confirmando"
      :disable="!puedeConfirmar"
      @click="confirmarCambio"
    />
    </div><!-- /.xc-mc-rates -->
  </q-card>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { Notify } from 'quasar'
import { getMonedas } from '@/services/monedas'
import { resolveParMonedaId } from '@/services/preciosPares'
import { getResumen, confirmar } from '@/services/ventaInmediata'
import { formatearMonto } from '@/utils/formato'

const emit = defineEmits(['cambio-confirmado'])

const monedas = ref([])
const monedaOrigen = ref('USD')
const monedaDestino = ref('PEN')
const monto = ref(100)

const parMonedaId = ref(null)
const resumen = ref(null)
const cargandoResumen = ref(false)
const confirmando = ref(false)
const errorMessage = ref('')

const opcionesMoneda = computed(() =>
  monedas.value.map((m) => ({ label: m.codigoISO, value: m.codigoISO })),
)

const totalARecibir = computed(() => Number(resumen.value?.totalEstimadoARecibir) || 0)

const puedeConfirmar = computed(
  () => !!resumen.value && resumen.value.saldoSuficiente && Number(monto.value) > 0,
)

let temporizador = null

watch([monedaOrigen, monedaDestino, monto], () => {
  clearTimeout(temporizador)
  temporizador = setTimeout(cargarResumen, 350)
})

onMounted(async () => {
  await cargarMonedas()
  await cargarResumen()
})

async function cargarMonedas() {
  try {
    const { data } = await getMonedas()
    monedas.value = Array.isArray(data) ? data : data.monedas || data.registros || []
  } catch {
    monedas.value = []
  }
}

function invertir() {
  const anterior = monedaOrigen.value
  monedaOrigen.value = monedaDestino.value
  monedaDestino.value = anterior
}

async function cargarResumen() {
  errorMessage.value = ''
  resumen.value = null

  if (monedaOrigen.value === monedaDestino.value || !Number(monto.value) || monto.value <= 0) {
    return
  }

  cargandoResumen.value = true

  try {
    parMonedaId.value = await resolveParMonedaId(monedaOrigen.value, monedaDestino.value)

    if (!parMonedaId.value) {
      errorMessage.value = 'No existe un par de monedas para esa combinación.'
      return
    }

    const { data } = await getResumen({
      parMonedaId: parMonedaId.value,
      cantidadAVender: monto.value,
    })

    resumen.value = data
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo calcular el resumen.'
  } finally {
    cargandoResumen.value = false
  }
}

async function confirmarCambio() {
  confirmando.value = true
  errorMessage.value = ''

  try {
    const { data } = await confirmar({
      parMonedaId: parMonedaId.value,
      cantidadAVender: monto.value,
      venderCantidadDisponible: !resumen.value.liquidezSuficiente,
    })

    Notify.create({ type: 'positive', message: 'Cambio ejecutado correctamente.' })
    resumen.value = null
    emit('cambio-confirmado', data)
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo confirmar el cambio.'
  } finally {
    confirmando.value = false
  }
}
</script>

<style scoped>
.xc-mc-card {
  overflow: hidden;
}

/* Header */
.xc-mc-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #0d1b3e 0%, #1a306e 55%, #2563eb 100%);
  color: #ffffff;
}

.xc-mc-header-icon {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.xc-mc-header-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}

.xc-mc-header-sub {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

/* Body */
.xc-mc-body {
  padding: 12px 20px 8px;
}

.xc-mc-field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 0;
}

.xc-mc-label {
  font-size: 0.70rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--xchang-text-secondary);
}

.xc-mc-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--xchang-page-bg);
  border: 1.5px solid var(--xchang-border);
  border-radius: var(--xchang-radius-sm);
  padding: 2px 10px 2px 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.xc-mc-field:focus-within {
  border-color: var(--xchang-blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.xc-mc-input {
  flex: 1;
  min-width: 0;
}

.xc-mc-input-text {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--xchang-page-text);
}

.xc-mc-resultado {
  flex: 1;
  min-width: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--xchang-blue);
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 8px 0;
}

.xc-mc-select {
  width: 100px;
  flex: none;
  font-weight: 700;
}

/* Swap */
.xc-mc-swap-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}

.xc-mc-swap-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--xchang-border), transparent);
}

.xc-mc-swap-btn {
  background: linear-gradient(135deg, #2563eb, #6366f1) !important;
  color: #ffffff !important;
  width: 32px;
  height: 32px;
  box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
  flex-shrink: 0;
  transition: box-shadow 0.2s, transform 0.2s;
}

.xc-mc-swap-btn:hover {
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.45) !important;
  transform: scale(1.1);
}

/* Rates section */
.xc-mc-rates {
  padding: 0 20px 20px;
}

.xc-mc-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.83rem;
  color: var(--xchang-text-secondary);
  padding: 5px 0;
}

.xc-mc-info-row--total {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--xchang-page-text);
  padding-top: 10px;
  border-top: 1px solid var(--xchang-border-light);
  margin-top: 4px;
}

/* CTA */
.xc-mc-cta {
  height: 48px;
  font-size: 0.95rem;
  font-weight: 700;
  border-radius: 12px !important;
  background: linear-gradient(135deg, #2563eb 0%, #6366f1 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 5px 16px rgba(37, 99, 235, 0.28) !important;
  transition: box-shadow 0.2s, transform 0.15s;
}

.xc-mc-cta:not([disabled]):hover {
  box-shadow: 0 7px 22px rgba(37, 99, 235, 0.45) !important;
  transform: translateY(-1px);
}
</style>
