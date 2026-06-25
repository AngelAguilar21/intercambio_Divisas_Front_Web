<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5">Monedas</div>
        <div class="text-body2 text-grey-7">
          Selecciona un par de monedas para ver su detalle y operar.
        </div>
      </div>
    </div>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-md-2">
          <q-select
            v-model="filtro.monedaEntrega"
            label="Moneda entregada"
            outlined
            dense
            :options="monedaIsoOptions"
            emit-value
            map-options
          />
        </div>

        <div class="col-12 col-md-2">
          <q-select
            v-model="filtro.monedaObtiene"
            label="Moneda obtenida"
            outlined
            dense
            :options="monedaIsoOptions"
            emit-value
            map-options
          />
        </div>

        <div class="col-12 col-md-3">
          <q-select
            v-model="filtro.criterio"
            label="Ordenar por"
            outlined
            dense
            :options="criterioOptions"
            emit-value
            map-options
          />
        </div>

        <div class="col-12 col-md-2">
          <q-btn
            outline
            color="primary"
            class="full-width"
            :label="filtro.direccion === 'desc' ? 'Descendente' : 'Ascendente'"
            @click="alternarDireccion"
          />
        </div>

        <div class="col-12 col-md-2">
          <q-toggle
            v-model="filtro.colapsarParesInversos"
            label="Colapsar inversos"
            @update:model-value="buscar"
          />
        </div>

        <div class="col-12 col-md-1">
          <q-btn color="primary" icon="search" class="full-width" @click="buscar" />
        </div>
      </div>
    </q-card>

    <q-card flat bordered>
      <q-table
        v-model:pagination="paginacion"
        :rows="pares"
        :columns="columnas"
        row-key="parMonedaId"
        :loading="cargando"
        flat
        binary-state-sort
        :rows-per-page-options="[10, 20, 40, 100, 200, 400, 0]"
        @request="onRequest"
        @row-click="abrirDetalle"
      >
        <template #body-cell-par="props">
          <q-td :props="props">
            <span class="text-weight-medium">
              {{ props.row.monedaEntrega }}/{{ props.row.monedaObtiene }}
            </span>
          </q-td>
        </template>

        <template #body-cell-mayorPrecioCompra="props">
          <q-td :props="props" class="text-right text-blue">
            {{ formatearDecimal(props.row.mayorPrecioCompra) }}
          </q-td>
        </template>

        <template #body-cell-menorPrecioVenta="props">
          <q-td :props="props" class="text-right text-green">
            {{ formatearDecimal(props.row.menorPrecioVenta) }}
          </q-td>
        </template>

        <template #body-cell-margen="props">
          <q-td :props="props" class="text-right">
            {{ formatearDecimal(props.row.margen) }}
          </q-td>
        </template>

        <template #body-cell-acciones="props">
          <q-td :props="props" class="text-right">
            <q-btn
              dense
              flat
              color="primary"
              label="Ver detalle"
              @click.stop="abrirDetalle(null, props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-banner v-if="errorMessage" dense rounded class="bg-red-1 text-red-9 q-mt-md">
      {{ errorMessage }}
    </q-banner>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getMonedas } from '@/services/monedas'
import { getListadoPares } from '@/services/preciosPares'

const router = useRouter()

const monedaIsoOptions = ref([{ label: 'Cualquiera', value: 'Cualquiera' }])

const criterioOptions = [
  { label: 'Fecha de transacción más reciente', value: 'FechaReciente' },
  { label: 'Volumen de transacciones', value: 'Volumen' },
  { label: 'Mayor precio de compra', value: 'MayorPrecioCompra' },
  { label: 'Menor precio de venta', value: 'MenorPrecioVenta' },
  { label: 'Margen', value: 'Margen' },
]

const filtro = reactive({
  monedaEntrega: 'Cualquiera',
  monedaObtiene: 'Cualquiera',
  criterio: 'MayorPrecioCompra',
  direccion: 'desc',
  colapsarParesInversos: false,
})

const pares = ref([])
const cargando = ref(false)
const errorMessage = ref('')

const paginacion = ref({
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0,
})

const columnas = [
  {
    name: 'par',
    label: 'Par',
    align: 'left',
  },
  {
    name: 'mayorPrecioCompra',
    label: 'Mayor precio de compra',
    field: 'mayorPrecioCompra',
    align: 'right',
  },
  {
    name: 'menorPrecioVenta',
    label: 'Menor precio de venta',
    field: 'menorPrecioVenta',
    align: 'right',
  },
  {
    name: 'margen',
    label: 'Margen',
    field: 'margen',
    align: 'right',
  },
  {
    name: 'acciones',
    label: '',
    align: 'right',
  },
]

onMounted(async () => {
  await cargarMonedas()
  await cargarPares()
})

async function cargarMonedas() {
  try {
    const { data } = await getMonedas()

    const lista = Array.isArray(data) ? data : data.monedas || data.registros || []

    monedaIsoOptions.value = [
      { label: 'Cualquiera', value: 'Cualquiera' },
      ...lista.map((m) => {
        const codigo = m.codigoISO || m.codigoIso || m.codigo || m.CodigoIso || m.CodigoISO
        const nombre = m.nombre || m.Nombre || ''

        return {
          label: `${codigo} - ${nombre}`,
          value: codigo,
        }
      }),
    ]
  } catch {
    errorMessage.value = 'No se pudieron cargar las monedas.'
  }
}

function alternarDireccion() {
  filtro.direccion = filtro.direccion === 'desc' ? 'asc' : 'desc'
  buscar()
}

async function buscar() {
  paginacion.value.page = 1
  await cargarPares()
}

async function onRequest(props) {
  paginacion.value.page = props.pagination.page
  paginacion.value.rowsPerPage = props.pagination.rowsPerPage
  await cargarPares()
}

async function cargarPares() {
  cargando.value = true
  errorMessage.value = ''

  try {
    const registrosPorPagina =
      paginacion.value.rowsPerPage === 0 ? 'Todos' : String(paginacion.value.rowsPerPage)

    const { data } = await getListadoPares({
      monedaEntrega: filtro.monedaEntrega,
      monedaObtiene: filtro.monedaObtiene,
      criterio: filtro.criterio,
      direccion: filtro.direccion,
      colapsarParesInversos: filtro.colapsarParesInversos,
      pagina: paginacion.value.page,
      registrosPorPagina,
    })

    pares.value = data.registros || []
    paginacion.value.rowsNumber = data.totalRegistros || 0
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo cargar el listado de pares.'
  } finally {
    cargando.value = false
  }
}

function abrirDetalle(evt, row) {
  if (!row?.parMonedaId) {
    errorMessage.value = 'El par seleccionado no tiene identificador válido.'
    return
  }

  router.push({
    name: 'par-detalle',
    params: {
      parMonedaId: row.parMonedaId,
    },
    query: {
      origen: row.monedaEntrega,
      destino: row.monedaObtiene,
    },
  })
}

function formatearDecimal(valor) {
  if (valor === null || valor === undefined) return '-'
  return Number(valor).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })
}
</script>
