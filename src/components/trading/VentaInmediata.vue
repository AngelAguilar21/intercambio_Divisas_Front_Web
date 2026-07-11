<template>
  <q-card flat bordered class="q-pa-md">
    <div class="text-subtitle1 text-weight-medium q-mb-md">Venta inmediata</div>

    <div class="row q-col-gutter-md">
      <!-- Columna izquierda: cantidad + botón -->
      <div class="col-12 col-sm-6">
        <q-input
          v-model.number="cantidad"
          type="number"
          label="Cantidad a vender"
          :suffix="monedaDestino"
          outlined
          dense
          class="q-mb-xs"
          :error="cantidadError !== ''"
          :error-message="cantidadError"
          @update:model-value="onCambioCantidad"
        />
        <div v-if="resumen && !resumen.saldoSuficiente" class="text-caption text-negative q-mb-xs">
          Saldo insuficiente en {{ monedaDestino }}
        </div>

        <div v-if="resumen && resumen.totalEstimadoARecibir > 0" class="xchang-banner xchang-banner--info q-pa-sm q-mb-sm rounded-borders text-body2">
          Total estimado a recibir:
          <span class="xc-figure text-weight-bold"> {{ formatNum(resumen.totalEstimadoARecibir) }} {{ monedaOrigen }}</span>
        </div>

        <div class="row q-gutter-sm">
          <q-btn
            color="primary"
            label="Venta inmediata"
            unelevated
            size="sm"
            :loading="confirmando"
            :disable="!puedeVender"
            @click="onVender"
          />
          <q-btn
            v-if="resumen"
            flat
            color="grey-7"
            label="Cancelar"
            size="sm"
            @click="limpiar"
          />
        </div>

        <q-banner v-if="errorMsg" dense rounded class="xchang-banner xchang-banner--error q-mt-sm">
          {{ errorMsg }}
        </q-banner>
        <q-banner v-if="exitoMsg" dense rounded class="xchang-banner xchang-banner--success q-mt-sm">
          {{ exitoMsg }}
        </q-banner>
      </div>

      <!-- Columna derecha: búsqueda de ruta -->
      <div class="col-12 col-sm-6">
        <div class="row items-center q-mb-xs q-gutter-xs">
          <div class="text-body2">Cantidad máxima de saltos</div>
          <q-btn round flat dense size="xs" icon="info" color="grey-6">
            <q-tooltip>
              Los saltos permiten evaluar rutas intermedias entre monedas.
              Por ejemplo, USD → EUR → PEN representa 2 saltos.
            </q-tooltip>
          </q-btn>
        </div>
        <q-input
          v-model.number="maxSaltos"
          type="number"
          outlined
          dense
          class="q-mb-xs"
          :error="saltosError !== ''"
          :error-message="saltosError"
          @update:model-value="ruta = null"
        />

        <q-banner v-if="tiempoBusqueda" dense rounded class="xchang-banner xchang-banner--info q-mb-xs">
          Tiempo estimado: {{ tiempoBusqueda.tiempoEstimadoTexto }}
        </q-banner>

        <q-btn
          v-if="!buscando"
          color="secondary"
          label="Realizar búsqueda"
          unelevated
          size="sm"
          class="full-width"
          :disable="!puedeBuscar"
          @click="onBuscar"
        />
        <q-btn
          v-else
          color="negative"
          label="Cancelar búsqueda"
          unelevated
          size="sm"
          class="full-width"
          @click="onCancelarBusqueda"
        />

        <!-- Resultado de ruta -->
        <template v-if="ruta">
          <q-banner
            v-if="!ruta.rutaEncontrada"
            dense rounded
            class="xchang-banner xchang-banner--warning q-mt-sm"
          >
            {{ ruta.mensaje || 'No se encontró una ruta más rentable' }}
          </q-banner>
          <template v-else>
            <q-list dense bordered class="q-mt-sm">
              <q-item v-for="salto in ruta.saltos" :key="salto.numeroSalto" dense>
                <q-item-section>
                  <span class="text-body2">
                    {{ salto.monedaOrigen }} → {{ salto.monedaDestino }}
                  </span>
                </q-item-section>
                <q-item-section side class="xc-figure text-body2">
                  {{ formatNum(salto.resultadoObtenido) }}
                </q-item-section>
              </q-item>
            </q-list>
            <q-list dense class="q-mt-xs">
              <q-item dense>
                <q-item-section>Total a recibir por ruta</q-item-section>
                <q-item-section side class="xc-figure">{{ formatNum(ruta.totalRutaEncontrada) }} {{ monedaOrigen }}</q-item-section>
              </q-item>
              <q-item dense>
                <q-item-section>Ganancia estimada</q-item-section>
                <q-item-section side class="xc-figure text-positive text-weight-bold">{{ formatNum(ruta.gananciaEstimada) }} {{ monedaOrigen }}</q-item-section>
              </q-item>
              <q-item v-if="ruta.precioMinimo != null">
                <q-item-section>Precio mínimo de ruta</q-item-section>
                <q-item-section side class="xc-figure">{{ formatNum(ruta.precioMinimo) }}</q-item-section>
              </q-item>
              <q-item v-if="ruta.precioMaximo != null">
                <q-item-section>Precio máximo de ruta</q-item-section>
                <q-item-section side class="xc-figure">{{ formatNum(ruta.precioMaximo) }}</q-item-section>
              </q-item>
              <q-item v-if="ruta.precioPromedio != null">
                <q-item-section>Precio promedio de ruta</q-item-section>
                <q-item-section side class="xc-figure">{{ formatNum(ruta.precioPromedio) }}</q-item-section>
              </q-item>

            </q-list>
            <q-btn
              color="primary"
              label="Confirmar con esta ruta"
              unelevated
              size="sm"
              class="full-width q-mt-sm"
              :loading="confirmando"
              @click="onConfirmarRuta"
            />
          </template>
        </template>
      </div>
    </div>

    <!-- Diálogo de confirmación venta normal -->
    <q-dialog v-model="dialogVisible">
      <q-card style="min-width: 320px">
        <q-card-section class="text-h6">Confirmar venta inmediata</q-card-section>
        <q-card-section v-if="resumen">
          <q-list dense>
            <q-item>
              <q-item-section>Cantidad a vender</q-item-section>
              <q-item-section side class="xc-figure">{{ formatNum(resumen.cantidadEjecutable) }} {{ monedaDestino }}</q-item-section>
            </q-item>
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
            <q-item>
              <q-item-section>Total estimado a recibir</q-item-section>
              <q-item-section side class="xc-figure text-weight-bold">{{ formatNum(resumen.totalEstimadoARecibir) }} {{ monedaOrigen }}</q-item-section>
            </q-item>
          </q-list>
          <q-banner
            v-if="dialogWarning"
            dense
            rounded
            class="xchang-banner xchang-banner--warning q-mt-sm"
          >
            {{ dialogWarning }}
          </q-banner>
          <q-banner
            v-if="!resumen.liquidezSuficiente"
            dense rounded
            class="xchang-banner xchang-banner--warning q-mt-sm"
          >
            Cantidad solicitada: {{ formatNum(resumen.cantidadSolicitada) }} — disponible: {{ formatNum(resumen.cantidadDisponible) }} {{ monedaDestino }}.
            Solo se venderá la cantidad disponible.
          </q-banner>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            :label="resumen?.liquidezSuficiente ? 'Confirmar' : 'Vender cantidad disponible'"
            :loading="confirmando"
            @click="onConfirmarNormal"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { normalizarMensajeError } from '@/utils/validaciones'
