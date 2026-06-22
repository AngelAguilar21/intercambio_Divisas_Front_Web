<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Reporte de transacciones</div>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="row q-col-gutter-md items-end">
        <div class="col-6 col-md-2">
          <q-input v-model="filtro.fechaDesde" type="date" label="Desde" outlined dense />
        </div>
        <div class="col-6 col-md-2">
          <q-input v-model="filtro.fechaHasta" type="date" label="Hasta" outlined dense />
        </div>
        <div class="col-6 col-md-2">
          <q-input v-model="filtro.moneda" label="Moneda" outlined dense />
        </div>
        <div class="col-6 col-md-2">
          <q-input v-model="filtro.estado" label="Estado" outlined dense />
        </div>
        <div class="col-6 col-md-2">
          <q-input v-model.number="filtro.usuarioId" type="number" label="ID usuario" outlined dense />
        </div>
        <div class="col-6 col-md-2">
          <q-btn color="primary" label="Buscar" class="full-width" :loading="cargando" @click="cargar" />
        </div>
      </div>
    </q-card>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-6">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle2 q-mb-sm">Subtotales por moneda/par</div>
          <q-markup-table dense flat>
            <thead>
              <tr><th class="text-left">Moneda</th><th class="text-right">Cantidad</th><th class="text-right">Monto</th></tr>
            </thead>
            <tbody>
              <tr v-for="s in reporte?.subtotalesPorMoneda" :key="s.clave">
                <td class="text-left">{{ s.clave }}</td>
                <td class="text-right">{{ s.cantidad }}</td>
                <td class="text-right">{{ s.monto.toFixed(2) }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card>
      </div>
      <div class="col-12 col-md-6">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle2 q-mb-sm">Subtotales por estado</div>
          <q-markup-table dense flat>
            <thead>
              <tr><th class="text-left">Estado</th><th class="text-right">Cantidad</th><th class="text-right">Monto</th></tr>
            </thead>
            <tbody>
              <tr v-for="s in reporte?.subtotalesPorEstado" :key="s.clave">
                <td class="text-left">{{ s.clave }}</td>
                <td class="text-right">{{ s.cantidad }}</td>
                <td class="text-right">{{ s.monto.toFixed(2) }}</td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card>
      </div>
    </div>

    <q-card flat bordered class="q-pa-md">
      <div class="row q-mb-sm">
        <q-space />
        <q-btn flat dense icon="download" label="Exportar CSV" class="q-mr-sm" @click="exportarCsv" />
        <q-btn flat dense icon="print" label="Exportar PDF" @click="exportarPdf" />
      </div>
      <q-table :rows="reporte?.items || []" :columns="columnas" row-key="referenciaId" :loading="cargando" flat />
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { getReporteTransacciones } from '@/services/admin'

const filtro = reactive({ fechaDesde: '', fechaHasta: '', moneda: '', estado: '', usuarioId: null })
const reporte = ref(null)
const cargando = ref(false)

const columnas = [
  { name: 'tipoOperacion', label: 'Tipo', field: 'tipoOperacion', align: 'left' },
  { name: 'fecha', label: 'Fecha', field: (r) => new Date(r.fecha).toLocaleString(), align: 'left' },
  { name: 'usuarioNombre', label: 'Usuario', field: 'usuarioNombre', align: 'left' },
  { name: 'moneda', label: 'Moneda/Par', field: 'moneda', align: 'left' },
  { name: 'monto', label: 'Monto', field: 'monto', align: 'right' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
]

async function cargar() {
  cargando.value = true
  try {
    const params = { ...filtro }
    Object.keys(params).forEach((k) => {
      if (!params[k]) delete params[k]
    })
    const { data } = await getReporteTransacciones(params)
    reporte.value = data
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)

function exportarCsv() {
  const items = reporte.value?.items || []
  if (!items.length) return

  const encabezado = columnas.map((c) => c.label).join(',')
  const filas = items.map((row) =>
    columnas.map((c) => `"${String(typeof c.field === 'function' ? c.field(row) : row[c.field]).replace(/"/g, '""')}"`).join(','),
  )
  const csv = [encabezado, ...filas].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'reporte_transacciones.csv'
  a.click()
  URL.revokeObjectURL(url)
}

function exportarPdf() {
  const items = reporte.value?.items || []
  const filasHtml = items
    .map(
      (row) =>
        `<tr>${columnas.map((c) => `<td>${typeof c.field === 'function' ? c.field(row) : row[c.field]}</td>`).join('')}</tr>`,
    )
    .join('')

  const html = `
    <html><head><title>Reporte de transacciones</title></head>
    <body>
      <h3>Reporte de transacciones</h3>
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
