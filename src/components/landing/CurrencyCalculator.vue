<template>
  <q-card class="xc-calc-card">
    <!-- Gradient header -->
    <div class="xc-calc-header">
      <div class="xc-calc-header-icon">
        <q-icon name="swap_horiz" size="20px" color="white" />
      </div>
      <div class="col">
        <div class="xc-calc-header-title">Calculadora de cambio</div>
        <div class="xc-calc-header-sub">Tipo de cambio en tiempo real</div>
      </div>
      <q-chip dense class="xc-calc-live-chip" icon="fiber_manual_record" label="EN VIVO" />
    </div>

    <!-- Input panel -->
    <div class="xc-calc-panel">
      <div class="xc-calc-row">
        <label class="xc-calc-label" for="xc-calc-envia">Envías</label>
        <div class="xc-calc-field">
          <q-input
            id="xc-calc-envia"
            v-model.number="montoEnvia"
            type="number"
            min="0"
            dense
            borderless
            class="xc-calc-input"
            input-class="xc-calc-input-text"
          />
          <q-select
            v-model="monedaEnvia"
            dense
            borderless
            emit-value
            map-options
            :options="opcionesMoneda"
            class="xc-calc-select"
            popup-content-class="xc-calc-popup"
          >
            <template #selected>
              <span class="xc-calc-select-selected">
                <img
                  v-if="urlBandera(monedaEnvia)"
                  :src="urlBandera(monedaEnvia, 40)"
                  :alt="monedaEnvia"
                  class="xc-calc-flag"
                />
                {{ monedaEnvia }}
              </span>
            </template>
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <img
                    v-if="urlBandera(scope.opt.value)"
                    :src="urlBandera(scope.opt.value, 40)"
                    :alt="scope.opt.value"
                    class="xc-calc-flag"
                  />
                </q-item-section>
                <q-item-section>{{ scope.opt.label }}</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>

      <div class="xc-calc-swap-wrap">
        <div class="xc-calc-swap-line"></div>
        <q-btn
          round
          unelevated
          size="sm"
          icon="swap_vert"
          class="xc-calc-swap-btn"
          aria-label="Invertir monedas"
          @click="invertirMonedas"
        />
        <div class="xc-calc-swap-line"></div>
      </div>

      <div class="xc-calc-row">
        <label class="xc-calc-label" for="xc-calc-recibe">Recibes</label>
        <div class="xc-calc-field xc-calc-field--receive">
          <div id="xc-calc-recibe" class="xc-calc-resultado xc-figure">
            {{ cargandoTasa ? '…' : formatearMonto(montoRecibe) }}
          </div>
          <q-select
            v-model="monedaRecibe"
            dense
            borderless
            emit-value
            map-options
            :options="opcionesMoneda"
            class="xc-calc-select"
            popup-content-class="xc-calc-popup"
          >
            <template #selected>
              <span class="xc-calc-select-selected">
                <img
                  v-if="urlBandera(monedaRecibe)"
                  :src="urlBandera(monedaRecibe, 40)"
                  :alt="monedaRecibe"
                  class="xc-calc-flag"
                />
                {{ monedaRecibe }}
              </span>
            </template>
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <img
                    v-if="urlBandera(scope.opt.value)"
                    :src="urlBandera(scope.opt.value, 40)"
                    :alt="scope.opt.value"
                    class="xc-calc-flag"
                  />
                </q-item-section>
                <q-item-section>{{ scope.opt.label }}</q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>
    </div>

    <!-- Rate info -->
    <div class="xc-calc-rates">
      <div v-if="errorTasa" class="xc-calc-info xc-calc-info--error">
        <q-icon name="error_outline" size="18px" />
        <span>No pudimos obtener la tasa en este momento.</span>
        <q-btn flat dense no-caps size="sm" label="Reintentar" @click="cargarTasa" />
      </div>

      <template v-else>
        <div class="xc-calc-info-row">
          <div class="row items-center no-wrap">
            <q-icon name="trending_up" size="14px" color="positive" class="q-mr-xs" />
            <span>Tasa de cambio</span>
          </div>
          <span class="xc-figure xc-calc-rate-value">
            {{ cargandoTasa ? 'Calculando…' : textoTasa }}
          </span>
        </div>
        <div class="xc-calc-info-row">
          <div class="row items-center no-wrap">
            <q-icon name="account_balance" size="14px" class="q-mr-xs xc-text-secondary" />
            <span>Comisión X-Chang ({{ formatearMonto(comisionPct * 100, 2) }}%)</span>
          </div>
          <span class="xc-figure">- {{ formatearMonto(comision) }} {{ monedaRecibe }}</span>
        </div>
      </template>
    </div>

    <!-- CTA -->
    <div class="xc-calc-cta-wrap">
      <q-btn
        unelevated
        size="lg"
        no-caps
        icon-right="arrow_forward"
        class="full-width xc-calc-cta"
        label="Cambiar ahora"
        :to="{ name: 'register' }"
      />
    </div>

    <div class="xc-calc-disclaimer">
      <q-icon name="info_outline" size="12px" class="q-mr-xs" style="flex-shrink: 0; margin-top: 1px" />
      Tasa referencial del mercado P2P de X-Chang. La tasa final se confirma al ejecutar la
      operación dentro de tu cuenta.
    </div>
  </q-card>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { getMonedas } from '@/services/monedas'
