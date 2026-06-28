<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Panel administrativo</div>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-md-3">
          <q-input v-model="filtro.fechaDesde" type="date" label="Fecha desde" outlined dense />
        </div>
        <div class="col-12 col-md-3">
          <q-input
            v-model="filtro.fechaHasta"
            type="date"
            label="Fecha hasta"
            outlined
            dense
            :error="fechaInvalida"
            error-message="La fecha final debe ser posterior a la fecha inicial"
          />
        </div>
        <div class="col-12 col-md-3">
          <q-btn color="primary" label="Actualizar" :disable="fechaInvalida" :loading="cargando" @click="cargar" />
        </div>
      </div>
    </q-card>

    <template v-if="dashboard">
      <div class="row q-col-gutter-md q-mb-md">
        <div v-for="m in indicadores" :key="m.label" class="col-6 col-md-3">
          <q-card flat bordered class="q-pa-md text-center">
            <div class="text-h5 xc-figure">{{ m.valor }}</div>
            <div class="text-caption text-grey-7">{{ m.label }}</div>
          </q-card>
        </div>
      </div>

      <q-banner v-if="sinOperaciones" dense class="xchang-banner xchang-banner--empty q-mb-md" rounded>
        No existen operaciones para el período seleccionado
      </q-banner>

      <template v-else>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-6">
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle2 q-mb-sm">Volumen operado por día</div>
              <Bar :data="volumenPorDiaData" :options="chartOptions" style="max-height: 280px" />
            </q-card>
          </div>
          <div class="col-12 col-md-6">
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle2 q-mb-sm">Cantidad de operaciones por día</div>
              <Bar :data="operacionesPorDiaData" :options="chartOptions" style="max-height: 280px" />
            </q-card>
          </div>
        </div>

        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-6">
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle2 q-mb-sm">Volumen operado por moneda</div>
              <Bar :data="volumenPorMonedaData" :options="chartOptions" style="max-height: 280px" />
            </q-card>
          </div>
          <div class="col-12 col-md-6">
            <q-card flat bordered class="q-pa-md">
              <div class="text-subtitle2 q-mb-sm">Distribución de operaciones por tipo</div>
              <Doughnut :data="distribucionData" :options="doughnutOptions" style="max-height: 280px" />
            </q-card>
          </div>
        </div>

        <q-card flat bordered class="q-pa-md q-mb-md">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">Monedas</div>
          <q-table :rows="dashboard.monedas" :columns="columnasMonedas" row-key="monedaId" flat dense />
        </q-card>

        <q-card flat bordered class="q-pa-md q-mb-md">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">Mejores rutas</div>
          <q-markup-table flat dense>
            <thead>
              <tr>
                <th></th>
                <th class="text-left">Fecha</th>
                <th class="text-left">Moneda inicial</th>
                <th class="text-left">Moneda final</th>
                <th class="text-right">Saltos</th>
                <th class="text-right">Ahorro / Ganancia</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(ruta, i) in dashboard.mejoresRutas" :key="i">
                <tr>
                  <td>
                    <q-btn
                      v-if="ruta.cantidadSaltos > 1"
                      flat
                      dense
                      round
                      size="sm"
                      :icon="expandido[i] ? 'expand_more' : 'chevron_right'"
                      @click="expandido[i] = !expandido[i]"
                    />
                  </td>
                  <td>{{ formatearFecha(ruta.fechaCreacion) }}</td>
                  <td>{{ ruta.monedaInicial }}</td>
                  <td>{{ ruta.monedaFinal }}</td>
                  <td class="text-right">{{ ruta.cantidadSaltos }}</td>
                  <td class="text-right">
                    {{ formatearMonto(ruta.ahorroEstimado ?? ruta.gananciaEstimada) }}
                  </td>
                </tr>
                <tr v-if="expandido[i] && ruta.cantidadSaltos > 1">
                  <td></td>
                  <td colspan="5">
                    <q-markup-table flat dense class="q-pl-lg">
                      <thead>
                        <tr>
                          <th class="text-left">Par</th>
                          <th class="text-right">Cantidad convertida</th>
                          <th class="text-right">Precio mín</th>
                          <th class="text-right">Precio máx</th>
                          <th class="text-right">Precio promedio</th>
                          <th class="text-right">Resultado</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="salto in ruta.saltos" :key="salto.numeroSalto">
                          <td>{{ salto.par }}</td>
                          <td class="text-right">{{ formatearMonto(salto.cantidadConvertida) }}</td>
                          <td class="text-right">{{ formatearMonto(salto.precioMinimo) }}</td>
                          <td class="text-right">{{ formatearMonto(salto.precioMaximo) }}</td>
                          <td class="text-right">{{ formatearMonto(salto.precioPromedio) }}</td>
                          <td class="text-right">{{ formatearMonto(salto.resultadoObtenido) }}</td>
                        </tr>
                      </tbody>
                    </q-markup-table>
                  </td>
                </tr>
              </template>
              <tr v-if="!dashboard.mejoresRutas?.length">
                <td colspan="6" class="text-center text-grey-7">Sin rutas registradas en el período</td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card>
      </template>

      <q-card flat bordered class="q-pa-md">
        <div class="row items-center q-mb-sm">
          <div class="text-subtitle1 text-weight-medium col">Actividad reciente</div>
          <q-btn flat dense icon="download" label="Exportar Excel" class="q-mr-sm" @click="onExportar('excel')" />
          <q-btn flat dense icon="picture_as_pdf" label="Exportar PDF" @click="onExportar('pdf')" />
        </div>

        <q-table
          :rows="actividad.registros"
          :columns="columnasActividad"
          row-key="fechaHora"
          :loading="cargandoActividad"
          flat
          dense
          hide-pagination
        >
          <template #body-cell-estado="props">
            <q-td :props="props">
              <EstadoBadge :estado="props.row.estado" />
            </q-td>
          </template>
          <template #no-data>
            <div class="full-width text-center xc-text-secondary q-py-md">
              {{ actividad.mensaje || 'No existen operaciones para el período seleccionado' }}
            </div>
          </template>
        </q-table>

        <div v-if="actividad.totalRegistros > 0" class="row items-center justify-end q-gutter-sm q-pa-sm">
          <div class="text-caption xc-text-secondary">
            Página {{ actividad.paginaActual }} de {{ actividad.totalPaginas }}
          </div>
          <q-btn
            flat
            dense
            round
            icon="chevron_left"
            :disable="actividad.paginaActual <= 1"
            @click="irAPaginaActividad(actividad.paginaActual - 1)"
          />
          <q-btn
            flat
            dense
            round
            icon="chevron_right"
            :disable="actividad.paginaActual >= actividad.totalPaginas"
            @click="irAPaginaActividad(actividad.paginaActual + 1)"
          />
        </div>
      </q-card>
    </template>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  getResumen,
  getActividadReciente,
  exportarActividadExcel,
  exportarActividadPdf,
} from '@/services/panelAdministrativo'
import { formatearMonto, formatearFecha } from '@/utils/formato'
import EstadoBadge from '@/components/common/EstadoBadge.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

