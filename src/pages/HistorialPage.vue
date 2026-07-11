<template>
  <q-page class="q-pa-md">
    <div class="xc-page-head row items-start justify-between q-gutter-md">
      <div class="col">
        <span class="xc-section-kicker"><q-icon name="history" size="14px" /> Historial</span>
        <h1 class="xc-section-title">Historial de operaciones</h1>
        <div class="xc-section-bar" aria-hidden="true" />
        <p class="xc-page-head-desc">
          Seis secciones: órdenes, ofertas, compras inmediatas, ventas inmediatas, depósitos y
          retiros.
        </p>
      </div>

      <div class="row q-gutter-sm">
        <q-btn
          outline
          color="primary"
          icon="table_view"
          label="Exportar Excel"
          :loading="exportandoExcel"
          @click="exportarExcel"
        />
        <q-btn
          outline
          color="primary"
          icon="picture_as_pdf"
          label="Exportar PDF"
          :loading="exportandoPdf"
          @click="exportarPdf"
        />
      </div>
    </div>

    <q-banner v-if="errorGeneral" dense rounded class="xchang-banner xchang-banner--error q-mb-md">
      {{ errorGeneral }}
    </q-banner>

    <div class="historial-wrapper">
      <div v-for="col in columnas" :key="col.key" class="historial-columna">
        <q-card flat bordered class="xc-card-accent historial-card">
          <div class="q-px-sm q-pt-sm q-pb-xs text-subtitle2 text-weight-bold historial-col-header">
            {{ col.titulo }}
          </div>

          <div class="q-px-sm q-pt-xs q-pb-xs">
            <div class="row q-col-gutter-xs">
              <div class="col-6">
                <q-input
                  v-model="estado[col.key].fechaDesde"
                  type="date"
                  label="Fecha desde"
                  outlined
                  dense
                  @update:model-value="reiniciarYCargar(col.key)"
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model="estado[col.key].fechaHasta"
                  type="date"
                  label="Fecha hasta"
                  outlined
                  dense
                  @update:model-value="reiniciarYCargar(col.key)"
                />
              </div>
            </div>
            <div v-if="fechaInvalida(col.key)" class="text-caption text-negative q-mt-xs">
              La fecha final debe ser posterior a la fecha inicial
            </div>
          </div>

          <div class="tabla-scroll">
            <div v-if="estado[col.key].cargando" class="q-pa-md text-center">
              <q-spinner size="24px" color="primary" />
            </div>

            <div
              v-else-if="estado[col.key].filas.length === 0"
              class="q-pa-md text-center xc-text-secondary text-caption"
            >
              No se encontraron operaciones
            </div>

            <table v-else class="historial-table">
              <thead>
                <tr>
                  <th v-if="col.expandible" class="historial-expand-col"></th>
                  <th v-if="col.tieneEstados" class="historial-expand-col"></th>
                  <th v-for="campo in col.campos" :key="campo.key">{{ campo.label }}</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="fila in estado[col.key].filas" :key="filaKey(fila)">
                  <tr>
                    <td v-if="col.expandible" class="historial-expand-col">
                      <q-btn
                        v-if="fila.tieneSaltos && fila.saltosRuta?.length"
                        dense
                        flat
                        round
                        size="sm"
                        :icon="estaExpandido(fila) ? 'expand_less' : 'expand_more'"
                        @click="toggleExpandido(fila)"
                      />
                    </td>
                    <td v-if="col.tieneEstados" class="historial-expand-col">
                      <q-btn
                        dense
                        flat
                        round
                        size="sm"
                        icon="timeline"
                        color="primary"
                        @click="verEstados(col.key, fila[col.idKey])"
                      >
                        <q-tooltip>Ver historial de estados</q-tooltip>
                      </q-btn>
                    </td>
                    <td v-for="campo in col.campos" :key="campo.key">{{ valor(campo, fila) }}</td>
                  </tr>

                  <tr v-if="col.expandible && estaExpandido(fila)" class="historial-saltos-row">
                    <td :colspan="col.campos.length + 1">
                      <div class="text-caption text-weight-bold q-mb-xs">Ruta ejecutada</div>
                      <ol class="q-ma-none q-pl-md">
                        <li v-for="salto in fila.saltosRuta" :key="filaKey(salto)">
                          {{ salto.parMonedas }} — {{ resumenSalto(col.key, salto) }}
                        </li>
                      </ol>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <div class="paginacion-row">
            <q-btn-group flat dense>
              <q-btn flat dense size="sm" label="«" @click="ir(col.key, 1)">
                <q-tooltip>Primera página</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                size="sm"
                label="‹"
                @click="ir(col.key, estado[col.key].pagina - 1)"
              >
                <q-tooltip>Página anterior</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                size="sm"
                label="›"
                @click="ir(col.key, estado[col.key].pagina + 1)"
              >
                <q-tooltip>Página siguiente</q-tooltip>
              </q-btn>
              <q-btn
                flat
                dense
                size="sm"
                label="»"
                @click="ir(col.key, estado[col.key].totalPaginas)"
              >
                <q-tooltip>Última página</q-tooltip>
              </q-btn>
            </q-btn-group>

            <span class="text-caption xc-text-secondary q-mx-xs">
              {{ estado[col.key].pagina }} / {{ estado[col.key].totalPaginas || 1 }}
            </span>

            <q-space />

            <q-select
              v-model="estado[col.key].registrosPorPagina"
              :options="opcionesPagina"
              emit-value
              map-options
              dense
              outlined
              style="min-width: 96px"
              @update:model-value="reiniciarYCargar(col.key)"
            />
          </div>
        </q-card>
      </div>
    </div>

    <EstadosTimelineDialog
      v-model="timelineAbierto"
      :tipo="timelineTipo"
      :referencia-id="timelineId"
    />
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { exportarHistorialExcel, exportarHistorialPdf, getHistorial } from '@/services/historial'
import { normalizarMensajeError } from '@/utils/validaciones'
import EstadosTimelineDialog from '@/components/historial/EstadosTimelineDialog.vue'

