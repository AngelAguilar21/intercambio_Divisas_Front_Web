<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Historial de transacciones</div>
      <div class="q-gutter-sm">
        <q-btn flat dense color="primary" icon="table_view" label="Exportar Excel" :loading="exportando" @click="exportarExcel" />
        <q-btn flat dense color="primary" icon="picture_as_pdf" label="Exportar PDF" :loading="exportando" @click="exportarPdf" />
      </div>
    </div>

    <div class="historial-wrapper">
      <div
        v-for="colCfg in COLUMNAS_CONFIG"
        :key="colCfg.key"
        class="historial-columna"
      >
        <q-card flat bordered style="display: flex; flex-direction: column; height: 100%">
          <div class="q-px-sm q-pt-sm q-pb-xs text-subtitle2 text-weight-bold bg-grey-2">
            {{ colCfg.titulo }}
          </div>

          <div class="q-px-sm q-pt-xs q-pb-xs">
            <div class="row q-col-gutter-xs">
              <div class="col-6">
                <q-input
                  v-model="cols[colCfg.key].fechaDesde"
                  type="date"
                  label="Fecha desde"
                  outlined
                  dense
                  @update:model-value="onFechaChange(colCfg.key)"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="cols[colCfg.key].fechaHasta"
                  type="date"
                  label="Fecha hasta"
                  outlined
                  dense
                  @update:model-value="onFechaChange(colCfg.key)"
                />
              </div>
            </div>
            <div v-if="cols[colCfg.key].fechaError" class="text-caption text-negative q-mt-xs">
              {{ cols[colCfg.key].fechaError }}
            </div>
          </div>

          <div class="tabla-scroll">
            <div v-if="cols[colCfg.key].cargando" class="q-pa-md text-center">
              <q-spinner size="24px" color="primary" />
            </div>
            <div v-else-if="cols[colCfg.key].filas.length === 0" class="q-pa-md text-center text-grey-6 text-caption">
              No se encontraron operaciones
            </div>
            <table v-else class="historial-table">
              <thead>
                <tr>
                  <th v-if="colCfg.expandible" style="width: 24px"></th>
                  <th v-for="campo in colCfg.campos" :key="campo.key">{{ campo.label }}</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(fila, idx) in cols[colCfg.key].filas" :key="idx">
                  <tr>
                    <td v-if="colCfg.expandible" class="text-center">
                      <q-btn
                        v-if="esExpandible(fila)"
                        flat
                        dense
                        size="xs"
                        :icon="cols[colCfg.key].expandidos[idx] ? 'expand_more' : 'chevron_right'"
                        @click="toggleExpandir(colCfg.key, idx)"
                      />
                    </td>
                    <td v-for="campo in colCfg.campos" :key="campo.key">
                      {{ valorCampo(campo, fila) }}
                    </td>
                  </tr>

                  <template v-if="colCfg.expandible && cols[colCfg.key].expandidos[idx]">
                    <tr class="ruta-header-row">
                      <td></td>
                      <td :colspan="colCfg.campos.length" class="q-pl-lg">
                        <div
                          v-for="(salto, si) in fila.saltos"
                          :key="`ruta-${si}`"
                          class="text-caption"
                        >
                          <span :class="si === 0 ? 'text-weight-bold text-primary' : ''">
                            {{ saltoPar(salto).from }}
                          </span>
                          <span> → </span>
                          <span :class="si === fila.saltos.length - 1 ? 'text-weight-bold text-primary' : ''">
                            {{ saltoPar(salto).to }}
                          </span>
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-for="(salto, si) in fila.saltos"
                      :key="`salto-${si}`"
                      class="ruta-sub-row"
                    >
                      <td></td>
                      <td v-for="campo in colCfg.campos" :key="campo.key" class="q-pl-lg">
                        {{ valorCampo(campo, salto) }}
                      </td>
                    </tr>
                  </template>
                </template>
              </tbody>
            </table>
          </div>

          <div class="paginacion-row">
            <q-btn-group flat dense>
              <q-btn flat dense size="sm" label="«" @click="irPrimera(colCfg.key)">
                <q-tooltip>Primera página</q-tooltip>
              </q-btn>
              <q-btn flat dense size="sm" label="‹" @click="irAnterior(colCfg.key)">
                <q-tooltip>Página anterior</q-tooltip>
              </q-btn>
              <q-btn flat dense size="sm" label="›" @click="irSiguiente(colCfg.key)">
                <q-tooltip>Página siguiente</q-tooltip>
              </q-btn>
              <q-btn flat dense size="sm" label="»" @click="irUltima(colCfg.key)">
                <q-tooltip>Última página</q-tooltip>
              </q-btn>
            </q-btn-group>
            <span class="text-caption text-grey-7 q-mx-xs">
              {{ cols[colCfg.key].pagina }} / {{ cols[colCfg.key].totalPaginas || 1 }}
            </span>
            <q-space />
            <q-select
              v-model="cols[colCfg.key].registrosPorPagina"
              :options="OPCIONES_PAGINA"
              emit-value
              map-options
              dense
              outlined
              style="min-width: 88px"
              @update:model-value="onRegistrosPorPaginaChange(colCfg.key)"
            />
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { getHistorial, getParaExportar } from '@/services/historial'