function formatearFechaInput(fecha) {
  return fecha.toISOString().slice(0, 10)
}

const hoy = new Date()
const hace30Dias = new Date(hoy)
hace30Dias.setDate(hace30Dias.getDate() - 30)

const filtro = reactive({
  fechaDesde: formatearFechaInput(hace30Dias),
  fechaHasta: formatearFechaInput(hoy),
})
const dashboard = ref(null)
const cargando = ref(false)
const expandido = reactive({})

const actividad = reactive({
  registros: [],
  paginaActual: 1,
  totalPaginas: 1,
  totalRegistros: 0,
  mensaje: '',
})
const cargandoActividad = ref(false)

const fechaInvalida = computed(() => {
  if (!filtro.fechaDesde || !filtro.fechaHasta) return false
  return new Date(filtro.fechaDesde) > new Date(filtro.fechaHasta)
})

const sinOperaciones = computed(() => {
  if (!dashboard.value) return false
  return (
    Number(dashboard.value.volumenTotalOperado) === 0 &&
    Number(dashboard.value.transaccionesEjecutadas) === 0 &&
    Number(dashboard.value.totalDepositos) === 0 &&
    Number(dashboard.value.totalRetiros) === 0
  )
})

const indicadores = computed(() => {
  if (!dashboard.value) return []
  const d = dashboard.value
  return [
    { label: 'Total usuarios registrados', valor: d.totalUsuariosRegistrados },
    { label: 'Usuarios activos en el período', valor: d.usuariosActivosEnPeriodo },
    { label: 'Total depósitos', valor: formatearMonto(d.totalDepositos) },
    { label: 'Total retiros', valor: formatearMonto(d.totalRetiros) },
    { label: 'Volumen total operado', valor: formatearMonto(d.volumenTotalOperado) },
    { label: 'Órdenes activas', valor: d.ordenesActivas },
    { label: 'Ofertas activas', valor: d.ofertasActivas },
    { label: 'Transacciones ejecutadas', valor: d.transaccionesEjecutadas },
  ]
})