const timelineAbierto = ref(false)
const timelineTipo = ref('')
const timelineId = ref(0)

function verEstados(tipo, id) {
  timelineTipo.value = tipo
  timelineId.value = id
  timelineAbierto.value = true
}

const opcionesPagina = [
  { label: '5', value: 5 },
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '40', value: 40 },
  { label: '100', value: 100 },
  { label: '200', value: 200 },
  { label: 'Todos', value: 0 },
]

const columnas = [
  {
    key: 'OrdenesCompra',
    respuesta: 'ordenesCompra',
    titulo: 'Órdenes de compra',
    tieneEstados: true,
    idKey: 'ordenCompraId',
    campos: [
      { key: 'fechaHora', label: 'Fecha', fn: (r) => fmt(r.fechaHora) },
      { key: 'parMonedas', label: 'Par' },
      { key: 'cantidadOriginal', label: 'Original', fn: (r) => num(r.cantidadOriginal) },
      { key: 'cantidadObtenida', label: 'Obtenida', fn: (r) => num(r.cantidadObtenida) },
      { key: 'cantidadPendiente', label: 'Pendiente', fn: (r) => num(r.cantidadPendiente) },
      { key: 'precioUnitario', label: 'Precio', fn: (r) => num(r.precioUnitario) },
      {
        key: 'totalComprometido',
        label: 'Total comprometido',
        fn: (r) => num(r.totalComprometido),
      },
      { key: 'totalEjecutado', label: 'Total ejecutado', fn: (r) => num(r.totalEjecutado) },
      { key: 'estado', label: 'Estado' },
    ],
  },
  {
    key: 'OfertasVenta',
    respuesta: 'ofertasVenta',
    titulo: 'Ofertas de venta',
    tieneEstados: true,
    idKey: 'ofertaVentaId',
    campos: [
      { key: 'fechaHora', label: 'Fecha', fn: (r) => fmt(r.fechaHora) },
      { key: 'parMonedas', label: 'Par' },
      { key: 'cantidadOriginal', label: 'Original', fn: (r) => num(r.cantidadOriginal) },
      { key: 'cantidadVendida', label: 'Vendida', fn: (r) => num(r.cantidadVendida) },
      { key: 'cantidadPendiente', label: 'Pendiente', fn: (r) => num(r.cantidadPendiente) },
      { key: 'precioUnitario', label: 'Precio', fn: (r) => num(r.precioUnitario) },
      { key: 'totalEsperado', label: 'Total esperado', fn: (r) => num(r.totalEsperado) },
      { key: 'totalRecibido', label: 'Total recibido', fn: (r) => num(r.totalRecibido) },
      { key: 'estado', label: 'Estado' },
    ],
  },
  {
    key: 'ComprasInmediatas',
    respuesta: 'comprasInmediatas',
    titulo: 'Compras inmediatas',
    expandible: true,
    campos: [
      { key: 'fechaHora', label: 'Fecha', fn: (r) => fmt(r.fechaHora) },
      { key: 'parMonedas', label: 'Par' },
      { key: 'cantidadObtenida', label: 'Cantidad obtenida', fn: (r) => num(r.cantidadObtenida) },
      { key: 'precioMinCompra', label: 'Precio mín.', fn: (r) => num(r.precioMinCompra) },
      { key: 'precioMaxCompra', label: 'Precio máx.', fn: (r) => num(r.precioMaxCompra) },
      {
        key: 'precioPromedioCompra',
        label: 'Precio prom.',
        fn: (r) => num(r.precioPromedioCompra),
      },
      { key: 'totalPagado', label: 'Total pagado', fn: (r) => num(r.totalPagado) },
      { key: 'estado', label: 'Estado' },
      { key: 'metodoEjecucion', label: 'Método' },
    ],
  },
  {
    key: 'VentasInmediatas',
    respuesta: 'ventasInmediatas',
    titulo: 'Ventas inmediatas',
    expandible: true,
    campos: [
      { key: 'fechaHora', label: 'Fecha', fn: (r) => fmt(r.fechaHora) },
      { key: 'parMonedas', label: 'Par' },
      { key: 'cantidadVendida', label: 'Cantidad vendida', fn: (r) => num(r.cantidadVendida) },
      { key: 'precioMinVenta', label: 'Precio mín.', fn: (r) => num(r.precioMinVenta) },
      { key: 'precioMaxVenta', label: 'Precio máx.', fn: (r) => num(r.precioMaxVenta) },
      { key: 'precioPromedioVenta', label: 'Precio prom.', fn: (r) => num(r.precioPromedioVenta) },
      { key: 'totalRecibido', label: 'Total recibido', fn: (r) => num(r.totalRecibido) },
      { key: 'estado', label: 'Estado' },
      { key: 'metodoEjecucion', label: 'Método' },
    ],
  },
  {
    key: 'Depositos',
    respuesta: 'depositos',
    titulo: 'Depósitos',
    campos: [
      { key: 'fechaHora', label: 'Fecha', fn: (r) => fmt(r.fechaHora) },
      { key: 'moneda', label: 'Moneda' },
      { key: 'montoDepositado', label: 'Monto depositado', fn: (r) => num(r.montoDepositado) },
      { key: 'metodoPago', label: 'Método de pago' },
      { key: 'comisionAplicada', label: 'Comisión', fn: (r) => num(r.comisionAplicada) },
      { key: 'totalPagado', label: 'Total pagado', fn: (r) => num(r.totalPagado) },
      { key: 'estado', label: 'Estado' },
    ],
  },
  {
    key: 'Retiros',
    respuesta: 'retiros',
    titulo: 'Retiros',
    campos: [
      { key: 'fechaHora', label: 'Fecha', fn: (r) => fmt(r.fechaHora) },
      { key: 'moneda', label: 'Moneda' },
      { key: 'montoRetirado', label: 'Monto retirado', fn: (r) => num(r.montoRetirado) },
      { key: 'metodoCobro', label: 'Método de cobro' },
      { key: 'comisionAplicada', label: 'Comisión', fn: (r) => num(r.comisionAplicada) },
      {
        key: 'montoFinalRecibido',
        label: 'Monto final recibido',
        fn: (r) => num(r.montoFinalRecibido),
      },
      { key: 'estado', label: 'Estado' },
    ],
  },
]