const OPCIONES_PAGINA = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '40', value: 40 },
  { label: '100', value: 100 },
  { label: '200', value: 200 },
  { label: 'Todos', value: 0 },
]

const COLUMNAS_CONFIG = [
  {
    key: 'OrdenesCompra',
    titulo: 'Órdenes de compra',
    expandible: false,
    campos: [
      { key: 'fechaHora', label: 'Fecha y hora', fn: (r) => fmtFecha(r.fechaHora) },
      { key: 'parMonedas', label: 'Par de monedas' },
      { key: 'cantidadOriginal', label: 'Cant. original' },
      { key: 'cantidadObtenida', label: 'Cant. obtenida' },
      { key: 'cantidadPendiente', label: 'Cant. pendiente' },
      { key: 'precioUnitario', label: 'Precio unitario' },
      { key: 'totalComprometido', label: 'Total comprometido' },
      { key: 'totalEjecutado', label: 'Total ejecutado' },
      { key: 'estado', label: 'Estado' },
    ],
  },
  {
    key: 'OfertasVenta',
    titulo: 'Ofertas de venta',
    expandible: false,
    campos: [
      { key: 'fechaHora', label: 'Fecha y hora', fn: (r) => fmtFecha(r.fechaHora) },
      { key: 'parMonedas', label: 'Par de monedas' },
      { key: 'cantidadOriginal', label: 'Cant. original' },
      { key: 'cantidadVendida', label: 'Cant. vendida' },
      { key: 'cantidadPendiente', label: 'Cant. pendiente' },
      { key: 'precioUnitario', label: 'Precio unitario' },
      { key: 'totalEsperado', label: 'Total esperado' },
      { key: 'totalRecibido', label: 'Total recibido' },
      { key: 'estado', label: 'Estado' },
    ],
  },
  {
    key: 'ComprasInmediatas',
    titulo: 'Compras inmediatas',
    expandible: true,
    campos: [
      { key: 'fechaHora', label: 'Fecha y hora', fn: (r) => fmtFecha(r.fechaHora) },
      { key: 'parMonedas', label: 'Par de monedas' },
      { key: 'cantidadObtenida', label: 'Cant. obtenida' },
      { key: 'precioMinCompra', label: 'Precio mín.' },
      { key: 'precioMaxCompra', label: 'Precio máx.' },
      { key: 'precioPromCompra', label: 'Precio prom.' },
      { key: 'totalPagado', label: 'Total pagado' },
      { key: 'estado', label: 'Estado' },
      { key: 'metodoEjecucion', label: 'Método' },
    ],
  },
  {
    key: 'VentasInmediatas',
    titulo: 'Ventas inmediatas',
    expandible: true,
    campos: [
      { key: 'fechaHora', label: 'Fecha y hora', fn: (r) => fmtFecha(r.fechaHora) },
      { key: 'parMonedas', label: 'Par de monedas' },
      { key: 'cantidadVendida', label: 'Cant. vendida' },
      { key: 'precioMinVenta', label: 'Precio mín.' },
      { key: 'precioMaxVenta', label: 'Precio máx.' },
      { key: 'precioPromVenta', label: 'Precio prom.' },
      { key: 'totalRecibido', label: 'Total recibido' },
      { key: 'estado', label: 'Estado' },
      { key: 'metodoEjecucion', label: 'Método' },
    ],
  },
  {
    key: 'Depositos',
    titulo: 'Depósitos',
    expandible: false,
    campos: [
      { key: 'fechaHora', label: 'Fecha y hora', fn: (r) => fmtFecha(r.fechaHora) },
      { key: 'moneda', label: 'Moneda' },
      { key: 'montoDepositado', label: 'Monto depositado' },
      { key: 'metodoPago', label: 'Método de pago' },
      { key: 'comisionAplicada', label: 'Comisión' },
      { key: 'totalPagado', label: 'Total pagado' },
      { key: 'estado', label: 'Estado' },
    ],
  },
  {
    key: 'Retiros',
    titulo: 'Retiros',
    expandible: false,
    campos: [
      { key: 'fechaHora', label: 'Fecha y hora', fn: (r) => fmtFecha(r.fechaHora) },
      { key: 'moneda', label: 'Moneda' },
      { key: 'montoRetirado', label: 'Monto retirado' },
      { key: 'metodoCobro', label: 'Método de cobro' },
      { key: 'comisionAplicada', label: 'Comisión' },
      { key: 'montoFinalRecibido', label: 'Monto final recibido' },
      { key: 'estado', label: 'Estado' },
    ],
  },
]

