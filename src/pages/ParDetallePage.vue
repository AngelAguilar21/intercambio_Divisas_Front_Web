<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5">Detalle del par {{ parTexto }}</div>
        <div class="text-body2 text-grey-7">
          Vista base para gráfico, libro de órdenes y operaciones del par seleccionado.
        </div>
      </div>

      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Volver a monedas"
        :to="{ name: 'monedas' }"
      />
    </div>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="row items-center justify-between">
        <div>
          <div class="text-subtitle1 text-weight-medium">Gráfico histórico</div>
          <div class="text-body2 text-grey-7">
            Placeholder para US-011. Aquí se conectará la serie histórica del par.
          </div>
        </div>

        <q-select
          v-model="rango"
          dense
          outlined
          style="width: 190px"
          :options="rangoOptions"
          label="Rango"
          emit-value
          map-options
        />
      </div>

      <div class="placeholder-chart q-mt-md">Gráfico pendiente</div>
    </q-card>

    <q-banner v-if="errorMessage" dense rounded class="xchang-banner xchang-banner--error q-mb-md">
      {{ errorMessage }}
    </q-banner>

    <div v-if="!authStore.isAuthenticated" class="q-mb-md">
      <q-banner dense rounded class="xchang-banner xchang-banner--info">
        Inicia sesión para ver el libro de órdenes operativo y realizar compras o ventas.
      </q-banner>
    </div>

    <div v-if="authStore.isAuthenticated" class="row q-col-gutter-md">
      <div class="col-12 col-lg-4">
        <q-card flat bordered class="q-pa-md q-mb-md">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">Generar orden de compra</div>

          <q-input
            v-model.number="orden.cantidadAObtener"
            type="number"
            outlined
            dense
            label="Cantidad a obtener"
            :error="orden.cantidadAObtener !== null && orden.cantidadAObtener <= 0"
            error-message="La cantidad debe ser mayor a 0"
            class="q-mb-sm"
          />

          <q-input
            v-model.number="orden.precioUnitario"
            type="number"
            outlined
            dense
            label="Precio unitario"
            :error="orden.precioUnitario !== null && orden.precioUnitario <= 0"
            error-message="El precio debe ser mayor a 0"
            class="q-mb-sm"
          />

          <div class="text-body2 q-mb-sm">
            Total comprometido:
            <strong>{{ formatearDecimal(totalOrden) }}</strong>
            {{ monedaOrigen }}
          </div>

          <q-btn
            color="primary"
            label="Generar orden de compra"
            class="full-width"
            :loading="loadingOrden"
            :disable="!ordenValida"
            @click="crearOrdenCompra"
          />
        </q-card>

        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">Venta inmediata</div>

          <q-input
            v-model.number="venta.cantidadAVender"
            type="number"
            outlined
            dense
            label="Cantidad a vender"
            :error="venta.cantidadAVender !== null && venta.cantidadAVender <= 0"
            error-message="La cantidad debe ser mayor a 0"
            class="q-mb-sm"
          />

          <q-input
            v-model.number="venta.cantidadMaximaSaltos"
            type="number"
            outlined
            dense
            label="Cantidad máxima de saltos"
            hint="Mínimo 1 salto, máximo 5 saltos"
            :error="
              venta.cantidadMaximaSaltos !== null && !saltosValidos(venta.cantidadMaximaSaltos)
            "
            error-message="Debe estar entre 1 y 5"
            class="q-mb-sm"
          />

          <q-banner
            v-if="tiempoBusquedaVenta"
            dense
            rounded
            class="xchang-banner xchang-banner--info q-mb-sm"
          >
            {{ textoTiempoBusqueda(tiempoBusquedaVenta) }}
          </q-banner>

          <q-linear-progress v-if="loadingTiempoVenta" indeterminate class="q-mb-sm" />

          <q-btn
            color="primary"
            label="Venta inmediata"
            class="full-width q-mb-sm"
            :loading="loadingVenta"
            :disable="!ventaValida"
            @click="confirmarVentaNormal"
          />

          <q-btn
            outline
            color="secondary"
            label="Realizar búsqueda"
            class="full-width"
            :loading="loadingRutaVenta"
            :disable="!ventaValida"
            @click="buscarRutaVenta"
          />

          <q-banner
            v-if="rutaVenta"
            dense
            rounded
            class="xchang-banner xchang-banner--info q-mt-sm"
          >
            {{
              rutaVenta.rutaEncontrada
                ? 'Ruta encontrada.'
                : rutaVenta.mensaje || 'No se encontró una ruta más rentable.'
            }}
          </q-banner>
        </q-card>
      </div>

      <div class="col-12 col-lg-4">
        <q-card flat bordered class="q-pa-md">
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle1 text-weight-medium">Libro de órdenes</div>

            <q-btn dense flat icon="refresh" @click="cargarLibro" />
          </div>

          <q-separator class="q-mb-sm" />

          <div class="text-subtitle2 text-blue q-mb-xs">Órdenes de compra</div>

          <q-table
            :rows="libro?.ordenesCompra || []"
            :columns="columnasLibro"
            row-key="id"
            dense
            flat
            :loading="loadingLibro"
            :pagination="{ rowsPerPage: 10 }"
          />

          <q-banner
            v-if="libro?.mensajeOrdenes"
            dense
            rounded
            class="xchang-banner xchang-banner--empty q-my-sm"
          >
            {{ libro.mensajeOrdenes }}
          </q-banner>

          <div class="text-subtitle2 text-green q-mt-md q-mb-xs">Ofertas de venta</div>

          <q-table
            :rows="libro?.ofertasVenta || []"
            :columns="columnasLibro"
            row-key="id"
            dense
            flat
            :loading="loadingLibro"
            :pagination="{ rowsPerPage: 10 }"
          />

          <q-banner
            v-if="libro?.mensajeOfertas"
            dense
            rounded
            class="xchang-banner xchang-banner--empty q-my-sm"
          >
            {{ libro.mensajeOfertas }}
          </q-banner>
        </q-card>
      </div>

      <div class="col-12 col-lg-4">
        <q-card flat bordered class="q-pa-md q-mb-md">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">Generar oferta de venta</div>

          <q-input
            v-model.number="oferta.cantidadAVender"
            type="number"
            outlined
            dense
            label="Cantidad a vender"
            :error="(oferta.cantidadAVender !== null && oferta.cantidadAVender <= 0) || saldoInsuficiente"
            :error-message="oferta.cantidadAVender !== null && oferta.cantidadAVender <= 0 ? 'La cantidad debe ser mayor a 0' : 'Saldo insuficiente'"
            class="q-mb-sm"
          />

          <q-input
            v-model.number="oferta.precioUnitario"
            type="number"
            outlined
            dense
            label="Precio unitario"
            :error="oferta.precioUnitario !== null && oferta.precioUnitario <= 0"
            error-message="El precio debe ser mayor a 0"
            class="q-mb-sm"
          />

          <div class="text-body2 q-mb-sm">
            Total esperado:
            <strong>{{ formatearDecimal(totalOferta) }}</strong>
            {{ monedaDestino }}
          </div>

          <q-btn
            color="primary"
            label="Generar oferta de venta"
            class="full-width"
            :loading="loadingOferta"
            :disable="!ofertaValida"
            @click="crearOfertaVenta"
          />
        </q-card>

        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">Compra inmediata</div>

          <q-input
            v-model.number="compra.cantidadAObtener"
            type="number"
            outlined
            dense
            label="Cantidad a obtener"
            :error="compra.cantidadAObtener !== null && compra.cantidadAObtener <= 0"
            error-message="La cantidad debe ser mayor a 0"
            class="q-mb-sm"
          />

          <q-input
            v-model.number="compra.cantidadMaximaSaltos"
            type="number"
            outlined
            dense
            label="Cantidad máxima de saltos"
            hint="Mínimo 1 salto, máximo 5 saltos"
            :error="
              compra.cantidadMaximaSaltos !== null && !saltosValidos(compra.cantidadMaximaSaltos)
            "
            error-message="Debe estar entre 1 y 5"
            class="q-mb-sm"
          />

          <q-banner
            v-if="tiempoBusquedaCompra"
            dense
            rounded
            class="xchang-banner xchang-banner--info q-mb-sm"
          >
            {{ textoTiempoBusqueda(tiempoBusquedaCompra) }}
          </q-banner>

          <q-linear-progress v-if="loadingTiempoCompra" indeterminate class="q-mb-sm" />

          <q-btn
            color="primary"
            label="Compra inmediata"
            class="full-width q-mb-sm"
            :loading="loadingCompra"
            :disable="!compraValida"
            @click="confirmarCompraNormal"
          />

          <q-btn
            outline
            color="secondary"
            label="Realizar búsqueda"
            class="full-width"
            :loading="loadingRutaCompra"
            :disable="!compraValida"
            @click="buscarRutaCompra"
          />

          <q-banner
            v-if="rutaCompra"
            dense
            rounded
            class="xchang-banner xchang-banner--info q-mt-sm"
          >
            {{
              rutaCompra.rutaEncontrada
                ? 'Ruta encontrada.'
                : rutaCompra.mensaje || 'No se encontró una ruta más barata.'
            }}
          </q-banner>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="resultadoDialog">
      <q-card style="min-width: 380px; max-width: 700px">
        <q-card-section>
          <div class="text-h6">Operación realizada</div>
        </q-card-section>

        <q-card-section>
          <pre class="resultado-pre">{{ resultadoTexto }}</pre>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup @click="cargarLibro" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="ofertaConfirmDialog">
      <q-card style="min-width: 380px">
        <q-card-section>
          <div class="text-h6">Confirmar oferta de venta</div>
        </q-card-section>

        <q-card-section class="q-gutter-y-xs">
          <div>Cantidad a vender: <strong>{{ formatearDecimal(oferta.cantidadAVender) }} {{ monedaOrigen }}</strong></div>
          <div>Precio unitario: <strong>{{ formatearDecimal(oferta.precioUnitario) }}</strong></div>
          <div>Total esperado: <strong>{{ formatearDecimal(totalOferta) }} {{ monedaDestino }}</strong></div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Confirmar" :loading="loadingOferta" @click="confirmarOferta" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="ofertaResumenDialog">
      <q-card style="min-width: 420px">
        <q-card-section>
          <div class="text-h6">Oferta con ejecución automática</div>
          <div class="text-body2 text-grey-7">
            El precio ingresado es igual o menor al mayor precio de compra disponible. La oferta se ejecutará automáticamente contra órdenes de compra compatibles.
          </div>
        </q-card-section>

        <q-card-section v-if="resumenOferta" class="q-gutter-y-xs">
          <div>Precio mínimo de venta: <strong>{{ formatearDecimal(resumenOferta.precioMinimo ?? resumenOferta.PrecioMinimo) }}</strong></div>
          <div>Precio máximo de venta: <strong>{{ formatearDecimal(resumenOferta.precioMaximo ?? resumenOferta.PrecioMaximo) }}</strong></div>
          <div>Precio promedio de venta: <strong>{{ formatearDecimal(resumenOferta.precioPromedio ?? resumenOferta.PrecioPromedio) }}</strong></div>
          <q-separator class="q-my-sm" />
          <div>Cantidad a vender: <strong>{{ formatearDecimal(oferta.cantidadAVender) }} {{ monedaOrigen }}</strong></div>
          <div>Precio unitario ingresado: <strong>{{ formatearDecimal(oferta.precioUnitario) }}</strong></div>
          <div>Total esperado: <strong>{{ formatearDecimal(totalOferta) }} {{ monedaDestino }}</strong></div>
          <template v-if="(resumenOferta.cantidadEjecutadaEstimada ?? resumenOferta.CantidadEjecutadaEstimada) !== undefined">
            <q-separator class="q-my-sm" />
            <div class="text-subtitle2">Ejecución estimada</div>
            <div>Cantidad ejecutada inmediatamente: <strong>{{ formatearDecimal(resumenOferta.cantidadEjecutadaEstimada ?? resumenOferta.CantidadEjecutadaEstimada) }}</strong></div>
            <div>Cantidad pendiente en libro: <strong>{{ formatearDecimal(resumenOferta.cantidadPendienteEstimada ?? resumenOferta.CantidadPendienteEstimada) }}</strong></div>
          </template>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Confirmar" :loading="loadingOferta" @click="confirmarOferta" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Notify } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import { getLibroOrdenes, crearOrden, crearOferta, getResumenOferta } from '@/services/mercado'