const estado = reactive(
  Object.fromEntries(
    columnas.map((c) => [
      c.key,
      {
        filas: [],
        cargando: false,
        pagina: 1,
        totalPaginas: 1,
        registrosPorPagina: 5,
        fechaDesde: '',
        fechaHasta: '',
      },
    ]),
  ),
)

const exportandoExcel = ref(false)
const exportandoPdf = ref(false)
const errorGeneral = ref('')
const expandidos = ref(new Set())

onMounted(() => columnas.forEach((c) => cargar(c.key)))

function fechaInvalida(key) {
  const e = estado[key]
  return e.fechaDesde && e.fechaHasta && new Date(e.fechaDesde) > new Date(e.fechaHasta)
}

async function cargar(key) {
  if (fechaInvalida(key)) return

  const col = columnas.find((c) => c.key === key)
  const e = estado[key]

  e.cargando = true
  errorGeneral.value = ''

  try {
    const { data } = await getHistorial({
      columna: key,
      numeroPagina: e.pagina,
      registrosPorPagina: e.registrosPorPagina,
      fechaDesde: e.fechaDesde || undefined,
      fechaHasta: e.fechaHasta || undefined,
    })

    const paginado = data?.[col.respuesta] || {}
    e.filas = paginado.lista || []
    e.totalPaginas = paginado.totalPaginas || 1
    e.pagina = paginado.numeroPagina || e.pagina
  } catch (error) {
    errorGeneral.value = normalizarMensajeError(error, 'No se pudo cargar el historial.')
    e.filas = []
    e.totalPaginas = 1
  } finally {
    e.cargando = false
  }
}

