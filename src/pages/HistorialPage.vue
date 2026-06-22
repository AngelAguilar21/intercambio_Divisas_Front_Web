<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Historial de transacciones</div>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="row q-col-gutter-md items-end">
        <div class="col-6 col-md-3">
          <q-input v-model="filtro.fechaDesde" type="date" label="Desde" outlined dense />
        </div>
        <div class="col-6 col-md-3">
          <q-input v-model="filtro.fechaHasta" type="date" label="Hasta" outlined dense />
        </div>
        <div class="col-6 col-md-3">
          <q-select v-model="filtroEstado" label="Estado" outlined dense :options="estadoOptions" />
        </div>
        <div class="col-6 col-md-3">
          <q-btn color="primary" label="Buscar" class="full-width" :loading="cargando" @click="cargar" />
        </div>
      </div>
    </q-card>

    <q-tabs v-model="tab" dense class="text-primary q-mb-sm" align="left" @update:model-value="cargar">
      <q-tab name="OrdenesCompra" label="Órdenes de compra" />
      <q-tab name="OfertasVenta" label="Ofertas de venta" />
      <q-tab name="ComprasInmediatas" label="Compras inmediatas" />
      <q-tab name="VentasInmediatas" label="Ventas inmediatas" />
      <q-tab name="Depositos" label="Depósitos" />
      <q-tab name="Retiros" label="Retiros" />
    </q-tabs>

    <q-card flat bordered class="q-pa-md">
      <div class="row q-mb-sm">
        <q-space />
        <q-btn flat dense icon="download" label="Exportar CSV" class="q-mr-sm" @click="exportarCsv" />
        <q-btn flat dense icon="print" label="Exportar PDF" @click="exportarPdf" />
      </div>

      <q-table :rows="filasFiltradas" :columns="columnasActuales" row-key="id" :loading="cargando" flat />
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getHistorial, getParaExportar } from '@/services/historial'

const tab = ref('OrdenesCompra')
const filtro = ref({ fechaDesde: '', fechaHasta: '' })
const filtroEstado = ref('Todos')
const estadoOptions = ['Todos', 'Activa', 'Parcialmente ejecutada', 'Completada', 'Cancelada']

const cargando = ref(false)
const filas = ref([])