import {
  getResumen as getResumenCompra,
  confirmar as confirmarCompra,
  buscarRuta as buscarRutaCompraService,
  getTiempoBusqueda as getTiempoBusquedaCompra,
} from '@/services/compraInmediata'
import {
  getResumen as getResumenVenta,
  confirmar as confirmarVenta,
  buscarRuta as buscarRutaVentaService,
  getTiempoBusqueda as getTiempoBusquedaVenta,
} from '@/services/ventaInmediata'
import { getBilletera } from '@/services/billetera'

const route = useRoute()
const authStore = useAuthStore()

const parMonedaId = computed(() => Number(route.params.parMonedaId))
const monedaOrigen = computed(() => String(route.query.origen || '').toUpperCase())
const monedaDestino = computed(() => String(route.query.destino || '').toUpperCase())
const parTexto = computed(() => `${monedaOrigen.value}/${monedaDestino.value}`)

const rango = ref('UltimoDia')

const rangoOptions = [
  { label: 'Último día', value: 'UltimoDia' },
  { label: 'Última semana', value: 'UltimaSemana' },
  { label: 'Último mes', value: 'UltimoMes' },
  { label: 'Último año', value: 'UltimoAno' },
  { label: 'Tiempo total', value: 'Total' },
]

const errorMessage = ref('')
const resultadoDialog = ref(false)
const resultado = ref(null)

