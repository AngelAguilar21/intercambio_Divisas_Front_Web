<template>
  <q-page class="q-pa-md">
    <div class="xc-page-head">
      <span class="xc-section-kicker"><q-icon name="admin_panel_settings" size="14px" /> Administración</span>

      <div class="row items-start justify-between q-gutter-md">
        <div>
          <h1 class="xc-section-title">Visión general de operaciones</h1>
          <div class="xc-section-bar" aria-hidden="true" />
        </div>

        <div class="row q-gutter-sm">
          <q-btn outline color="primary" icon="manage_accounts" label="Gestión de usuarios" :to="{ name: 'admin-usuarios' }" />
          <q-btn outline color="primary" icon="fact_check" label="Log de auditoría" :to="{ name: 'admin-auditoria' }" />
          <q-btn color="primary" icon="refresh" label="Actualizar" :loading="cargando" @click="actualizar" />
        </div>
      </div>
    </div>

    <!-- Filtros de fecha -->
    <q-card flat bordered class="q-pa-md xc-card-accent q-mb-md">
      <div class="row q-col-gutter-md items-start">
        <div class="col-12 col-md-4">
          <q-input
            v-model="filtros.fechaDesde"
            type="date"
            label="Fecha desde"
            outlined
            dense
            :error="!!fechaError"
            :error-message="fechaError"
          />
        </div>
        <div class="col-12 col-md-4">
          <q-input
            v-model="filtros.fechaHasta"
            type="date"
            label="Fecha hasta"
            outlined
            dense
            :error="!!fechaError"
            :error-message="fechaError"
          />
        </div>
        <div class="col-12 col-md-4 flex items-start">
          <q-btn
            class="full-width"
            color="primary"
            icon="refresh"
            label="Actualizar"
            :disable="!!fechaError"
            :loading="cargando"
            @click="actualizar"
          />
        </div>
      </div>
    </q-card>

    <q-banner v-if="errorMessage" dense rounded class="xchang-banner xchang-banner--error q-mb-md">
      {{ errorMessage }}
    </q-banner>

    <!-- 8 KPIs -->
    <div class="row q-col-gutter-md q-mb-md">
      <div v-for="card in cards" :key="card.label" class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="q-pa-md xc-card-accent">
          <div class="text-caption xc-text-secondary">{{ card.label }}</div>
          <div class="text-h5 text-weight-bold">{{ card.value }}</div>
        </q-card>
      </div>
    </div>

    <!-- Gráficos fila 1: volumen/día + operaciones/día -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-lg-6">
        <q-card flat bordered class="q-pa-md xc-card-accent full-height">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">Volumen total operado por día</div>
          <div v-if="volumenPorDia.length" class="admin-bars">
            <div v-for="item in volumenPorDia" :key="`vol-${item.fecha}`" class="admin-bar-row">
              <div class="admin-bar-label">{{ fmtFechaCorta(item.fecha) }}</div>
              <div class="admin-bar-track">
                <div class="admin-bar-fill" :style="{ width: pct(item.volumen, maxVolumen) + '%' }" />
              </div>
              <div class="admin-bar-value">{{ fmtDecimal(item.volumen) }}</div>
            </div>
          </div>
          <q-banner v-else dense rounded class="xchang-banner xchang-banner--neutral">
            No hay volumen registrado para el período seleccionado
          </q-banner>
        </q-card>
      </div>

      <div class="col-12 col-lg-6">
        <q-card flat bordered class="q-pa-md xc-card-accent full-height">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">Cantidad de operaciones por día</div>
          <div v-if="operacionesPorDia.length" class="admin-bars">
            <div v-for="item in operacionesPorDia" :key="`op-${item.fecha}`" class="admin-bar-row">
              <div class="admin-bar-label">{{ fmtFechaCorta(item.fecha) }}</div>
              <div class="admin-bar-track">
                <div class="admin-bar-fill admin-bar-fill--secondary" :style="{ width: pct(item.cantidadOperaciones, maxOperaciones) + '%' }" />
              </div>
              <div class="admin-bar-value">{{ item.cantidadOperaciones }}</div>
            </div>
          </div>
          <q-banner v-else dense rounded class="xchang-banner xchang-banner--neutral">
            No hay operaciones registradas para el período seleccionado
          </q-banner>
        </q-card>
      </div>
    </div>

    <!-- Gráficos fila 2: volumen por moneda + distribución por tipo -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-lg-6">
        <q-card flat bordered class="q-pa-md xc-card-accent full-height">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">Volumen por moneda</div>
          <div v-if="volumenPorMoneda.length" class="admin-bars">
            <div v-for="item in volumenPorMoneda" :key="`mon-${item.monedaId}`" class="admin-bar-row">
              <div class="admin-bar-label">{{ item.codigoMoneda || item.codigoISO }}</div>
              <div class="admin-bar-track">
                <div class="admin-bar-fill admin-bar-fill--moneda" :style="{ width: pct(item.volumen, maxVolumenMoneda) + '%' }" />
              </div>
              <div class="admin-bar-value">{{ fmtDecimal(item.volumen) }}</div>
            </div>
          </div>
          <q-banner v-else dense rounded class="xchang-banner xchang-banner--neutral">
            No hay volumen por moneda en el período seleccionado
          </q-banner>
        </q-card>
      </div>

      <div class="col-12 col-lg-6">
        <q-card flat bordered class="q-pa-md xc-card-accent full-height">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">Distribución por tipo de operación</div>
          <div v-if="distribucionPorTipo.length" class="admin-bars">
            <div v-for="item in distribucionPorTipo" :key="item.tipoOperacion" class="admin-bar-row admin-bar-row--tipo">
              <div class="admin-bar-label admin-bar-label--tipo">{{ item.tipoOperacion }}</div>
              <div class="admin-bar-track">
                <div
                  class="admin-bar-fill"
                  :style="{ width: pct(item.cantidad, maxDistribucion) + '%', background: colorTipo(item.tipoOperacion) }"
                />
              </div>
              <div class="admin-bar-value">{{ item.cantidad }}</div>
            </div>
          </div>
          <q-banner v-else dense rounded class="xchang-banner xchang-banner--neutral">
            No hay operaciones en el período seleccionado
          </q-banner>
        </q-card>
      </div>
    </div>

    <!-- Tabla Monedas (7 columnas) -->
    <q-card flat bordered class="q-pa-md xc-card-accent q-mb-md">
      <div class="row items-center q-mb-sm">
        <div class="text-subtitle1 text-weight-medium col">Detalle por moneda</div>
        <div class="text-caption xc-text-secondary">{{ rangoTexto }}</div>
      </div>
      <q-table
        :rows="monedas"
        :columns="columnasMonedas"
        row-key="monedaId"
        :loading="cargando"
        flat
        no-data-label="No hay datos de monedas para el período seleccionado"
      />
    </q-card>

    <!-- Tabla Mejores rutas (expandable) -->
    <q-card flat bordered class="q-pa-md xc-card-accent q-mb-md">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">Mejores rutas de conversión</div>

      <q-banner v-if="!mejoresRutas.length && !cargando" dense rounded class="xchang-banner xchang-banner--neutral">
        No hay rutas de conversión registradas para el período seleccionado
      </q-banner>

      <div v-else class="admin-table-wrap">
        <table class="admin-table full-width">
          <thead>
            <tr>
              <th style="width:36px"></th>
              <th>Fecha</th>
              <th>Ruta</th>
              <th class="text-center">Saltos</th>
              <th class="text-right">Ahorro estimado</th>
              <th class="text-right">Ganancia estimada</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(ruta, idx) in mejoresRutas" :key="idx">
              <tr>
                <td>
                  <q-btn
                    v-if="ruta.saltos?.length"
                    dense
                    flat
                    round
                    size="sm"
                    :icon="expandidosRutas.has(idx) ? 'expand_less' : 'expand_more'"
                    @click="toggleRuta(idx)"
                  />
                </td>
                <td>{{ fmtFecha(ruta.fechaCreacion) }}</td>
                <td class="text-weight-medium">{{ ruta.monedaInicial }} &rarr; {{ ruta.monedaFinal }}</td>
                <td class="text-center">{{ ruta.cantidadSaltos }}</td>
                <td class="text-right xc-figure">
                  {{ ruta.ahorroEstimado != null ? fmtDecimal(ruta.ahorroEstimado) : '-' }}
                </td>
                <td class="text-right xc-figure">
                  {{ ruta.gananciaEstimada != null ? fmtDecimal(ruta.gananciaEstimada) : '-' }}
                </td>
              </tr>
              <tr v-if="expandidosRutas.has(idx)" class="admin-table-expand-row">
                <td colspan="6">
                  <div class="q-pa-sm q-pl-lg">
                    <div class="text-caption text-weight-bold q-mb-xs">Saltos de la ruta</div>
                    <ol class="q-ma-none q-pl-md">
                      <li
                        v-for="salto in ruta.saltos"
                        :key="salto.numeroSalto"
                        class="q-mb-xs text-body2"
                      >
                        <span class="text-weight-medium">{{ salto.par }}</span>
                        — {{ fmtDecimal(salto.cantidadConvertida) }} convertidos
                        <span v-if="salto.precioPromedio != null">
                          | Precio prom: {{ fmtDecimal(salto.precioPromedio) }}
                        </span>
                        | Resultado: {{ fmtDecimal(salto.resultadoObtenido) }}
                      </li>
                    </ol>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </q-card>

    <!-- Tabla Actividad reciente (paginada + export) -->
    <q-card flat bordered class="q-pa-md xc-card-accent">
      <div class="row items-center q-mb-sm q-col-gutter-sm">
        <div class="text-subtitle1 text-weight-medium col">Actividad reciente</div>

        <q-select
          v-model="actividadPorPagina"
          label="Por página"
          dense
          outlined
          style="width: 130px"
          :options="opcionesActividadPagina"
          emit-value
          map-options
          @update:model-value="reiniciarActividad"
        />

        <q-btn
          flat
          dense
          icon="download"
          label="Excel"
          :loading="exportandoExcel"
          @click="onExportarActividad('excel')"
        />
        <q-btn
          flat
          dense
          icon="picture_as_pdf"
          label="PDF"
          :loading="exportandoPdf"
          @click="onExportarActividad('pdf')"
        />
      </div>

      <q-table
        :rows="actividadRegistros"
        :columns="columnasActividad"
        :loading="cargandoActividad"
        flat
        hide-pagination
        :rows-per-page-options="[0]"
        no-data-label="No existen operaciones para el período seleccionado"
      />

      <div v-if="actividadTotalRegistros > 0" class="row items-center justify-end q-gutter-sm q-pa-sm">
        <div class="text-caption xc-text-secondary">Página {{ actividadPagina }} de {{ actividadTotalPaginas }}</div>
        <q-btn flat dense round icon="first_page" :disable="actividadPagina === 1" @click="irActividad(1)" />
        <q-btn flat dense round icon="chevron_left" :disable="actividadPagina === 1" @click="irActividad(actividadPagina - 1)" />
        <q-btn
          flat
          dense
          round
          icon="chevron_right"
          :disable="actividadPagina >= actividadTotalPaginas"
          @click="irActividad(actividadPagina + 1)"
        />
        <q-btn
          flat
          dense
          round
          icon="last_page"
          :disable="actividadPagina >= actividadTotalPaginas"
          @click="irActividad(actividadTotalPaginas)"
        />
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  getResumen,
  getActividadReciente,
  exportarActividadExcel,
  exportarActividadPdf,
} from '@/services/panelAdministrativo'