import { getListadoPares } from '@/services/preciosPares'
import { urlBandera } from '@/utils/monedaBandera'
import { formatearMonto } from '@/utils/formato'

const COMISION_PCT = 0.005

const monedas = ref([])
const monedaEnvia = ref('USD')
const monedaRecibe = ref('PEN')
const montoEnvia = ref(1000)

const tasa = ref(null)
const tasaEsInvertida = ref(false) // true cuando monedaEnvia es la moneda "destino" del par canónico
const cargandoTasa = ref(false)
const errorTasa = ref(false)

const comisionPct = ref(COMISION_PCT)

const opcionesMoneda = computed(() =>
  monedas.value.map((m) => ({
    label: `${m.codigoISO} - ${m.nombre}`,
    value: m.codigoISO,
  })),
)

const subtotalRecibe = computed(() => {
  if (!tasa.value) return 0
  const monto = Number(montoEnvia.value) || 0
  return tasaEsInvertida.value ? monto / tasa.value : monto * tasa.value
})

const textoTasa = computed(() => {
  if (!tasa.value) return 'Sin datos para este par'
  if (tasaEsInvertida.value) {
    return `${formatearMonto(tasa.value, 4)} ${monedaEnvia.value} = 1 ${monedaRecibe.value}`
  }
  return `1 ${monedaEnvia.value} = ${formatearMonto(tasa.value, 4)} ${monedaRecibe.value}`
})

const comision = computed(() => subtotalRecibe.value * comisionPct.value)

const montoRecibe = computed(() => Math.max(subtotalRecibe.value - comision.value, 0))

let temporizador = null

watch([monedaEnvia, monedaRecibe], () => {
  clearTimeout(temporizador)
  temporizador = setTimeout(cargarTasa, 250)
})

onMounted(async () => {
  await cargarMonedas()
  await cargarTasa()
})

async function cargarMonedas() {
  try {
    const { data } = await getMonedas()
    monedas.value = Array.isArray(data) ? data : data.monedas || data.registros || []
  } catch {
    monedas.value = []
  }
}

async function cargarTasa() {
  console.log('[Calc] cargarTasa iniciado', monedaEnvia.value, monedaRecibe.value)

  if (monedaEnvia.value === monedaRecibe.value) {
    tasa.value = 1
    tasaEsInvertida.value = false
    errorTasa.value = false
    return
  }

  cargandoTasa.value = true
  errorTasa.value = false

  try {
    // Intentar consulta directa primero
    console.log('[Calc] llamando getListadoPares directo:', monedaEnvia.value, '→', monedaRecibe.value)
    let { data } = await getListadoPares({
      monedaEntrega: monedaEnvia.value,
      monedaObtiene: monedaRecibe.value,
      pagina: 1,
      registrosPorPagina: '1',
    })
    console.log('[Calc] respuesta directa:', data)

    let fila = data.registros?.[0]
    // fueDirecto=true → par encontrado con monedaEntrega=monedaEnvia
    //   → tasa = "monedaRecibe por 1 monedaEnvia" → recibe = monto * tasa
    //   Ej: monedaEnvia=PEN, tasa=0.265 → "0.265 USD por 1 PEN" → recibe = monto * 0.265
    // fueDirecto=false → encontrado con monedas invertidas (fallback)
    //   → tasa sigue siendo "monedaEnvia por 1 monedaRecibe" → recibe = monto / tasa
    //   Ej: monedaEnvia=USD, tasa=0.265 (PEN→USD) → 1 USD = 1/0.265 PEN → recibe = monto / 0.265
    let fueDirecto = true

    if (!fila || !fila.menorPrecioVenta) {
      console.log('[Calc] sin resultado directo, intentando fallback invertido:', monedaRecibe.value, '→', monedaEnvia.value)
      const resp2 = await getListadoPares({
        monedaEntrega: monedaRecibe.value,
        monedaObtiene: monedaEnvia.value,
        pagina: 1,
        registrosPorPagina: '1',
      })
      console.log('[Calc] respuesta fallback:', resp2.data)
      fila = resp2.data.registros?.[0]
      if (fila) fueDirecto = false
    }

    console.log('[Calc] fila:', fila, '| fueDirecto:', fueDirecto, '| tasaEsInvertida:', !fueDirecto)
    tasa.value = fila ? Number(fila.menorPrecioVenta) : null
    // La BD siempre almacena la tasa como PEN/monedaExtranjera.
    // Si el par directo encontrado tiene monedaEnvia=PEN, la tasa está en sentido inverso.
    tasaEsInvertida.value = !fueDirecto || monedaEnvia.value === 'PEN'
    console.log('[Calc] tasa final:', tasa.value, '| tasaEsInvertida:', tasaEsInvertida.value)
  } catch (e) {
    console.error('[Calc] error en cargarTasa:', e)
    tasa.value = null
    errorTasa.value = true
  } finally {
    cargandoTasa.value = false
  }
}

