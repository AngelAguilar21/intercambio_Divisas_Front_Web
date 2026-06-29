<template>
  <q-card flat class="xc-calc-card">
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
      <q-separator />
      <q-btn
        round
        unelevated
        size="sm"
        icon="swap_vert"
        class="xc-calc-swap-btn"
        aria-label="Invertir monedas"
        @click="invertirMonedas"
      />
    </div>

    <div class="xc-calc-row">
      <label class="xc-calc-label" for="xc-calc-recibe">Recibes</label>
      <div class="xc-calc-field">
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

    <q-separator class="q-mb-md" />

    <div v-if="errorTasa" class="xc-calc-info xc-calc-info--error">
      <q-icon name="error_outline" size="18px" />
      <span>No pudimos obtener la tasa en este momento.</span>
      <q-btn flat dense no-caps size="sm" label="Reintentar" @click="cargarTasa" />
    </div>

    <template v-else>
      <div class="xc-calc-info-row">
        <span>Tasa de cambio</span>
        <span class="xc-figure">
          {{ cargandoTasa ? 'Calculando…' : textoTasa }}
        </span>
      </div>
      <div class="xc-calc-info-row">
        <span>Comisión X-Chang ({{ formatearMonto(comisionPct * 100, 2) }}%)</span>
        <span class="xc-figure">- {{ formatearMonto(comision) }} {{ monedaRecibe }}</span>
      </div>
    </template>

    <q-btn
      unelevated
      color="primary"
      size="lg"
      no-caps
      class="full-width xc-calc-cta"
      label="Cambiar ahora"
      :to="{ name: 'register' }"
    />

    <div class="xc-calc-disclaimer">
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
  padding: 24px;
}

.xc-calc-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 4px;
}

.xc-calc-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--xchang-text-secondary);
}

.xc-calc-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.xc-calc-input {
  flex: 1;
  min-width: 0;
}

.xc-calc-input-text {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--xchang-page-text);
}

.xc-calc-resultado {
  flex: 1;
  min-width: 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--xchang-blue);
  overflow: hidden;
  text-overflow: ellipsis;
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
}

.xc-calc-swap-wrap {
  position: relative;
  display: flex;
  align-items: center;
  margin: 2px 0;
}

.xc-calc-swap-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--xchang-blue-pale);
  color: var(--xchang-blue-dark);
  width: 36px;
  height: 36px;
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
  font-size: 0.85rem;
  color: var(--xchang-text-secondary);
  padding: 4px 4px;
}

.xc-calc-cta {
  margin-top: 14px;
  height: 52px;
  font-size: 1rem;
}

.xc-calc-disclaimer {
  margin-top: 12px;
  font-size: 0.72rem;
  line-height: 1.4;
  color: var(--xchang-text-secondary);
  text-align: center;
}
</style>
