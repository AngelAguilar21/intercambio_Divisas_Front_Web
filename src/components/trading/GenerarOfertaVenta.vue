<template>
  <q-card flat bordered class="q-pa-md">
    <div class="text-subtitle1 text-weight-medium q-mb-md">Generar oferta de venta</div>

    <q-input
      v-model.number="cantidad"
      type="number"
      label="Cantidad a vender"
      :suffix="monedaOrigen"
      outlined
      dense
      class="q-mb-xs"
      :error="cantidadError !== ''"
      :error-message="cantidadError"
      @update:model-value="limpiarResumen"
    />
    <div v-if="saldoInsuficiente" class="text-caption text-negative q-mb-sm">
      Saldo insuficiente
    </div>

    <q-input
      v-model.number="precioUnitario"
      type="number"
      label="Precio unitario"
      :suffix="monedaOrigen"
      outlined
      dense
      class="q-mb-sm"
      :error="precioError !== ''"
      :error-message="precioError"
      @update:model-value="limpiarResumen"
    />

    <div v-if="totalEsperado > 0" class="xchang-banner xchang-banner--info q-pa-sm q-mb-sm rounded-borders text-body2">
      Total esperado:
      <span class="xc-figure text-weight-bold"> {{ formatNum(totalEsperado) }} {{ monedaOrigen }}</span>
    </div>

    <q-banner v-if="errorMsg" dense rounded class="xchang-banner xchang-banner--error q-mb-sm">
      {{ errorMsg }}
    </q-banner>
    <q-banner v-if="exitoMsg" dense rounded class="xchang-banner xchang-banner--success q-mb-sm">
      {{ exitoMsg }}
    </q-banner>

    <q-btn
      color="primary"
      label="Generar oferta de venta"
      unelevated
      class="full-width"
      :loading="enviando"
      :disable="!formularioValido"
      @click="onEnviar"
    />

    <!-- Diálogo de confirmación de ejecución automática -->
    <q-dialog v-model="dialogVisible">
      <q-card style="min-width: 340px">
        <q-card-section class="text-h6">Confirmar oferta de venta</q-card-section>
        <q-card-section v-if="resumen">
          <q-list dense>
            <q-item>
              <q-item-section>Par</q-item-section>
              <q-item-section side>{{ monedaOrigen }} / {{ monedaDestino }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Cantidad a vender</q-item-section>
              <q-item-section side class="xc-figure">{{ formatNum(resumen.cantidadAVender) }} {{ monedaOrigen }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Precio unitario</q-item-section>
              <q-item-section side class="xc-figure">{{ formatNum(resumen.precioUnitario) }} {{ monedaOrigen }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Total esperado</q-item-section>
              <q-item-section side class="xc-figure text-weight-bold">{{ formatNum(resumen.totalEsperado) }} {{ monedaOrigen }}</q-item-section>
            </q-item>
            <q-separator />
            <q-item v-if="resumen.precioMinimoVenta != null">
              <q-item-section>Precio mínimo de venta</q-item-section>
              <q-item-section side class="xc-figure">{{ formatNum(resumen.precioMinimoVenta) }}</q-item-section>
            </q-item>
            <q-item v-if="resumen.precioMaximoVenta != null">
              <q-item-section>Precio máximo de venta</q-item-section>
              <q-item-section side class="xc-figure">{{ formatNum(resumen.precioMaximoVenta) }}</q-item-section>
            </q-item>
            <q-item v-if="resumen.precioPromedioVenta != null">
              <q-item-section>Precio promedio de venta</q-item-section>
              <q-item-section side class="xc-figure">{{ formatNum(resumen.precioPromedioVenta) }}</q-item-section>
            </q-item>
          </q-list>

          <q-banner
            v-if="resumen.cantidadPendienteEstimada > 0"
            dense rounded
            class="xchang-banner xchang-banner--warning q-mt-sm"
          >
            Ejecución parcial: se ejecutarán
            <span class="xc-figure text-weight-bold">{{ formatNum(resumen.cantidadEjecutableInmediata) }}</span>
            {{ monedaOrigen }} de inmediato;
            <span class="xc-figure text-weight-bold">{{ formatNum(resumen.cantidadPendienteEstimada) }}</span>
            quedarán pendientes en el libro.
          </q-banner>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Confirmar" :loading="enviando" @click="onConfirmar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { normalizarMensajeError } from '@/utils/validaciones'
import { getResumenOferta, crearOferta } from '@/services/mercado'

const props = defineProps({
  parMonedaId: { type: Number, required: true },
  monedaOrigen: { type: String, required: true },
  monedaDestino: { type: String, required: true },
  precioInicialVenta: { type: Number, default: null },
})

const emit = defineEmits(['operacion-completada'])

const cantidad = ref(null)
const precioUnitario = ref(null)
const enviando = ref(false)
const errorMsg = ref('')
const exitoMsg = ref('')
const resumen = ref(null)
const dialogVisible = ref(false)
const saldoInsuficiente = ref(false)

const cantidadError = computed(() => {
  if (cantidad.value !== null && cantidad.value <= 0) return 'La cantidad debe ser mayor a 0'
  return ''
})
const precioError = computed(() => {
  if (precioUnitario.value !== null && precioUnitario.value <= 0) return 'El precio debe ser mayor a 0'
  return ''
})
const totalEsperado = computed(() => {
  const c = Number(cantidad.value)
  const p = Number(precioUnitario.value)
  return c > 0 && p > 0 ? c * p : 0
})
const formularioValido = computed(() =>
  cantidad.value > 0 &&
  precioUnitario.value > 0 &&
  !saldoInsuficiente.value
)

watch(() => props.precioInicialVenta, (val) => {
  if (val != null && !precioUnitario.value) precioUnitario.value = val
}, { immediate: true })

watch(() => props.parMonedaId, () => limpiarTodo())

function limpiarResumen() {
  resumen.value = null
  saldoInsuficiente.value = false
  errorMsg.value = ''
  exitoMsg.value = ''
}

function limpiarTodo() {
  cantidad.value = null
  precioUnitario.value = props.precioInicialVenta ?? null
  limpiarResumen()
}

async function onEnviar() {
  if (!formularioValido.value) return
  errorMsg.value = ''
  exitoMsg.value = ''
  enviando.value = true
  try {
    const { data } = await getResumenOferta({
      parMonedaId: props.parMonedaId,
      cantidadAVender: cantidad.value,
      precioUnitario: precioUnitario.value,
    })
    resumen.value = data
    saldoInsuficiente.value = !data.saldoSuficiente

    if (!data.saldoSuficiente) {
      errorMsg.value = 'Saldo insuficiente para cubrir la cantidad a vender.'
      return
    }

    if (data.puedeEjecutarseAutomaticamente) {
      dialogVisible.value = true
    } else {
      await onConfirmar()
    }
  } catch (e) {
    errorMsg.value = normalizarMensajeError(e, 'No se pudo procesar la oferta.')
  } finally {
    enviando.value = false
  }
}

async function onConfirmar() {
  dialogVisible.value = false
  enviando.value = true
  errorMsg.value = ''
  try {
    await crearOferta({
      parMonedaId: props.parMonedaId,
      cantidadAVender: cantidad.value,
      precioUnitario: precioUnitario.value,
    })
    exitoMsg.value = 'Oferta de venta generada correctamente.'
    limpiarTodo()
    emit('operacion-completada')
  } catch (e) {
    errorMsg.value = normalizarMensajeError(e, 'No se pudo crear la oferta.')
  } finally {
    enviando.value = false
  }
}

function formatNum(val) {
  if (val == null) return '-'
  return Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 8 })
}
</script>
