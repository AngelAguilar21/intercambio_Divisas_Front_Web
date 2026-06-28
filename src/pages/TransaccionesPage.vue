<template>
  <q-page class="q-pa-md">
    <div class="xc-page-head">
      <span class="xc-section-kicker">
        <q-icon name="receipt_long" size="14px" />
        Transacciones
      </span>
      <h1 class="xc-section-title">Órdenes y ofertas activas</h1>
      <div class="xc-section-bar" aria-hidden="true" />
    </div>

    <q-card flat bordered class="q-pa-md q-mb-md xc-card-accent">
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-md-3">
          <q-input v-model="filtros.desde" type="date" label="Fecha desde" outlined dense />
        </div>

        <div class="col-12 col-md-3">
          <q-input
            v-model="filtros.hasta"
            type="date"
            label="Fecha hasta"
            outlined
            dense
            :error="fechaInvalida"
            error-message="La fecha final debe ser posterior a la fecha inicial"
          />
        </div>

        <div class="col-12 col-md-3">
          <q-select
            v-model="filtros.tamanoPagina"
            label="Registros por página"
            outlined
            dense
            :options="[10, 20, 50, 100]"
          />
        </div>

        <div class="col-12 col-md-3">
          <q-btn
            color="primary"
            label="Buscar"
            class="full-width"
            :disable="fechaInvalida"
            @click="cargar"
          />
        </div>
      </div>
    </q-card>

    <q-banner v-if="sinRegistros" dense class="xchang-banner xchang-banner--empty q-mb-md" rounded>
      No existen órdenes ni ofertas activas
    </q-banner>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-lg-6">
        <q-card flat bordered class="xc-card-accent">
          <q-card-section class="row items-center q-gutter-sm">
            <div class="xc-icon-badge">
              <q-icon name="north_east" size="16px" color="primary" />
            </div>
            <div class="text-subtitle1 text-weight-medium">Órdenes de compra activas</div>
          </q-card-section>

          <q-table
            :rows="ordenesOrdenadas"
            :columns="columnasOrdenes"
            row-key="ordenCompraId"
            :loading="cargandoOrdenes"
            flat
            hide-pagination
            :rows-per-page-options="[0]"
          >
            <template #body-cell-par="props">
              <q-td :props="props">
                <ParMonedaChip
                  :origen="props.row.monedaOrigen"
                  :destino="props.row.monedaDestino"
                />
              </q-td>
            </template>
            <template #body-cell-estado="props">
              <q-td :props="props">
                <EstadoBadge :estado="props.row.estado" />
              </q-td>
            </template>
            <template #body-cell-acciones="props">
              <q-td :props="props">
                <q-btn
                  v-if="esCancelable(props.row.estado)"
                  size="sm"
                  color="negative"
                  flat
                  label="Cancelar"
                  @click="abrirCancelacion('Orden de compra', props.row)"
                />
              </q-td>
            </template>
            <template #no-data>
              <div class="full-width text-center xc-text-secondary q-py-md">
                Sin órdenes de compra activas
              </div>
            </template>
          </q-table>

          <div v-if="totalOrdenes > 0" class="row items-center justify-end q-gutter-sm q-pa-sm">
            <div class="text-caption xc-text-secondary">
              Página {{ paginacionOrdenes.page }} de {{ totalPaginasOrdenes }}
            </div>
            <q-btn
              flat
              dense
              round
              icon="first_page"
              :disable="paginacionOrdenes.page === 1"
              @click="irAPaginaOrdenes(1)"
            />
            <q-btn
              flat
              dense
              label="Anterior"
              :disable="paginacionOrdenes.page === 1"
              @click="irAPaginaOrdenes(paginacionOrdenes.page - 1)"
            />
            <q-btn
              flat
              dense
              label="Siguiente"
              :disable="paginacionOrdenes.page >= totalPaginasOrdenes"
              @click="irAPaginaOrdenes(paginacionOrdenes.page + 1)"
            />
            <q-btn
              flat
              dense
              round
              icon="last_page"
              :disable="paginacionOrdenes.page >= totalPaginasOrdenes"
              @click="irAPaginaOrdenes(totalPaginasOrdenes)"
            />
          </div>
        </q-card>
      </div>

      <div class="col-12 col-lg-6">
        <q-card flat bordered class="xc-card-accent">
          <q-card-section class="row items-center q-gutter-sm">
            <div class="xc-icon-badge">
              <q-icon name="south_west" size="16px" color="primary" />
            </div>
            <div class="text-subtitle1 text-weight-medium">Ofertas de venta activas</div>
          </q-card-section>

          <q-table
            :rows="ofertasOrdenadas"
            :columns="columnasOfertas"
            row-key="ofertaVentaId"
            :loading="cargandoOfertas"
            flat
            hide-pagination
            :rows-per-page-options="[0]"
          >
            <template #body-cell-par="props">
              <q-td :props="props">
                <ParMonedaChip
                  :origen="props.row.monedaOrigen"
                  :destino="props.row.monedaDestino"
                />
              </q-td>
            </template>
            <template #body-cell-estado="props">
              <q-td :props="props">
                <EstadoBadge :estado="props.row.estado" />
              </q-td>
            </template>
            <template #body-cell-acciones="props">
              <q-td :props="props">
                <q-btn
                  v-if="esCancelable(props.row.estado)"
                  size="sm"
                  color="negative"
                  flat
                  label="Cancelar"
                  @click="abrirCancelacion('Oferta de venta', props.row)"
                />
              </q-td>
            </template>
            <template #no-data>
              <div class="full-width text-center xc-text-secondary q-py-md">
                Sin ofertas de venta activas
              </div>
            </template>
          </q-table>

          <div v-if="totalOfertas > 0" class="row items-center justify-end q-gutter-sm q-pa-sm">
            <div class="text-caption xc-text-secondary">
              Página {{ paginacionOfertas.page }} de {{ totalPaginasOfertas }}
            </div>
            <q-btn
              flat
              dense
              round
              icon="first_page"
              :disable="paginacionOfertas.page === 1"
              @click="irAPaginaOfertas(1)"
            />
            <q-btn
              flat
              dense
              label="Anterior"
              :disable="paginacionOfertas.page === 1"
              @click="irAPaginaOfertas(paginacionOfertas.page - 1)"
            />
            <q-btn
              flat
              dense
              label="Siguiente"
              :disable="paginacionOfertas.page >= totalPaginasOfertas"
              @click="irAPaginaOfertas(paginacionOfertas.page + 1)"
            />
            <q-btn
              flat
              dense
              round
              icon="last_page"
              :disable="paginacionOfertas.page >= totalPaginasOfertas"
              @click="irAPaginaOfertas(totalPaginasOfertas)"
            />
          </div>
        </q-card>
      </div>
    </div>

    <CancelarDialog
      v-if="cancelacion.referenciaId"
      v-model="dialogAbierto"
      :tipo-operacion="cancelacion.tipoOperacion"
      :referencia-id="cancelacion.referenciaId"
      @cancelado="onCancelado"
    />
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Notify } from 'quasar'
import { getOrdenes } from '@/services/ordenes'
import { getOfertas } from '@/services/ofertas'
import CancelarDialog from '@/components/mercado/CancelarDialog.vue'
import ParMonedaChip from '@/components/common/ParMonedaChip.vue'
import EstadoBadge from '@/components/common/EstadoBadge.vue'
import { useBilleteraStore } from '@/stores/billetera'