// ─── Estado principal ─────────────────────────────────────────────────────────

const cargando = ref(false)
const resumen = ref({})
const errorMessage = ref('')

const hoy = new Date().toISOString().slice(0, 10)
const filtros = reactive({ fechaDesde: hoy, fechaHasta: hoy })

// ─── Actividad reciente ───────────────────────────────────────────────────────

const actividadRegistros = ref([])
const actividadPagina = ref(1)
const actividadTotalPaginas = ref(1)
const actividadTotalRegistros = ref(0)
const actividadPorPagina = ref(20)
const cargandoActividad = ref(false)
const exportandoExcel = ref(false)
const exportandoPdf = ref(false)

// ─── Mejores rutas ────────────────────────────────────────────────────────────

const expandidosRutas = ref(new Set())

// ─── Definición de columnas ───────────────────────────────────────────────────

const columnasMonedas = [
  { name: 'codigoMoneda', label: 'Moneda', field: 'codigoMoneda', align: 'left' },
  { name: 'volumenOperado', label: 'Volumen operado', field: (r) => fmtDecimal(r.volumenOperado), align: 'right' },
  { name: 'cantidadOperaciones', label: 'Operaciones', field: 'cantidadOperaciones', align: 'right' },
  { name: 'cantidadComprada', label: 'Comprada', field: (r) => fmtDecimal(r.cantidadComprada), align: 'right' },
  { name: 'cantidadVendida', label: 'Vendida', field: (r) => fmtDecimal(r.cantidadVendida), align: 'right' },
  { name: 'totalDepositado', label: 'Depositado', field: (r) => fmtDecimal(r.totalDepositado), align: 'right' },
  { name: 'totalRetirado', label: 'Retirado', field: (r) => fmtDecimal(r.totalRetirado), align: 'right' },
]