function reiniciarYCargar(key) {
  estado[key].pagina = 1
  cargar(key)
}

function ir(key, pagina) {
  const e = estado[key]
  e.pagina = Math.min(Math.max(1, pagina), e.totalPaginas || 1)
  cargar(key)
}

function valor(campo, fila) {
  const v = campo.fn ? campo.fn(fila) : fila[campo.key]
  return v === null || v === undefined || v === '' ? '-' : v
}

function filaKey(fila) {
  const base =
    fila.ordenCompraId ||
    fila.ofertaVentaId ||
    fila.operacionInmediataId ||
    fila.depositoId ||
    fila.retiroId ||
    JSON.stringify(fila)

  return `${base}-${fila.estado || ''}-${fila.fechaHora || ''}`
}

function estaExpandido(fila) {
  return expandidos.value.has(filaKey(fila))
}

function toggleExpandido(fila) {
  const key = filaKey(fila)
  const nuevo = new Set(expandidos.value)

  if (nuevo.has(key)) nuevo.delete(key)
  else nuevo.add(key)

  expandidos.value = nuevo
}

function resumenSalto(columna, salto) {
  if (columna === 'ComprasInmediatas') {
    return `${num(salto.cantidadObtenida)} obtenidos, total ${num(salto.totalPagado)}`
  }

  return `${num(salto.cantidadVendida)} vendidos, total ${num(salto.totalRecibido)}`
}

function fmt(fecha) {
  return fecha ? new Date(fecha).toLocaleString() : '-'
}

function num(valor) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return '-'
  return Number(valor).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })
}

async function exportarExcel() {
  exportandoExcel.value = true
  errorGeneral.value = ''

  try {
    const response = await exportarHistorialExcel({})
    descargarArchivo(response, 'historial.xls')
  } catch (error) {
    errorGeneral.value = normalizarMensajeError(error, 'No se pudo exportar el historial a Excel.')
  } finally {
    exportandoExcel.value = false
  }
}

async function exportarPdf() {
  exportandoPdf.value = true
  errorGeneral.value = ''

  try {
    const response = await exportarHistorialPdf({})
    descargarArchivo(response, 'historial.pdf')
  } catch (error) {
    errorGeneral.value = normalizarMensajeError(error, 'No se pudo exportar el historial a PDF.')
  } finally {
    exportandoPdf.value = false
  }
}

function descargarArchivo(response, nombreFallback) {
  const blob = new Blob([response.data], {
    type: response.headers['content-type'] || 'application/octet-stream',
  })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  const contentDisposition = response.headers['content-disposition'] || ''
  const match = contentDisposition.match(/filename\*?=(?:UTF-8''|")?([^";]+)/i)

  link.href = url
  link.download = match ? decodeURIComponent(match[1].replace(/"/g, '')) : nombreFallback
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
</script>

<style scoped>
.historial-wrapper {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.historial-columna {
  min-width: 390px;
  max-width: 460px;
  flex: 0 0 420px;
}

.historial-card {
  height: 620px;
  display: flex;
  flex-direction: column;
}

.historial-col-header {
  color: var(--xchang-page-text);
}

.tabla-scroll {
  flex: 1;
  overflow: auto;
  border-top: 1px solid var(--xchang-border);
  border-bottom: 1px solid var(--xchang-border);
}

.historial-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.78rem;
}

.historial-table th,
.historial-table td {
  padding: 8px 10px;
  border-bottom: 1px solid var(--xchang-border);
  text-align: left;
  white-space: nowrap;
}

.historial-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--xchang-surface);
  color: var(--xchang-text-secondary);
  font-weight: 700;
}

.historial-expand-col {
  width: 36px;
  min-width: 36px;
  text-align: center !important;
}

.historial-saltos-row td {
  background: color-mix(in srgb, var(--xchang-surface) 88%, var(--q-primary) 12%);
  white-space: normal;
}

.paginacion-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
}
</style>