const resultadoTexto = computed(() => {
  if (!resultado.value) return ''
  return JSON.stringify(resultado.value, null, 2)
})

const libro = ref(null)
const loadingLibro = ref(false)

const orden = reactive({
  cantidadAObtener: null,
  precioUnitario: null,
})

const oferta = reactive({
  cantidadAVender: null,
  precioUnitario: null,
})

const compra = reactive({
  cantidadAObtener: null,
  cantidadMaximaSaltos: 1,
})

const venta = reactive({
  cantidadAVender: null,
  cantidadMaximaSaltos: 1,
})

const rutaCompra = ref(null)
const rutaVenta = ref(null)
const tiempoBusquedaCompra = ref(null)
const tiempoBusquedaVenta = ref(null)

const loadingTiempoCompra = ref(false)
const loadingTiempoVenta = ref(false)

const loadingOrden = ref(false)
const loadingOferta = ref(false)
const loadingCompra = ref(false)
const loadingVenta = ref(false)
const loadingRutaCompra = ref(false)
const loadingRutaVenta = ref(false)

const ofertaConfirmDialog = ref(false)
const ofertaResumenDialog = ref(false)
const resumenOferta = ref(null)
const billetera = ref([])

const columnasLibro = [
  {
    name: 'fecha',
    label: 'Fecha',
    field: (row) => formatearFecha(row.fechaCreacion),
    align: 'left',
  },
  {
    name: 'cantidad',
    label: 'Cantidad',
    field: (row) => formatearDecimal(row.cantidad),
    align: 'right',
  },
  {
    name: 'precioUnitario',
    label: 'Precio',
    field: (row) => formatearDecimal(row.precioUnitario),
    align: 'right',
  },
  {
    name: 'total',
    label: 'Total',
    field: (row) => formatearDecimal(row.total),
    align: 'right',
  },
]