function crearEstadoColumna() {
  return {
    filas: [],
    cargando: false,
    fechaDesde: '',
    fechaHasta: '',
    fechaError: '',
    pagina: 1,
    registrosPorPagina: 10,
    totalPaginas: 1,
    totalRegistros: 0,
    expandidos: {},
  }
}

const cols = reactive(Object.fromEntries(COLUMNAS_CONFIG.map((c) => [c.key, crearEstadoColumna()])))
const exportando = ref(false)

function apiKey(columna) {
  return columna.charAt(0).toLowerCase() + columna.slice(1)
}

function fmtFecha(valor) {
  if (!valor) return ''
  return new Date(valor).toLocaleString('es-PE')
}

function valorCampo(campo, fila) {
  if (campo.fn) return campo.fn(fila)
  const v = fila[campo.key]
  return v !== undefined && v !== null ? v : ''
}

function esExpandible(fila) {
  return fila.metodoEjecucion === 'Mejor ruta' && Array.isArray(fila.saltos) && fila.saltos.length > 1
}

function saltoPar(salto) {
  if (salto.monedaOrigen && salto.monedaDestino) {
    return { from: salto.monedaOrigen, to: salto.monedaDestino }
  }
  const partes = (salto.parMonedas || '').split('/')
  return { from: partes[1] || '', to: partes[0] || '' }
}

function toggleExpandir(clave, idx) {
  const exp = cols[clave].expandidos
  if (exp[idx]) {
    delete exp[idx]
  } else {
    exp[idx] = true
  }
}

function onFechaChange(clave) {
  const estado = cols[clave]
  if (estado.fechaDesde && estado.fechaHasta && estado.fechaDesde > estado.fechaHasta) {
    estado.fechaError = 'La fecha final debe ser posterior a la fecha inicial'
  } else {
    estado.fechaError = ''
    estado.pagina = 1
    cargarColumna(clave)
  }
}

async function cargarColumna(clave) {
  const estado = cols[clave]
  if (estado.fechaError) return
  estado.cargando = true
  estado.expandidos = {}
  try {
    const { data } = await getHistorial({
      columna: clave,
      fechaDesde: estado.fechaDesde || undefined,
      fechaHasta: estado.fechaHasta || undefined,
      pagina: estado.pagina,
      registrosPorPagina: estado.registrosPorPagina,
    })
    const resultado = data[apiKey(clave)]
    if (resultado) {
      estado.filas = resultado.lista || []
      estado.totalPaginas = resultado.totalPaginas || 1
      estado.totalRegistros = resultado.totalRegistros || 0
    } else {
      estado.filas = []
    }
  } finally {
    estado.cargando = false
  }
}

function onRegistrosPorPaginaChange(clave) {
  cols[clave].pagina = 1
  cargarColumna(clave)
}

function irPrimera(clave) {
  cols[clave].pagina = 1
  cargarColumna(clave)
}