const columnasActividad = [
  { name: 'fechaHora', label: 'Fecha', field: (r) => fmtFecha(r.fechaHora), align: 'left' },
  { name: 'usuario', label: 'Usuario', field: 'usuario', align: 'left' },
  { name: 'tipoOperacion', label: 'Tipo', field: 'tipoOperacion', align: 'left' },
  { name: 'par', label: 'Par', field: (r) => r.par || '-', align: 'left' },
  { name: 'montoTotal', label: 'Monto total', field: (r) => fmtDecimal(r.montoTotal), align: 'right' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
]

const opcionesActividadPagina = [
  { label: '10', value: 10 },
  { label: '20', value: 20 },
  { label: '40', value: 40 },
  { label: '100', value: 100 },
  { label: '200', value: 200 },
  { label: '400', value: 400 },
  { label: 'Todos', value: 0 },
]

// ─── Computed ─────────────────────────────────────────────────────────────────

const fechaError = computed(() => {
  if (filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta) {
    return 'La fecha final debe ser posterior a la fecha inicial'
  }
  return ''
})

const cards = computed(() => [
  { label: 'Total usuarios registrados', value: resumen.value.totalUsuariosRegistrados ?? 0 },
  { label: 'Usuarios activos en el período', value: resumen.value.usuariosActivosEnPeriodo ?? 0 },
  { label: 'Total de depósitos', value: fmtDecimal(resumen.value.totalDepositos ?? 0) },
  { label: 'Total de retiros', value: fmtDecimal(resumen.value.totalRetiros ?? 0) },
  { label: 'Volumen total operado', value: fmtDecimal(resumen.value.volumenTotalOperado ?? 0) },
  { label: 'Órdenes activas', value: resumen.value.ordenesActivas ?? 0 },
  { label: 'Ofertas activas', value: resumen.value.ofertasActivas ?? 0 },
  { label: 'Transacciones ejecutadas', value: resumen.value.transaccionesEjecutadas ?? 0 },
])

const volumenPorMoneda = computed(() => resumen.value.volumenPorMoneda || [])
const volumenPorDia = computed(() => resumen.value.volumenPorDia || [])
const operacionesPorDia = computed(() => resumen.value.operacionesPorDia || [])
const distribucionPorTipo = computed(() => resumen.value.distribucionPorTipo || [])
const monedas = computed(() => resumen.value.monedas || [])
const mejoresRutas = computed(() => resumen.value.mejoresRutas || [])

const maxVolumen = computed(() => Math.max(1, ...volumenPorDia.value.map((i) => Number(i.volumen || 0))))
const maxOperaciones = computed(() => Math.max(1, ...operacionesPorDia.value.map((i) => Number(i.cantidadOperaciones || 0))))
const maxVolumenMoneda = computed(() => Math.max(1, ...volumenPorMoneda.value.map((i) => Number(i.volumen || 0))))
const maxDistribucion = computed(() => Math.max(1, ...distribucionPorTipo.value.map((i) => Number(i.cantidad || 0))))

const rangoTexto = computed(() => {
  if (filtros.fechaDesde === filtros.fechaHasta) return `Período actual: ${filtros.fechaDesde}`
  return `${filtros.fechaDesde} — ${filtros.fechaHasta}`
})

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(() => {
  cargarResumen()
  cargarActividadReciente()
})

// ─── Funciones ────────────────────────────────────────────────────────────────

async function cargarResumen() {
  if (fechaError.value) return
  cargando.value = true
  errorMessage.value = ''
  try {
    const { data } = await getResumen({
      fechaDesde: filtros.fechaDesde || undefined,
      fechaHasta: filtros.fechaHasta || undefined,
    })
    resumen.value = data || {}
    expandidosRutas.value = new Set()
  } catch (error) {
    errorMessage.value =
      error.response?.data?.mensaje ||
      error.response?.data?.detalle ||
      'No se pudo cargar el panel administrativo.'
  } finally {
    cargando.value = false
  }
}

async function cargarActividadReciente() {
  if (fechaError.value) return
  cargandoActividad.value = true
  try {
    const { data } = await getActividadReciente({
      fechaDesde: filtros.fechaDesde || undefined,
      fechaHasta: filtros.fechaHasta || undefined,
      pagina: actividadPagina.value,
      registrosPorPagina: actividadPorPagina.value === 0 ? 9999 : actividadPorPagina.value,
    })
    actividadRegistros.value = data.registros || []
    actividadTotalPaginas.value = data.totalPaginas || 1
    actividadTotalRegistros.value = data.totalRegistros ?? actividadRegistros.value.length
    actividadPagina.value = data.paginaActual || actividadPagina.value
  } finally {
    cargandoActividad.value = false
  }
}

async function actualizar() {
  actividadPagina.value = 1
  await Promise.all([cargarResumen(), cargarActividadReciente()])
}

function reiniciarActividad() {
  actividadPagina.value = 1
  cargarActividadReciente()
}

function irActividad(pagina) {
  actividadPagina.value = Math.min(Math.max(1, pagina), actividadTotalPaginas.value)
  cargarActividadReciente()
}

function toggleRuta(idx) {
  const nuevo = new Set(expandidosRutas.value)
  if (nuevo.has(idx)) nuevo.delete(idx)
  else nuevo.add(idx)
  expandidosRutas.value = nuevo
}

async function onExportarActividad(tipo) {
  const fn = tipo === 'excel' ? exportarActividadExcel : exportarActividadPdf
  if (tipo === 'excel') exportandoExcel.value = true
  else exportandoPdf.value = true
  try {
    const response = await fn({
      fechaDesde: filtros.fechaDesde || undefined,
      fechaHasta: filtros.fechaHasta || undefined,
    })
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/octet-stream',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `actividad.${tipo === 'excel' ? 'xls' : 'pdf'}`
    a.click()
    URL.revokeObjectURL(url)
  } finally {
    if (tipo === 'excel') exportandoExcel.value = false
    else exportandoPdf.value = false
  }
}

function pct(valor, max) {
  return Math.max(3, Math.min(100, (Number(valor || 0) / max) * 100))
}

function fmtDecimal(valor) {
  const n = Number(valor)
  if (Number.isNaN(n)) return '0.00'
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtFecha(fecha) {
  return fecha ? new Date(fecha).toLocaleString() : '-'
}

function fmtFechaCorta(fecha) {
  return fecha ? new Date(fecha).toLocaleDateString() : '-'
}

const TIPO_COLORES = {
  'orden de compra': '#3b82f6',
  'oferta de venta': '#22c55e',
  'compra inmediata': '#06b6d4',
  'venta inmediata': '#f97316',
  deposito: '#8b5cf6',
  'depósito': '#8b5cf6',
  retiro: '#ec4899',
}

function colorTipo(tipo) {
  return TIPO_COLORES[String(tipo || '').toLowerCase()] || '#94a3b8'
}
</script>

<style scoped>
/* ── Gráficos de barras CSS ── */
.admin-bars {
  display: grid;
  gap: 10px;
}

.admin-bar-row {
  display: grid;
  grid-template-columns: 90px 1fr 90px;
  gap: 10px;
  align-items: center;
}

.admin-bar-row--tipo {
  grid-template-columns: 130px 1fr 60px;
}

.admin-bar-label {
  font-size: 12px;
  opacity: 0.75;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-bar-label--tipo {
  font-size: 11px;
}

.admin-bar-value {
  font-size: 12px;
  opacity: 0.75;
  text-align: right;
}

.admin-bar-track {
  height: 12px;
  border-radius: 999px;
  background: rgba(59, 130, 246, 0.12);
  overflow: hidden;
}

.admin-bar-fill {
  height: 100%;
  border-radius: inherit;
  background: #3b82f6;
  transition: width 0.4s ease;
}

.admin-bar-fill--secondary { background: #22c55e; }
.admin-bar-fill--moneda    { background: #f97316; }

/* ── Tabla Mejores rutas ── */
.admin-table-wrap {
  overflow-x: auto;
}

.admin-table {
  border-collapse: collapse;
  font-size: 0.82rem;
  width: 100%;
}

.admin-table th,
.admin-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--xchang-border);
  text-align: left;
  white-space: nowrap;
}

.admin-table th {
  color: var(--xchang-text-secondary);
  font-weight: 700;
  background: var(--xchang-surface);
}

.admin-table-expand-row td {
  background: color-mix(in srgb, var(--xchang-surface) 92%, var(--q-primary) 8%);
  white-space: normal;
}
</style>