const totalOrden = computed(() => numero(orden.cantidadAObtener) * numero(orden.precioUnitario))

const totalOferta = computed(() => numero(oferta.cantidadAVender) * numero(oferta.precioUnitario))

const ordenValida = computed(
  () => numero(orden.cantidadAObtener) > 0 && numero(orden.precioUnitario) > 0,
)

const saldoMonedaOrigen = computed(() => {
  if (!billetera.value?.length) return null
  const entrada = billetera.value.find(
    (b) => (b.codigoISO || b.codigoIso || b.codigo || '').toUpperCase() === monedaOrigen.value,
  )
  return entrada?.saldo ?? null
})

const saldoInsuficiente = computed(
  () =>
    saldoMonedaOrigen.value !== null &&
    numero(oferta.cantidadAVender) > 0 &&
    numero(oferta.cantidadAVender) > saldoMonedaOrigen.value,
)

const mayorPrecioCompra = computed(() => {
  if (!libro.value?.ordenesCompra?.length) return null
  return Math.max(...libro.value.ordenesCompra.map((o) => o.precioUnitario))
})

const ofertaValida = computed(
  () =>
    numero(oferta.cantidadAVender) > 0 &&
    numero(oferta.precioUnitario) > 0 &&
    !saldoInsuficiente.value,
)

