<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Transacciones</div>

    <q-card flat bordered class="q-pa-md q-mb-md">
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
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium">Órdenes de compra activas</div>
          </q-card-section>

          <q-table
            :rows="ordenes"
            :columns="columnasOrdenes"
            row-key="ordenCompraId"
            :loading="cargando"
            flat
            :pagination="{ rowsPerPage: filtros.tamanoPagina }"
          >
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
          </q-table>
        </q-card>
      </div>

      <div class="col-12 col-lg-6">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-subtitle1 text-weight-medium">Ofertas de venta activas</div>
          </q-card-section>

          <q-table
            :rows="ofertas"
            :columns="columnasOfertas"
            row-key="ofertaVentaId"
            :loading="cargando"
            flat
            :pagination="{ rowsPerPage: filtros.tamanoPagina }"
          >
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
          </q-table>
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
import { computed, onMounted, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { getOrdenes } from '@/services/ordenes'
import { getOfertas } from '@/services/ofertas'
import CancelarDialog from '@/components/mercado/CancelarDialog.vue'

const filtros = reactive({
  desde: '',
  hasta: '',
  pagina: 1,
  tamanoPagina: 10,
})

const ordenes = ref([])
const ofertas = ref([])
const cargando = ref(false)

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
  () => !cargando.value && ordenes.value.length === 0 && ofertas.value.length === 0,
)

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
  { name: 'precioUnitario', label: 'Precio unitario', field: 'precioUnitario', align: 'right' },
  {
    name: 'cantidadOriginal',
    label: 'Cantidad original',
    field: 'cantidadOriginal',
    align: 'right',
  },
  {
    name: 'cantidadPendiente',
    label: 'Cantidad restante',
    field: 'cantidadPendiente',
    align: 'right',
  },
  {
    name: 'totalComprometido',
    label: 'Total original',
    field: 'totalComprometido',
    align: 'right',
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
  { name: 'precioUnitario', label: 'Precio unitario', field: 'precioUnitario', align: 'right' },
  {
    name: 'cantidadOriginal',
    label: 'Cantidad original',
    field: 'cantidadOriginal',
    align: 'right',
  },
  {
    name: 'cantidadPendiente',
    label: 'Cantidad restante',
    field: 'cantidadPendiente',
    align: 'right',
  },
  { name: 'totalEsperado', label: 'Total original', field: 'totalEsperado', align: 'right' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  { name: 'acciones', label: '', field: 'acciones', align: 'right' },
]

onMounted(cargar)

async function cargar() {
  if (fechaInvalida.value) return

  cargando.value = true

  try {
    const params = {
      desde: filtros.desde || undefined,
      hasta: filtros.hasta || undefined,
      pagina: filtros.pagina,
      tamanoPagina: filtros.tamanoPagina,
    }

    const [ordenesResp, ofertasResp] = await Promise.all([getOrdenes(params), getOfertas(params)])

    ordenes.value = ordenesResp.data.ordenes || []
    ofertas.value = ofertasResp.data.ofertas || []
  } finally {
    cargando.value = false
  }
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
}
</script>