const billeteraStore = useBilleteraStore()

const filtros = reactive({
  desde: '',
  hasta: '',
  tamanoPagina: 10,
})

const ordenes = ref([])
const ofertas = ref([])
const totalOrdenes = ref(0)
const totalOfertas = ref(0)
const cargandoOrdenes = ref(false)
const cargandoOfertas = ref(false)
const cargando = computed(() => cargandoOrdenes.value || cargandoOfertas.value)

const paginacionOrdenes = reactive({ page: 1 })
const paginacionOfertas = reactive({ page: 1 })

const dialogAbierto = ref(false)
const cancelacion = reactive({
  tipoOperacion: '',
  referenciaId: null,
})

const fechaInvalida = computed(() => {
  if (!filtros.desde || !filtros.hasta) return false
  return new Date(filtros.desde) > new Date(filtros.hasta)
})

const sinRegistros = computed(
  () => !cargando.value && totalOrdenes.value === 0 && totalOfertas.value === 0,
)

function porFechaDescendente(a, b) {
  return new Date(b.fechaCreacion) - new Date(a.fechaCreacion)
}

const ordenesOrdenadas = computed(() => [...ordenes.value].sort(porFechaDescendente))
const ofertasOrdenadas = computed(() => [...ofertas.value].sort(porFechaDescendente))

const totalPaginasOrdenes = computed(() =>
  Math.max(1, Math.ceil(totalOrdenes.value / filtros.tamanoPagina)),
)
const totalPaginasOfertas = computed(() =>
  Math.max(1, Math.ceil(totalOfertas.value / filtros.tamanoPagina)),
)

watch(() => filtros.tamanoPagina, cargar)

function calcularTotalRestante(row, totalOriginalField) {
  if (row.totalPendiente != null) return row.totalPendiente
  if (row.cantidadPendiente == null || row.precioUnitario == null) return row[totalOriginalField]
  return row.cantidadPendiente * row.precioUnitario
}

function formatearMonto(valor) {
  return typeof valor === 'number' ? valor.toFixed(4) : (valor ?? '-')
}