const compraValida = computed(
  () => numero(compra.cantidadAObtener) > 0 && saltosValidos(compra.cantidadMaximaSaltos),
)

const ventaValida = computed(
  () => numero(venta.cantidadAVender) > 0 && saltosValidos(venta.cantidadMaximaSaltos),
)

onMounted(async () => {
  await cargarLibro()
  await cargarBilletera()
  await cargarTiempoBusquedaCompra()
  await cargarTiempoBusquedaVenta()
})

watch(
  () => compra.cantidadMaximaSaltos,
  async () => {
    await cargarTiempoBusquedaCompra()
  },
)

watch(
  () => venta.cantidadMaximaSaltos,
  async () => {
    await cargarTiempoBusquedaVenta()
  },
)

async function cargarLibro() {
  if (!parMonedaId.value) {
    errorMessage.value = 'Par de moneda inválido.'
    return
  }

  loadingLibro.value = true
  errorMessage.value = ''

  try {
    const { data } = await getLibroOrdenes(parMonedaId.value)
    libro.value = data

    if (!orden.precioUnitario && data.ordenesCompra?.length) {
      orden.precioUnitario = data.ordenesCompra[0].precioUnitario
    }

    if (!oferta.precioUnitario && data.ofertasVenta?.length) {
      oferta.precioUnitario = Math.min(...data.ofertasVenta.map((o) => o.precioUnitario))
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo cargar el libro de órdenes.'
  } finally {
    loadingLibro.value = false
  }
}

async function crearOrdenCompra() {
  loadingOrden.value = true
  errorMessage.value = ''

  try {
    const { data } = await crearOrden({
      parMonedaId: parMonedaId.value,
      cantidadAObtener: orden.cantidadAObtener,
      precioUnitario: orden.precioUnitario,
    })

    mostrarResultado(data)
    Notify.create({ type: 'positive', message: 'Orden de compra generada.' })

    orden.cantidadAObtener = null
    await cargarLibro()
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo generar la orden.'
  } finally {
    loadingOrden.value = false
  }
}

async function cargarBilletera() {
  try {
    const { data } = await getBilletera()
    billetera.value = Array.isArray(data) ? data : data.saldos || data.billetera || data.registros || []
  } catch {
    billetera.value = []
  }
}

async function crearOfertaVenta() {
  errorMessage.value = ''

  if (mayorPrecioCompra.value !== null && oferta.precioUnitario <= mayorPrecioCompra.value) {
    await obtenerResumenOferta()
  } else {
    ofertaConfirmDialog.value = true
  }
}

async function obtenerResumenOferta() {
  loadingOferta.value = true
  errorMessage.value = ''

  try {
    const { data } = await getResumenOferta({
      parMonedaId: parMonedaId.value,
      cantidadAVender: oferta.cantidadAVender,
      precioUnitario: oferta.precioUnitario,
    })
    resumenOferta.value = data
    ofertaResumenDialog.value = true
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo obtener el resumen de la oferta.'
  } finally {
    loadingOferta.value = false
  }
}

async function confirmarOferta() {
  ofertaConfirmDialog.value = false
  ofertaResumenDialog.value = false
  loadingOferta.value = true
  errorMessage.value = ''

  try {
    const { data } = await crearOferta({
      parMonedaId: parMonedaId.value,
      cantidadAVender: oferta.cantidadAVender,
      precioUnitario: oferta.precioUnitario,
    })

    mostrarResultado(data)
    Notify.create({ type: 'positive', message: 'Oferta de venta generada.' })

    oferta.cantidadAVender = null
    await cargarLibro()
    await cargarBilletera()
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo generar la oferta.'
  } finally {
    loadingOferta.value = false
  }
}

async function cargarTiempoBusquedaCompra() {
  const saltos = Number(compra.cantidadMaximaSaltos)

  if (!authStore.isAuthenticated || !saltosValidos(saltos)) {
    tiempoBusquedaCompra.value = null
    return
  }

  loadingTiempoCompra.value = true

  try {
    const { data } = await getTiempoBusquedaCompra(saltos)
    tiempoBusquedaCompra.value = data
  } catch {
    tiempoBusquedaCompra.value = null
  } finally {
    loadingTiempoCompra.value = false
  }
}

async function cargarTiempoBusquedaVenta() {
  const saltos = Number(venta.cantidadMaximaSaltos)

  if (!authStore.isAuthenticated || !saltosValidos(saltos)) {
    tiempoBusquedaVenta.value = null
    return
  }

  loadingTiempoVenta.value = true

  try {
    const { data } = await getTiempoBusquedaVenta(saltos)
    tiempoBusquedaVenta.value = data
  } catch {
    tiempoBusquedaVenta.value = null
  } finally {
    loadingTiempoVenta.value = false
  }
}

function textoTiempoBusqueda(tiempo) {
  if (!tiempo) return ''

  const texto = tiempo.tiempoEstimadoTexto || tiempo.TiempoEstimadoTexto || ''
  const rutas = tiempo.rutasEstimadas ?? tiempo.RutasEstimadas ?? 0

  if (!texto && !rutas) return ''

  return `Tiempo estimado: ${texto}. Rutas a evaluar: ${Number(rutas).toLocaleString()}.`
}

async function confirmarCompraNormal() {
  loadingCompra.value = true
  errorMessage.value = ''

  try {
    const cantidad = numero(compra.cantidadAObtener)

    const resumenResp = await getResumenCompra({
      ParMonedaId: parMonedaId.value,
      CantidadAObtener: cantidad,
    })

    const resumen = resumenResp.data

    if (!resumen.saldoSuficiente && !resumen.SaldoSuficiente) {
      errorMessage.value = `Saldo insuficiente en ${resumen.monedaOrigen || resumen.MonedaOrigen || 'la moneda origen'}.`
      return
    }

    if (Number(resumen.cantidadEjecutable ?? resumen.CantidadEjecutable ?? 0) <= 0) {
      errorMessage.value = 'No existe liquidez disponible para ejecutar la compra.'
      return
    }

    const liquidezSuficiente = resumen.liquidezSuficiente ?? resumen.LiquidezSuficiente

    const { data } = await confirmarCompra({
      ParMonedaId: parMonedaId.value,
      CantidadAObtener: cantidad,
      ComprarCantidadDisponible: !liquidezSuficiente,
    })

    mostrarResultado(data)
    Notify.create({ type: 'positive', message: 'Compra inmediata ejecutada.' })

    compra.cantidadAObtener = null
    await cargarLibro()
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo ejecutar la compra inmediata.'
  } finally {
    loadingCompra.value = false
  }
}

async function confirmarVentaNormal() {
  loadingVenta.value = true
  errorMessage.value = ''

  try {
    const cantidad = numero(venta.cantidadAVender)

    const resumenResp = await getResumenVenta({
      ParMonedaId: parMonedaId.value,
      CantidadAVender: cantidad,
    })

    const resumen = resumenResp.data

    if (!resumen.saldoSuficiente && !resumen.SaldoSuficiente) {
      errorMessage.value = `Saldo insuficiente en ${resumen.monedaOrigen || resumen.MonedaOrigen || 'la moneda origen'}.`
      return
    }

    if (Number(resumen.cantidadEjecutable ?? resumen.CantidadEjecutable ?? 0) <= 0) {
      errorMessage.value = 'No existe liquidez disponible para ejecutar la venta.'
      return
    }

    const liquidezSuficiente = resumen.liquidezSuficiente ?? resumen.LiquidezSuficiente

    const { data } = await confirmarVenta({
      ParMonedaId: parMonedaId.value,
      CantidadAVender: cantidad,
      VenderCantidadDisponible: !liquidezSuficiente,
    })

    mostrarResultado(data)
    Notify.create({ type: 'positive', message: 'Venta inmediata ejecutada.' })

    venta.cantidadAVender = null
    await cargarLibro()
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo ejecutar la venta inmediata.'
  } finally {
    loadingVenta.value = false
  }
}

async function buscarRutaCompra() {
  loadingRutaCompra.value = true
  errorMessage.value = ''
  rutaCompra.value = null

  try {
    const cantidad = numero(compra.cantidadAObtener)
    const saltos = Number(compra.cantidadMaximaSaltos)

    if (cantidad <= 0) {
      errorMessage.value = 'La cantidad debe ser mayor a 0.'
      return
    }

    if (!saltosValidos(saltos)) {
      errorMessage.value = 'La cantidad máxima de saltos debe estar entre 1 y 5.'
      return
    }

    const { data } = await buscarRutaCompraService({
      ParMonedaId: parMonedaId.value,
      CantidadAObtener: cantidad,
      CantidadMaximaSaltos: saltos,
    })

    rutaCompra.value = data
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo buscar una ruta de compra.'
  } finally {
    loadingRutaCompra.value = false
  }
}

async function buscarRutaVenta() {
  loadingRutaVenta.value = true
  errorMessage.value = ''
  rutaVenta.value = null

  try {
    const cantidad = numero(venta.cantidadAVender)
    const saltos = Number(venta.cantidadMaximaSaltos)

    if (cantidad <= 0) {
      errorMessage.value = 'La cantidad debe ser mayor a 0.'
      return
    }

    if (!saltosValidos(saltos)) {
      errorMessage.value = 'La cantidad máxima de saltos debe estar entre 1 y 5.'
      return
    }

    const { data } = await buscarRutaVentaService({
      ParMonedaId: parMonedaId.value,
      CantidadAVender: cantidad,
      CantidadMaximaSaltos: saltos,
    })

    rutaVenta.value = data
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo buscar una ruta de venta.'
  } finally {
    loadingRutaVenta.value = false
  }
}

function mostrarResultado(data) {
  resultado.value = data
  resultadoDialog.value = true
}

function numero(valor) {
  return Number(valor || 0)
}

function saltosValidos(valor) {
  const n = Number(valor)
  return Number.isInteger(n) && n >= 1 && n <= 5
}

function formatearFecha(fecha) {
  return fecha ? new Date(fecha).toLocaleString() : '-'
}

function formatearDecimal(valor) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return '-'

  return Number(valor).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })
}
</script>

<style scoped>
.placeholder-chart {
  min-height: 220px;
  border: 1px dashed #9e9e9e;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #757575;
  background: rgba(0, 0, 0, 0.03);
}

.resultado-pre {
  white-space: pre-wrap;
  max-height: 320px;
  overflow: auto;
  font-size: 12px;
}
</style>