import {
  getResumen,
  confirmar,
  getTiempoBusqueda,
  buscarRuta,
  cancelarRuta,
  confirmarRuta,
} from '@/services/ventaInmediata'

const props = defineProps({
  parMonedaId: { type: Number, required: true },
  monedaOrigen: { type: String, required: true },
  monedaDestino: { type: String, required: true },
})

const emit = defineEmits(['operacion-completada'])

const cantidad = ref(null)
const maxSaltos = ref(1)
const resumen = ref(null)
const tiempoBusqueda = ref(null)
const ruta = ref(null)
const buscando = ref(false)
const confirmando = ref(false)
const errorMsg = ref('')
const exitoMsg = ref('')
const dialogVisible = ref(false)
const dialogWarning = ref('')
const busquedaRutaIdActiva = ref(null)

const cantidadError = computed(() => {
  if (cantidad.value !== null && cantidad.value <= 0) return 'La cantidad debe ser mayor a 0'
  return ''
})
const saltosError = computed(() => {
  if (maxSaltos.value < 1) return 'Mínimo 1 salto'
  if (maxSaltos.value > 5) return 'Máximo 5 saltos'
  return ''
})
const puedeVender = computed(() =>
  cantidad.value > 0 && resumen.value && resumen.value.saldoSuficiente
)
const puedeBuscar = computed(() =>
  cantidad.value > 0 &&
  maxSaltos.value >= 1 && maxSaltos.value <= 5
)

watch(() => props.parMonedaId, () => limpiar())

async function onCambioCantidad() {
  resumen.value = null
  ruta.value = null
  errorMsg.value = ''
  exitoMsg.value = ''
  dialogWarning.value = ''
  if (cantidad.value > 0) {
    await cargarResumen()
    await cargarTiempoBusqueda()
  }
}

async function cargarResumen(cantidadObjetivo = cantidad.value) {
  try {
    const { data } = await getResumen({
      parMonedaId: props.parMonedaId,
      cantidadAVender: cantidadObjetivo,
    })
    resumen.value = data
    return data
  } catch {
    return null
  }
}

async function cargarTiempoBusqueda() {
  try {
    const { data } = await getTiempoBusqueda(maxSaltos.value)
    tiempoBusqueda.value = data
  } catch { /* ignorar */ }
}

function onVender() {
  errorMsg.value = ''
  exitoMsg.value = ''
  dialogWarning.value = ''
  dialogVisible.value = true
}