const columnasOrdenes = [
  {
    name: 'fechaCreacion',
    label: 'Fecha',
    field: (row) => formatearFecha(row.fechaCreacion),
    align: 'left',
  },
  {
    name: 'par',
    label: 'Par',
    field: (row) => `${row.monedaOrigen}/${row.monedaDestino}`,
    align: 'left',
  },
  {
    name: 'precioUnitario',
    label: 'Precio unitario',
    field: 'precioUnitario',
    align: 'right',
    classes: 'xc-figure',
  },
  {
    name: 'cantidadOriginal',
    label: 'Cantidad original',
    field: 'cantidadOriginal',
    align: 'right',
    classes: 'xc-figure',
  },
  {
    name: 'cantidadPendiente',
    label: 'Cantidad restante',
    field: 'cantidadPendiente',
    align: 'right',
    classes: 'xc-figure',
  },
  {
    name: 'totalComprometido',
    label: 'Total original',
    field: 'totalComprometido',
    align: 'right',
    classes: 'xc-figure',
  },
  {
    name: 'totalRestante',
    label: 'Total restante',
    field: (row) => formatearMonto(calcularTotalRestante(row, 'totalComprometido')),
    align: 'right',
    classes: 'xc-figure',
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  { name: 'acciones', label: '', field: 'acciones', align: 'right' },
]

const columnasOfertas = [
  {
    name: 'fechaCreacion',
    label: 'Fecha',
    field: (row) => formatearFecha(row.fechaCreacion),
    align: 'left',
  },
  {
    name: 'par',
    label: 'Par',
    field: (row) => `${row.monedaOrigen}/${row.monedaDestino}`,
    align: 'left',
  },
  {
    name: 'precioUnitario',
    label: 'Precio unitario',
    field: 'precioUnitario',
    align: 'right',
    classes: 'xc-figure',
  },
  {
    name: 'cantidadOriginal',
    label: 'Cantidad original',
    field: 'cantidadOriginal',
    align: 'right',
    classes: 'xc-figure',
  },
  {
    name: 'cantidadPendiente',
    label: 'Cantidad restante',
    field: 'cantidadPendiente',
    align: 'right',
    classes: 'xc-figure',
  },
  {
    name: 'totalEsperado',
    label: 'Total original',
    field: 'totalEsperado',
    align: 'right',
    classes: 'xc-figure',
  },
  {
    name: 'totalRestante',
    label: 'Total restante',
    field: (row) => formatearMonto(calcularTotalRestante(row, 'totalEsperado')),
    align: 'right',
    classes: 'xc-figure',
  },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  { name: 'acciones', label: '', field: 'acciones', align: 'right' },
]

onMounted(cargar)

function filtroBase() {
  return {
    desde: filtros.desde || undefined,
    hasta: filtros.hasta || undefined,
    tamanoPagina: filtros.tamanoPagina,
  }
}

async function cargarOrdenes() {
  cargandoOrdenes.value = true
  try {
    const { data } = await getOrdenes({ ...filtroBase(), pagina: paginacionOrdenes.page })
    ordenes.value = data.ordenes || []
    totalOrdenes.value = data.totalRegistros ?? ordenes.value.length
  } finally {
    cargandoOrdenes.value = false
  }
}

async function cargarOfertas() {
  cargandoOfertas.value = true
  try {
    const { data } = await getOfertas({ ...filtroBase(), pagina: paginacionOfertas.page })
    ofertas.value = data.ofertas || []
    totalOfertas.value = data.totalRegistros ?? ofertas.value.length
  } finally {
    cargandoOfertas.value = false
  }
}

async function cargar() {
  if (fechaInvalida.value) return

  paginacionOrdenes.page = 1
  paginacionOfertas.page = 1
  await Promise.all([cargarOrdenes(), cargarOfertas()])
}

function irAPaginaOrdenes(pagina) {
  paginacionOrdenes.page = pagina
  cargarOrdenes()
}

function irAPaginaOfertas(pagina) {
  paginacionOfertas.page = pagina
  cargarOfertas()
}

function formatearFecha(fecha) {
  return fecha ? new Date(fecha).toLocaleString() : '-'
}

function esCancelable(estado) {
  return estado === 'Activa' || estado === 'Parcialmente ejecutada'
}

function abrirCancelacion(tipoOperacion, row) {
  cancelacion.tipoOperacion = tipoOperacion
  cancelacion.referenciaId =
    tipoOperacion === 'Orden de compra' ? row.ordenCompraId : row.ofertaVentaId
  dialogAbierto.value = true
}

function onCancelado() {
  Notify.create({ type: 'positive', message: 'Operación cancelada correctamente.' })
  cancelacion.tipoOperacion = ''
  cancelacion.referenciaId = null
  cargar()
  billeteraStore.refrescar()
}
</script>