const columnasMonedas = [
  { name: 'codigoMoneda', label: 'Código ISO', field: 'codigoMoneda', align: 'left' },
  { name: 'volumenOperado', label: 'Volumen operado', field: (r) => formatearMonto(r.volumenOperado), align: 'right' },
  { name: 'cantidadOperaciones', label: 'Cant. operaciones', field: 'cantidadOperaciones', align: 'right' },
  { name: 'cantidadComprada', label: 'Cant. comprada', field: (r) => formatearMonto(r.cantidadComprada), align: 'right' },
  { name: 'cantidadVendida', label: 'Cant. vendida', field: (r) => formatearMonto(r.cantidadVendida), align: 'right' },
  { name: 'totalDepositado', label: 'Total depositado', field: (r) => formatearMonto(r.totalDepositado), align: 'right' },
  { name: 'totalRetirado', label: 'Total retirado', field: (r) => formatearMonto(r.totalRetirado), align: 'right' },
]

const columnasActividad = [
  { name: 'fechaHora', label: 'Fecha y hora', field: (r) => formatearFecha(r.fechaHora), align: 'left' },
  { name: 'usuario', label: 'Usuario', field: 'usuario', align: 'left' },
  { name: 'tipoOperacion', label: 'Tipo de operación', field: 'tipoOperacion', align: 'left' },
  { name: 'par', label: 'Par', field: 'par', align: 'left' },
  { name: 'montoTotal', label: 'Monto total', field: (r) => formatearMonto(r.montoTotal), align: 'right' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
]

const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
const doughnutOptions = { responsive: true, maintainAspectRatio: false }

const paletaColores = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2']

const volumenPorDiaData = computed(() => ({
  labels: (dashboard.value?.volumenPorDia || []).map((v) => formatearFecha(v.fecha)),
  datasets: [
    {
      label: 'Volumen',
      data: (dashboard.value?.volumenPorDia || []).map((v) => v.volumen),
      backgroundColor: '#2563eb',
    },
  ],
}))

const operacionesPorDiaData = computed(() => ({
  labels: (dashboard.value?.operacionesPorDia || []).map((v) => formatearFecha(v.fecha)),
  datasets: [
    {
      label: 'Operaciones',
      data: (dashboard.value?.operacionesPorDia || []).map((v) => v.cantidadOperaciones),
      backgroundColor: '#16a34a',
    },
  ],
}))

const volumenPorMonedaData = computed(() => ({
  labels: (dashboard.value?.monedas || []).map((m) => m.codigoMoneda),
  datasets: [
    {
      label: 'Volumen',
      data: (dashboard.value?.monedas || []).map((m) => m.volumenOperado),
      backgroundColor: '#2563eb',
    },
  ],
}))

const distribucionData = computed(() => ({
  labels: (dashboard.value?.distribucionPorTipo || []).map((d) => d.tipoOperacion),
  datasets: [
    {
      data: (dashboard.value?.distribucionPorTipo || []).map((d) => d.cantidad),
      backgroundColor: paletaColores,
    },
  ],
}))

function buildFiltroFechas() {
  return {
    fechaDesde: filtro.fechaDesde || undefined,
    fechaHasta: filtro.fechaHasta || undefined,
  }
}

async function cargar() {
  if (fechaInvalida.value) return
  cargando.value = true
  try {
    const { data } = await getResumen(buildFiltroFechas())
    dashboard.value = data
    Object.keys(expandido).forEach((k) => delete expandido[k])
    await cargarActividad(1)
  } finally {
    cargando.value = false
  }
}

async function cargarActividad(pagina) {
  cargandoActividad.value = true
  try {
    const { data } = await getActividadReciente({ ...buildFiltroFechas(), pagina, registrosPorPagina: 20 })
    actividad.registros = data.registros || []
    actividad.paginaActual = data.paginaActual || 1
    actividad.totalPaginas = data.totalPaginas || 1
    actividad.totalRegistros = data.totalRegistros ?? actividad.registros.length
    actividad.mensaje = data.mensaje || ''
  } finally {
    cargandoActividad.value = false
  }
}

function irAPaginaActividad(pagina) {
  cargarActividad(pagina)
}

async function onExportar(tipo) {
  const fn = tipo === 'excel' ? exportarActividadExcel : exportarActividadPdf
  const { data } = await fn(buildFiltroFechas())
  const blob = new Blob([data])
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `actividad_reciente.${tipo === 'excel' ? 'xls' : 'pdf'}`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(cargar)
</script>
