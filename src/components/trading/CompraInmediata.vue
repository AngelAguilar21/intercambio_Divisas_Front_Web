<template>
  <q-card flat bordered class="q-pa-md">
    <div class="text-subtitle1 text-weight-medium q-mb-md">Compra inmediata</div>

    <div class="row q-col-gutter-md">
      <!-- Columna izquierda: cantidad + botón -->
      <div class="col-12 col-sm-6">
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
        <div v-if="resumen && !resumen.saldoSuficiente" class="text-caption text-negative q-mb-xs">
          Saldo insuficiente
        </div>

        <div v-if="resumen && resumen.totalEstimado > 0" class="xchang-banner xchang-banner--info q-pa-sm q-mb-sm rounded-borders text-body2">
          Total estimado:
          <span class="xc-figure text-weight-bold"> {{ formatNum(resumen.totalEstimado) }} {{ monedaOrigen }}</span>
        </div>

        <div class="row q-gutter-sm">
          <q-btn
            color="primary"
            label="Compra inmediata"
            unelevated
            size="sm"
            :loading="confirmando"
            :disable="!puedeComprar"
            @click="onComprar"
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
              Por ejemplo, PEN → EUR → USD representa 2 saltos.
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
            {{ ruta.mensaje || 'No se encontró una ruta más barata' }}
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
                <q-item-section>Total por ruta</q-item-section>
                <q-item-section side class="xc-figure">{{ formatNum(ruta.totalRutaEncontrada) }}</q-item-section>
              </q-item>
              <q-item dense>
                <q-item-section>Ahorro estimado</q-item-section>
                <q-item-section side class="xc-figure text-positive text-weight-bold">{{ formatNum(ruta.ahorroEstimado) }}</q-item-section>
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

    <!-- Diálogo de confirmación compra normal -->
    <q-dialog v-model="dialogVisible">
      <q-card style="min-width: 320px">
        <q-card-section class="text-h6">Confirmar compra inmediata</q-card-section>
        <q-card-section v-if="resumen">
          <q-list dense>
            <q-item>
              <q-item-section>Cantidad a obtener</q-item-section>
              <q-item-section side class="xc-figure">{{ formatNum(resumen.cantidadEjecutable) }} {{ monedaDestino }}</q-item-section>
            </q-item>
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
            <q-item>
              <q-item-section>Total estimado a pagar</q-item-section>
              <q-item-section side class="xc-figure text-weight-bold">{{ formatNum(resumen.totalEstimado) }} {{ monedaOrigen }}</q-item-section>
            </q-item>
          </q-list>
          <q-banner
            v-if="!resumen.liquidezSuficiente"
            dense rounded
            class="xchang-banner xchang-banner--warning q-mt-sm"
          >
            Cantidad solicitada: {{ formatNum(resumen.cantidadSolicitada) }} — disponible: {{ formatNum(resumen.cantidadDisponible) }} {{ monedaDestino }}.
            Solo se comprará la cantidad disponible.
          </q-banner>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            color="primary"
            :label="resumen?.liquidezSuficiente ? 'Confirmar' : 'Comprar cantidad disponible'"
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
} from '@/services/compraInmediata'

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
const puedeComprar = computed(() =>
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
  if (cantidad.value > 0) {
    await cargarResumen()
    await cargarTiempoBusqueda()
  }
}

async function cargarResumen() {
  try {
    const { data } = await getResumen({ parMonedaId: props.parMonedaId, cantidadAObtener: cantidad.value })
    resumen.value = data
  } catch { /* silencioso, el error se mostrará al confirmar */ }
}

async function cargarTiempoBusqueda() {
  try {
    const { data } = await getTiempoBusqueda(maxSaltos.value)
    tiempoBusqueda.value = data
  } catch { /* ignorar */ }
}

function onComprar() {
  errorMsg.value = ''
  exitoMsg.value = ''
  dialogVisible.value = true
}

async function onConfirmarNormal() {
  dialogVisible.value = false
  confirmando.value = true
  try {
    await confirmar({
      parMonedaId: props.parMonedaId,
      cantidadAObtener: cantidad.value,
      comprarCantidadDisponible: !resumen.value?.liquidezSuficiente,
    })
    exitoMsg.value = 'Compra inmediata ejecutada correctamente.'
    limpiar()
    emit('operacion-completada')
  } catch (e) {
    errorMsg.value = normalizarMensajeError(e, 'No se pudo confirmar la compra.')
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
      cantidadAObtener: cantidad.value,
      cantidadMaximaSaltos: maxSaltos.value,
    })
    ruta.value = data
    busquedaRutaIdActiva.value = data.busquedaRutaId
  } catch (e) {
    errorMsg.value = normalizarMensajeError(e, 'No se pudo buscar la ruta.')
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
  try {
    await confirmarRuta({ busquedaRutaId: ruta.value.busquedaRutaId })
    exitoMsg.value = 'Compra por mejor ruta ejecutada correctamente.'
    limpiar()
    emit('operacion-completada')
  } catch (e) {
    errorMsg.value = normalizarMensajeError(e, 'No se pudo confirmar la ruta.')
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
  busquedaRutaIdActiva.value = null
}

function formatNum(val) {
  if (val == null) return '-'
  return Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 8 })
}
</script>
