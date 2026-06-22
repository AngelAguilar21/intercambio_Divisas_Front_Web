<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Mercado de divisas</div>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="row q-col-gutter-md items-end">
        <div class="col-6 col-md-2">
          <q-select v-model="filtro.monedaEntrega" label="Entrego" outlined dense :options="monedaIsoOptions" emit-value map-options />
        </div>
        <div class="col-6 col-md-2">
          <q-select v-model="filtro.monedaObtiene" label="Obtengo" outlined dense :options="monedaIsoOptions" emit-value map-options />
        </div>
        <div class="col-6 col-md-3">
          <q-select v-model="filtro.criterio" label="Ordenar por" outlined dense :options="criterioOptions" emit-value map-options />
        </div>
        <div class="col-6 col-md-2">
          <q-select
            v-model="filtro.direccion"
            label="Dirección"
            outlined
            dense
            :options="[{ label: 'Descendente', value: 'desc' }, { label: 'Ascendente', value: 'asc' }]"
            emit-value
            map-options
          />
        </div>
        <div class="col-12 col-md-3">
          <q-btn color="primary" label="Buscar" class="full-width" @click="buscar" />
        </div>
      </div>
    </q-card>

    <q-card flat bordered class="q-pa-md">
      <q-table
        :rows="pares"
        :columns="columnas"
        row-key="parMonedaId"
        :loading="cargando"
        flat
        v-model:pagination="paginacion"
        @request="onRequest"
        @row-click="(evt, row) => abrirLibro(row)"
        class="cursor-pointer"
      />
    </q-card>

    <LibroOrdenesDialog
      v-model="dialogAbierto"
      :par-moneda-id="parSeleccionado?.parMonedaId"
      :par="parSeleccionado ? `${parSeleccionado.monedaEntrega}/${parSeleccionado.monedaObtiene}` : ''"
    />
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getMonedas } from '@/services/monedas'
import { getListadoPares } from '@/services/preciosPares'
import LibroOrdenesDialog from '@/components/mercado/LibroOrdenesDialog.vue'

const monedaIsoOptions = ref([{ label: 'Cualquiera', value: 'Cualquiera' }])
const criterioOptions = [
  { label: 'Mejor precio de compra', value: 'MayorPrecioCompra' },
  { label: 'Mejor precio de venta', value: 'MenorPrecioVenta' },
  { label: 'Margen', value: 'Margen' },
  { label: 'Volumen', value: 'Volumen' },
]

const filtro = ref({ monedaEntrega: 'Cualquiera', monedaObtiene: 'Cualquiera', criterio: 'MayorPrecioCompra', direccion: 'desc' })
const pares = ref([])
const cargando = ref(false)
const paginacion = ref({ page: 1, rowsPerPage: 20, rowsNumber: 0 })

const columnas = [
  { name: 'par', label: 'Par', field: (row) => `${row.monedaEntrega}/${row.monedaObtiene}`, align: 'left' },
  { name: 'mayorPrecioCompra', label: 'Mejor precio compra', field: 'mayorPrecioCompra', align: 'right' },
  { name: 'menorPrecioVenta', label: 'Mejor precio venta', field: 'menorPrecioVenta', align: 'right' },
  { name: 'margen', label: 'Margen', field: 'margen', align: 'right' },
]

const dialogAbierto = ref(false)
const parSeleccionado = ref(null)

onMounted(async () => {
  const { data } = await getMonedas()
  monedaIsoOptions.value = [
    { label: 'Cualquiera', value: 'Cualquiera' },
    ...data.map((m) => ({ label: m.codigoISO, value: m.codigoISO })),
  ]
  await buscar()
})

async function buscar() {
  paginacion.value.page = 1
  await cargarPares()
}

async function onRequest(props) {
  paginacion.value.page = props.pagination.page
  await cargarPares()
}

async function cargarPares() {
  cargando.value = true
  try {
    const { data } = await getListadoPares({
      ...filtro.value,
      pagina: paginacion.value.page,
      registrosPorPagina: String(paginacion.value.rowsPerPage),
    })
    pares.value = data.registros
    paginacion.value.rowsNumber = data.totalRegistros
  } finally {
    cargando.value = false
  }
}

function abrirLibro(row) {
  if (!row.parMonedaId) return
  parSeleccionado.value = row
  dialogAbierto.value = true
}
</script>