async function onConfirmarNormal() {
  if (!resumen.value) return

  confirmando.value = true
  errorMsg.value = ''
  dialogWarning.value = ''

  const resumenAceptado = { ...resumen.value }
  const cantidadAConfirmar = resumenAceptado.liquidezSuficiente
    ? Number(cantidad.value)
    : Number(resumenAceptado.cantidadEjecutable || 0)
  const totalMinimoAceptado = Number(resumenAceptado.totalEstimadoARecibir || 0)

  try {
    const resumenActual = await cargarResumen(cantidadAConfirmar)
    emit('operacion-completada')

    if (!resumenActual || Number(resumenActual.cantidadEjecutable || 0) <= 0) {
      dialogWarning.value = 'Liquidez insuficiente. El libro de órdenes fue actualizado; revisa el nuevo resumen antes de confirmar.'
      return
    }

    if (!resumenActual.saldoSuficiente) {
      dialogWarning.value = `Saldo insuficiente en ${props.monedaDestino}.`
      return
    }

    if (!resumenActual.liquidezSuficiente) {
      dialogWarning.value = 'Liquidez insuficiente. El libro de órdenes cambió; revisa la cantidad disponible antes de confirmar.'
      return
    }

    const totalActual = Number(resumenActual.totalEstimadoARecibir || 0)
    if (totalActual + 0.000001 < totalMinimoAceptado) {
      dialogWarning.value = 'El precio bajó respecto al resumen mostrado. Se bloqueó la venta para que confirmes nuevamente con el nuevo precio.'
      return
    }

    await confirmar({
      parMonedaId: props.parMonedaId,
      cantidadAVender: cantidadAConfirmar,
      venderCantidadDisponible: false,
    })

    dialogVisible.value = false
    limpiar()
    exitoMsg.value = 'Venta inmediata ejecutada correctamente.'
    emit('operacion-completada')
  } catch (e) {
    errorMsg.value = normalizarMensajeError(e, 'No se pudo confirmar la venta.')
    await cargarResumen(cantidadAConfirmar)
    emit('operacion-completada')
  } finally {
    confirmando.value = false
  }
}

async function onBuscar() {
  ruta.value = null
  buscando.value = true
  errorMsg.value = ''
  await cargarTiempoBusqueda()
  try {
    const { data } = await buscarRuta({
      parMonedaId: props.parMonedaId,
      cantidadAVender: cantidad.value,
      cantidadMaximaSaltos: maxSaltos.value,
    })
    ruta.value = data
    busquedaRutaIdActiva.value = data.busquedaRutaId
    emit('operacion-completada')
  } catch (e) {
    errorMsg.value = normalizarMensajeError(e, 'No se pudo buscar la ruta.')
    emit('operacion-completada')
  } finally {
    buscando.value = false
  }
}

async function onCancelarBusqueda() {
  buscando.value = false
  if (busquedaRutaIdActiva.value) {
    try { await cancelarRuta(busquedaRutaIdActiva.value) } catch { /* ignorar */ }
    busquedaRutaIdActiva.value = null
  }
}

async function onConfirmarRuta() {
  if (!ruta.value?.busquedaRutaId) return

  confirmando.value = true
  errorMsg.value = ''

  const rutaAceptada = { ...ruta.value }
  const totalMinimoAceptado = Number(rutaAceptada.totalRutaEncontrada || 0)

  try {
    const { data: rutaActual } = await buscarRuta({
      parMonedaId: props.parMonedaId,
      cantidadAVender: cantidad.value,
      cantidadMaximaSaltos: maxSaltos.value,
    })

    ruta.value = rutaActual
    busquedaRutaIdActiva.value = rutaActual.busquedaRutaId
    emit('operacion-completada')

    if (!rutaActual.rutaEncontrada) {
      errorMsg.value = rutaActual.mensaje || 'No se encontró una ruta más rentable.'
      return
    }

    const totalActual = Number(rutaActual.totalRutaEncontrada || 0)
    if (totalActual + 0.000001 < totalMinimoAceptado) {
      errorMsg.value = 'La ruta cambió y ahora es menos rentable. Se bloqueó la venta para que revises el nuevo resultado antes de confirmar.'
      return
    }

    await confirmarRuta({ busquedaRutaId: rutaActual.busquedaRutaId })
    limpiar()
    exitoMsg.value = 'Venta por mejor ruta ejecutada correctamente.'
    emit('operacion-completada')
  } catch (e) {
    errorMsg.value = normalizarMensajeError(e, 'No se pudo confirmar la ruta.')
    emit('operacion-completada')
  } finally {
    confirmando.value = false
  }
}

function limpiar() {
  cantidad.value = null
  resumen.value = null
  ruta.value = null
  errorMsg.value = ''
  exitoMsg.value = ''
  dialogWarning.value = ''
  busquedaRutaIdActiva.value = null
}

function formatNum(val) {
  if (val == null) return '-'
  return Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 8 })
}
</script>
