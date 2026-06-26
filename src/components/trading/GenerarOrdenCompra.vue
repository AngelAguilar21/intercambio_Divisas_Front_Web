<template>
  <q-card flat bordered class="q-pa-md">
    <div class="text-subtitle1 text-weight-medium q-mb-md">Generar orden de compra</div>

    <q-input
      v-model.number="cantidad"
      type="number"
      label="Cantidad a obtener"
      :suffix="monedaDestino"
      outlined
      dense
      class="q-mb-xs"
      :error="cantidadError !== ''"
      :error-message="cantidadError"
      @update:model-value="onCambioCantidad"
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

    <div v-if="totalComprometido > 0" class="xchang-banner xchang-banner--info q-pa-sm q-mb-sm rounded-borders text-body2">
      Total comprometido:
      <span class="xc-figure text-weight-bold"> {{ formatNum(totalComprometido) }} {{ monedaOrigen }}</span>
    </div>

    <q-banner v-if="errorMsg" dense rounded class="xchang-banner xchang-banner--error q-mb-sm">
      {{ errorMsg }}
    </q-banner>
    <q-banner v-if="exitoMsg" dense rounded class="xchang-banner xchang-banner--success q-mb-sm">
      {{ exitoMsg }}
    </q-banner>

    <q-btn
      color="primary"
      label="Generar orden de compra"
      unelevated
      class="full-width"
      :loading="enviando"
      :disable="!formularioValido"
      @click="onEnviar"
    />

    <!-- Diálogo de confirmación de ejecución automática -->
    <q-dialog v-model="dialogVisible">
      <q-card style="min-width: 340px">
        <q-card-section class="text-h6">Confirmar orden de compra</q-card-section>
        <q-card-section v-if="resumen">
          <q-list dense>
            <q-item>
              <q-item-section>Par</q-item-section>
              <q-item-section side>{{ monedaOrigen }} / {{ monedaDestino }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Cantidad a obtener</q-item-section>
              <q-item-section side class="xc-figure">{{ formatNum(resumen.cantidadAObtener) }} {{ monedaDestino }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Precio unitario</q-item-section>
              <q-item-section side class="xc-figure">{{ formatNum(resumen.precioUnitario) }} {{ monedaOrigen }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Total comprometido</q-item-section>
              <q-item-section side class="xc-figure text-weight-bold">{{ formatNum(resumen.totalComprometido) }} {{ monedaOrigen }}</q-item-section>
            </q-item>
            <q-separator />
            <q-item v-if="resumen.precioMinimoCompra != null">
              <q-item-section>Precio mínimo de compra</q-item-section>
              <q-item-section side class="xc-figure">{{ formatNum(resumen.precioMinimoCompra) }}</q-item-section>
            </q-item>
            <q-item v-if="resumen.precioMaximoCompra != null">
              <q-item-section>Precio máximo de compra</q-item-section>
              <q-item-section side class="xc-figure">{{ formatNum(resumen.precioMaximoCompra) }}</q-item-section>
            </q-item>
            <q-item v-if="resumen.precioPromedioCompra != null">
              <q-item-section>Precio promedio de compra</q-item-section>
              <q-item-section side class="xc-figure">{{ formatNum(resumen.precioPromedioCompra) }}</q-item-section>
            </q-item>
          </q-list>

          <q-banner
            v-if="resumen.cantidadPendienteEstimada > 0"
            dense rounded
            class="xchang-banner xchang-banner--warning q-mt-sm"
          >
            Ejecución parcial: se ejecutarán
            <span class="xc-figure text-weight-bold">{{ formatNum(resumen.cantidadEjecutableInmediata) }}</span>
            {{ monedaDestino }} de inmediato;
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
import { getResumenOrden, crearOrden } from '@/services/mercado'

const props = defineProps({
  parMonedaId: { type: Number, required: true },
  monedaOrigen: { type: String, required: true },
  monedaDestino: { type: String, required: true },
  precioInicialCompra: { type: Number, default: null },
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
const totalComprometido = computed(() => {
  const c = Number(cantidad.value)
  const p = Number(precioUnitario.value)
  return c > 0 && p > 0 ? c * p : 0
})
const formularioValido = computed(() =>
  cantidad.value > 0 &&
  precioUnitario.value > 0 &&
  !saldoInsuficiente.value
)

watch(() => props.precioInicialCompra, (val) => {
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
  precioUnitario.value = props.precioInicialCompra ?? null
  limpiarResumen()
}

function onCambioCantidad() {
  limpiarResumen()
}

async function onEnviar() {
  if (!formularioValido.value) return
  errorMsg.value = ''
  exitoMsg.value = ''
  enviando.value = true
  try {
    const { data } = await getResumenOrden({
      parMonedaId: props.parMonedaId,
      cantidadAObtener: cantidad.value,
      precioUnitario: precioUnitario.value,
    })
    resumen.value = data
    saldoInsuficiente.value = !data.saldoSuficiente

    if (!data.saldoSuficiente) {
      errorMsg.value = 'Saldo insuficiente para cubrir el total comprometido.'
      return
    }

    if (data.puedeEjecutarseAutomaticamente) {
      dialogVisible.value = true
    } else {
      await onConfirmar()
    }
  } catch (e) {
    errorMsg.value = e.response?.data?.mensaje || 'No se pudo procesar la orden.'
  } finally {
    enviando.value = false
  }
}

async function onConfirmar() {
  dialogVisible.value = false
  enviando.value = true
  errorMsg.value = ''
  try {
    await crearOrden({
      parMonedaId: props.parMonedaId,
      cantidadAObtener: cantidad.value,
      precioUnitario: precioUnitario.value,
    })
    exitoMsg.value = 'Orden de compra generada correctamente.'
    limpiarTodo()
    emit('operacion-completada')
  } catch (e) {
    errorMsg.value = e.response?.data?.mensaje || 'No se pudo crear la orden.'
  } finally {
    enviando.value = false
  }
}

function formatNum(val) {
  if (val == null) return '-'
  return Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 8 })
}
</script>