function irAnterior(clave) {
  if (cols[clave].pagina > 1) {
    cols[clave].pagina--
    cargarColumna(clave)
  }
}

function irSiguiente(clave) {
  const estado = cols[clave]
  if (estado.pagina < (estado.totalPaginas || 1)) {
    estado.pagina++
    cargarColumna(clave)
  }
}

function irUltima(clave) {
  cols[clave].pagina = cols[clave].totalPaginas || 1
  cargarColumna(clave)
}

async function obtenerDatosExportar() {
  const resultado = {}
  await Promise.all(
    COLUMNAS_CONFIG.map(async (colCfg) => {
      const estado = cols[colCfg.key]
      try {
        const { data } = await getParaExportar({
          columna: colCfg.key,
          fechaDesde: estado.fechaDesde || undefined,
          fechaHasta: estado.fechaHasta || undefined,
          registrosPorPagina: 0,
        })
        resultado[colCfg.key] = data[apiKey(colCfg.key)]?.lista || []
      } catch {
        resultado[colCfg.key] = []
      }
    }),
  )
  return resultado
}

function tablaHtml(colCfg, lista) {
  if (!lista || lista.length === 0) return `<h3>${colCfg.titulo}</h3><p>Sin registros</p>`
  const ths = colCfg.campos.map((c) => `<th>${c.label}</th>`).join('')
  const trs = lista
    .map((row) => `<tr>${colCfg.campos.map((c) => `<td>${valorCampo(c, row)}</td>`).join('')}</tr>`)
    .join('')
  return `<h3>${colCfg.titulo}</h3><table border="1" cellspacing="0" cellpadding="4"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`
}

async function exportarExcel() {
  exportando.value = true
  try {
    const datos = await obtenerDatosExportar()
    const cuerpo = COLUMNAS_CONFIG.map((c) => tablaHtml(c, datos[c.key])).join('<br/>')
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"></head><body>${cuerpo}</body></html>`
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'historial_transacciones.xls'
    a.click()
    URL.revokeObjectURL(url)
  } finally {
    exportando.value = false
  }
}

async function exportarPdf() {
  exportando.value = true
  try {
    const datos = await obtenerDatosExportar()
    const cuerpo = COLUMNAS_CONFIG.map((c) => tablaHtml(c, datos[c.key])).join('<br/>')
    const ventana = window.open('', '_blank')
    ventana.document.write(`
      <html><head><title>Historial de transacciones</title>
      <style>
        body { font-family: sans-serif; font-size: 11px; }
        table { border-collapse: collapse; margin-bottom: 20px; width: 100%; page-break-after: always; }
        th, td { border: 1px solid #ccc; padding: 3px 6px; text-align: left; }
        th { background: #f0f0f0; font-weight: 600; }
        h3 { margin: 20px 0 4px; font-size: 13px; }
        h2 { font-size: 15px; }
      </style></head><body>
      <h2>Historial de transacciones</h2>
      ${cuerpo}
      </body></html>
    `)
    ventana.document.close()
    ventana.focus()
    ventana.print()
  } finally {
    exportando.value = false
  }
}

let pollingTimer = null

onMounted(() => {
  COLUMNAS_CONFIG.forEach((col) => cargarColumna(col.key))
  pollingTimer = setInterval(() => {
    COLUMNAS_CONFIG.forEach((col) => cargarColumna(col.key))
  }, 60_000)
})

onUnmounted(() => {
  clearInterval(pollingTimer)
})
</script>

<style scoped>
.historial-wrapper {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  align-items: flex-start;
  padding-bottom: 8px;
}

.historial-columna {
  min-width: 660px;
  width: 660px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.tabla-scroll {
  overflow-y: auto;
  max-height: 460px;
  flex: 1;
}

.paginacion-row {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-top: 1px solid #e0e0e0;
  gap: 4px;
}

.historial-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.historial-table th,
.historial-table td {
  padding: 4px 8px;
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap;
  text-align: left;
}

.historial-table thead th {
  position: sticky;
  top: 0;
  background: #f5f5f5;
  z-index: 1;
  font-weight: 600;
  font-size: 11px;
}

.ruta-header-row td,
.ruta-sub-row td {
  background: #e3f2fd;
}
</style>