const columnasPorTab = {
  OrdenesCompra: [
    { name: 'fechaHora', label: 'Fecha', field: (r) => new Date(r.fechaHora).toLocaleString(), align: 'left' },
    { name: 'parMonedas', label: 'Par', field: 'parMonedas', align: 'left' },
    { name: 'cantidadOriginal', label: 'Cantidad', field: 'cantidadOriginal', align: 'right' },
    { name: 'precioUnitario', label: 'Precio', field: 'precioUnitario', align: 'right' },
    { name: 'totalComprometido', label: 'Total comprometido', field: 'totalComprometido', align: 'right' },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  ],
  OfertasVenta: [
    { name: 'fechaHora', label: 'Fecha', field: (r) => new Date(r.fechaHora).toLocaleString(), align: 'left' },
    { name: 'parMonedas', label: 'Par', field: 'parMonedas', align: 'left' },
    { name: 'cantidadOriginal', label: 'Cantidad', field: 'cantidadOriginal', align: 'right' },
    { name: 'precioUnitario', label: 'Precio', field: 'precioUnitario', align: 'right' },
    { name: 'totalEsperado', label: 'Total esperado', field: 'totalEsperado', align: 'right' },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  ],
  ComprasInmediatas: [
    { name: 'fechaHora', label: 'Fecha', field: (r) => new Date(r.fechaHora).toLocaleString(), align: 'left' },
    { name: 'parMonedas', label: 'Par', field: 'parMonedas', align: 'left' },
    { name: 'cantidadObtenida', label: 'Cantidad obtenida', field: 'cantidadObtenida', align: 'right' },
    { name: 'totalPagado', label: 'Total pagado', field: 'totalPagado', align: 'right' },
    { name: 'metodoEjecucion', label: 'Método', field: 'metodoEjecucion', align: 'left' },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  ],
  VentasInmediatas: [
    { name: 'fechaHora', label: 'Fecha', field: (r) => new Date(r.fechaHora).toLocaleString(), align: 'left' },
    { name: 'parMonedas', label: 'Par', field: 'parMonedas', align: 'left' },
    { name: 'cantidadVendida', label: 'Cantidad vendida', field: 'cantidadVendida', align: 'right' },
    { name: 'totalRecibido', label: 'Total recibido', field: 'totalRecibido', align: 'right' },
    { name: 'metodoEjecucion', label: 'Método', field: 'metodoEjecucion', align: 'left' },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  ],
  Depositos: [
    { name: 'fechaHora', label: 'Fecha', field: (r) => new Date(r.fechaHora).toLocaleString(), align: 'left' },
    { name: 'moneda', label: 'Moneda', field: 'moneda', align: 'left' },
    { name: 'montoDepositado', label: 'Monto', field: 'montoDepositado', align: 'right' },
    { name: 'metodoPago', label: 'Método de pago', field: 'metodoPago', align: 'left' },
    { name: 'totalPagado', label: 'Total pagado', field: 'totalPagado', align: 'right' },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  ],
  Retiros: [
    { name: 'fechaHora', label: 'Fecha', field: (r) => new Date(r.fechaHora).toLocaleString(), align: 'left' },
    { name: 'moneda', label: 'Moneda', field: 'moneda', align: 'left' },
    { name: 'montoRetirado', label: 'Monto', field: 'montoRetirado', align: 'right' },
    { name: 'metodoCobro', label: 'Método de cobro', field: 'metodoCobro', align: 'left' },
    { name: 'montoFinalRecibido', label: 'Monto final', field: 'montoFinalRecibido', align: 'right' },
    { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  ],
}

const columnasActuales = computed(() => columnasPorTab[tab.value])

// La API serializa las claves en camelCase (p. ej. "Depositos" -> "depositos").
function claveRespuesta() {
  return tab.value.charAt(0).toLowerCase() + tab.value.slice(1)
}

const filasFiltradas = computed(() => {
  if (filtroEstado.value === 'Todos') return filas.value
  return filas.value.filter((f) => f.estado === filtroEstado.value)
})

function buildFiltro() {
  return {
    columna: tab.value,
    fechaDesde: filtro.value.fechaDesde || undefined,
    fechaHasta: filtro.value.fechaHasta || undefined,
    registrosPorPagina: 0,
  }
}

async function cargar() {
  cargando.value = true
  try {
    const { data } = await getHistorial(buildFiltro())
    const paginado = data[claveRespuesta()]
    filas.value = (paginado?.lista || []).map((row, idx) => ({ id: idx, ...row }))
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)

async function exportarCsv() {
  const { data } = await getParaExportar(buildFiltro())
  const lista = data[claveRespuesta()]?.lista || []
  if (lista.length === 0) return

  const columnas = columnasActuales.value
  const encabezado = columnas.map((c) => c.label).join(',')
  const filasCsv = lista.map((row) =>
    columnas.map((c) => `"${String(typeof c.field === 'function' ? c.field(row) : row[c.field]).replace(/"/g, '""')}"`).join(','),
  )
  const csv = [encabezado, ...filasCsv].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `historial_${tab.value}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

async function exportarPdf() {
  const { data } = await getParaExportar(buildFiltro())
  const lista = data[claveRespuesta()]?.lista || []
  const columnas = columnasActuales.value

  const filasHtml = lista
    .map(
      (row) =>
        `<tr>${columnas.map((c) => `<td>${typeof c.field === 'function' ? c.field(row) : row[c.field]}</td>`).join('')}</tr>`,
    )
    .join('')

  const html = `
    <html><head><title>Historial - ${tab.value}</title></head>
    <body>
      <h3>Historial de transacciones: ${tab.value}</h3>
      <table border="1" cellspacing="0" cellpadding="4">
        <thead><tr>${columnas.map((c) => `<th>${c.label}</th>`).join('')}</tr></thead>
        <tbody>${filasHtml}</tbody>
      </table>
    </body></html>`

  const ventana = window.open('', '_blank')
  ventana.document.write(html)
  ventana.document.close()
  ventana.focus()
  ventana.print()
}
</script>
