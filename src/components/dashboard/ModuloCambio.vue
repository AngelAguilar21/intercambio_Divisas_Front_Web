<template>
  <q-card flat bordered class="xc-mc-card xc-card-accent xc-enter">
    <div class="text-subtitle1 text-weight-bold q-mb-md">Cambiar divisas</div>

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
      <q-separator />
      <q-btn
        round
        unelevated
        size="sm"
        icon="swap_vert"
        class="xc-mc-swap-btn"
        aria-label="Invertir monedas"
        @click="invertir"
      />
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

    <q-separator class="q-my-md" />

    <q-banner v-if="errorMessage" dense rounded class="xchang-banner xchang-banner--error q-mb-sm">
      {{ errorMessage }}
    </q-banner>

    <template v-if="resumen">
      <div class="xc-mc-info-row">
        <span>Tasa aplicada</span>
        <span class="xc-figure">{{ formatearMonto(tasaAplicada, 4) }}</span>
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
        Saldo insuficiente
      </q-banner>
    </template>

    <q-btn
      unelevated
      color="primary"
      size="lg"
      no-caps
      class="full-width q-mt-md"
      label="Confirmar cambio"
      :loading="confirmando"
      :disable="!puedeConfirmar"
      @click="confirmarCambio"
    />
  </q-card>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { Notify } from 'quasar'
import { getMonedas } from '@/services/monedas'
import { getBilletera } from '@/services/billetera'
import { resolveParMonedaId } from '@/services/preciosPares'
import { getResumen, confirmar } from '@/services/ventaInmediata'
import { formatearMonto } from '@/utils/formato'
import { normalizarMensajeError } from '@/utils/validaciones'

const emit = defineEmits(['cambio-confirmado'])

const monedas = ref([])
const monedaOrigen = ref('PEN')
const monedaDestino = ref('USD')
const monto = ref(100)

const parMonedaId = ref(null)
const resumen = ref(null)
const cargandoResumen = ref(false)
const confirmando = ref(false)
const errorMessage = ref('')

const opcionesMoneda = computed(() =>
  monedas.value.map((m) => ({ label: m.codigoISO || m.codigoIso, value: m.codigoISO || m.codigoIso })),
)

const totalARecibir = computed(() => Number(resumen.value?.totalEstimadoARecibir) || 0)

const tasaAplicada = computed(() => {
  if (!Number(monto.value) || totalARecibir.value <= 0) return 0
  return totalARecibir.value / Number(monto.value)
})

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
  await cargarMonedaPrincipalDesdeBilletera()
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

async function cargarMonedaPrincipalDesdeBilletera() {
  try {
    const { data } = await getBilletera()
    const saldos = [...(data?.saldos || [])].sort((a, b) => Number(b.saldoDisponible) - Number(a.saldoDisponible))
    const principal = saldos.find((s) => Number(s.saldoDisponible) > 0)?.codigoISO

    if (principal) {
      monedaOrigen.value = principal
      monedaDestino.value = principal === 'USD' ? 'PEN' : 'USD'
    }
  } catch {
    // Si la billetera no carga, se mantienen PEN -> USD como valores seguros por defecto.
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

  if (monedaOrigen.value === monedaDestino.value) {
    errorMessage.value = 'Seleccione monedas distintas.'
    return
  }

  if (!Number(monto.value) || Number(monto.value) <= 0) {
    return
  }

  cargandoResumen.value = true

  try {
    // Para convertir A -> B vendemos A dentro del par A/B.
    // Ejemplo: si envías USD y recibes PEN, se usa el par USD/PEN y venta inmediata.
    // El backend valida el saldo de la moneda origen del par, que coincide con 'Envías'.
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
    errorMessage.value = normalizarMensajeError(error, 'No se pudo calcular el resumen.')
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
    await cargarResumen()
  } catch (error) {
    errorMessage.value = normalizarMensajeError(error, 'No se pudo confirmar el cambio.')
  } finally {
    confirmando.value = false
  }
}
</script>

<style scoped>
.xc-mc-card {
  padding: 24px;
}

.xc-mc-field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 4px;
}

.xc-mc-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--xchang-text-secondary);
}

.xc-mc-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.xc-mc-input {
  flex: 1;
  min-width: 0;
}

.xc-mc-input-text {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--xchang-page-text);
}

.xc-mc-resultado {
  flex: 1;
  min-width: 0;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--xchang-blue);
  overflow: hidden;
  text-overflow: ellipsis;
}

.xc-mc-select {
  width: 100px;
  flex: none;
  font-weight: 700;
}

.xc-mc-swap-wrap {
  position: relative;
  display: flex;
  align-items: center;
  margin: 2px 0;
}

.xc-mc-swap-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--xchang-blue-pale);
  color: var(--xchang-blue-dark);
  width: 32px;
  height: 32px;
}

.xc-mc-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--xchang-text-secondary);
  padding: 4px 2px;
}

.xc-mc-info-row--total {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--xchang-page-text);
  padding-top: 8px;
  border-top: 1px solid var(--xchang-border-light);
  margin-top: 4px;
}
</style>