function invertirMonedas() {
  const anterior = monedaEnvia.value
  monedaEnvia.value = monedaRecibe.value
  monedaRecibe.value = anterior
}
</script>

<style scoped>
.xc-calc-card {
  border-radius: var(--xchang-radius-lg);
  background: var(--xchang-surface);
  box-shadow: var(--xchang-shadow-lg);
  overflow: hidden;
  border: 1px solid var(--xchang-border-light);
}

/* Gradient header strip */
.xc-calc-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 24px;
  background: linear-gradient(135deg, #0d1b3e 0%, #1a306e 55%, #2563eb 100%);
  color: #ffffff;
}

.xc-calc-header-icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.xc-calc-header-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}

.xc-calc-header-sub {
  font-size: 0.70rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
}

.xc-calc-live-chip {
  background: rgba(34, 197, 94, 0.18) !important;
  color: #4ade80 !important;
  border: 1px solid rgba(74, 222, 128, 0.3) !important;
  font-size: 0.62rem !important;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.xc-calc-live-chip :deep(.q-icon) {
  font-size: 8px !important;
  animation: xc-live-pulse 1.5s ease-in-out infinite;
}

@keyframes xc-live-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.25;
  }
}

/* Input panel */
.xc-calc-panel {
  padding: 12px 24px 8px;
}

.xc-calc-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 0;
}

.xc-calc-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--xchang-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.xc-calc-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--xchang-page-bg);
  border: 1.5px solid var(--xchang-border);
  border-radius: var(--xchang-radius-sm);
  padding: 2px 12px 2px 16px;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.xc-calc-field:focus-within {
  border-color: var(--xchang-blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.xc-calc-field--receive {
  border-color: rgba(37, 99, 235, 0.2);
  background: rgba(37, 99, 235, 0.04);
}

.xc-calc-input {
  flex: 1;
  min-width: 0;
}

.xc-calc-input-text {
  font-size: 1.55rem;
  font-weight: 700;
  color: var(--xchang-page-text);
}

.xc-calc-resultado {
  flex: 1;
  min-width: 0;
  font-size: 1.55rem;
  font-weight: 700;
  color: var(--xchang-blue);
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 10px 0;
}

.xc-calc-select {
  width: 116px;
  flex: none;
}

.xc-calc-select-selected {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
}

.xc-calc-flag {
  width: 22px;
  height: 16px;
  object-fit: cover;
  border-radius: 3px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

/* Swap row */
.xc-calc-swap-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}

.xc-calc-swap-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--xchang-border), transparent);
}

.xc-calc-swap-btn {
  background: linear-gradient(135deg, #2563eb, #6366f1) !important;
  color: #ffffff !important;
  width: 36px;
  height: 36px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
  flex-shrink: 0;
  transition:
    box-shadow 0.2s,
    transform 0.2s;
}

.xc-calc-swap-btn:hover {
  box-shadow: 0 6px 18px rgba(99, 102, 241, 0.5) !important;
  transform: scale(1.1);
}

/* Rate section */
.xc-calc-rates {
  padding: 14px 24px 10px;
  border-top: 1px solid var(--xchang-border-light);
  margin-top: 4px;
}

.xc-calc-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--xchang-radius-sm);
  font-size: 0.85rem;
  margin-bottom: 12px;
}

.xc-calc-info--error {
  background: rgba(220, 38, 38, 0.08);
  color: #b91c1c;
}

.xc-calc-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
  color: var(--xchang-text-secondary);
  padding: 7px 0;
}

.xc-calc-info-row + .xc-calc-info-row {
  border-top: 1px dashed var(--xchang-border-light);
}

.xc-calc-rate-value {
  color: var(--xchang-page-text);
  font-weight: 600;
}

/* CTA button */
.xc-calc-cta-wrap {
  padding: 8px 24px 14px;
}

.xc-calc-cta {
  height: 52px;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 14px !important;
  background: linear-gradient(135deg, #2563eb 0%, #6366f1 100%) !important;
  color: #ffffff !important;
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3) !important;
  transition:
    box-shadow 0.2s,
    transform 0.15s;
}

.xc-calc-cta:hover {
  box-shadow: 0 8px 28px rgba(37, 99, 235, 0.5) !important;
  transform: translateY(-1px);
}

/* Disclaimer */
.xc-calc-disclaimer {
  padding: 0 24px 20px;
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 0.68rem;
  line-height: 1.5;
  color: var(--xchang-text-secondary);
}
</style>
