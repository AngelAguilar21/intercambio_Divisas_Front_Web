<template>
  <q-page class="q-pa-md">
    <div class="xc-page-head">
      <span class="xc-section-kicker"><q-icon name="history" size="14px" /> Historial</span>
      <h1 class="xc-section-title">Historial de operaciones</h1>
      <div class="xc-section-bar" aria-hidden="true" />
      <p class="xc-page-head-desc">Cuatro secciones: órdenes, ofertas, compras inmediatas y ventas inmediatas.</p>
    </div>

    <div class="historial-wrapper">
      <div v-for="col in columnas" :key="col.key" class="historial-columna">
        <q-card flat bordered class="xc-card-accent historial-card">
          <div class="q-px-sm q-pt-sm q-pb-xs text-subtitle2 text-weight-bold historial-col-header">
            {{ col.titulo }}
          </div>

          <div class="q-px-sm q-pt-xs q-pb-xs">
            <div class="row q-col-gutter-xs">
              <div class="col-6">
                <q-input v-model="estado[col.key].fechaDesde" type="date" label="Fecha desde" outlined dense @update:model-value="cargar(col.key)" />
              </div>
              <div class="col-6">
                <q-input v-model="estado[col.key].fechaHasta" type="date" label="Fecha hasta" outlined dense @update:model-value="cargar(col.key)" />
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
            <div v-else-if="estado[col.key].filas.length === 0" class="q-pa-md text-center xc-text-secondary text-caption">
              No se encontraron operaciones
            </div>
            <table v-else class="historial-table">
              <thead>
                <tr>
                  <th v-for="campo in col.campos" :key="campo.key">{{ campo.label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="fila in estado[col.key].filas" :key="filaKey(fila)">
                  <td v-for="campo in col.campos" :key="campo.key">{{ valor(campo, fila) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="paginacion-row">
            <q-btn-group flat dense>
              <q-btn flat dense size="sm" label="«" @click="ir(col.key, 1)"><q-tooltip>Primera página</q-tooltip></q-btn>
              <q-btn flat dense size="sm" label="‹" @click="ir(col.key, estado[col.key].pagina - 1)"><q-tooltip>Página anterior</q-tooltip></q-btn>
              <q-btn flat dense size="sm" label="›" @click="ir(col.key, estado[col.key].pagina + 1)"><q-tooltip>Página siguiente</q-tooltip></q-btn>
              <q-btn flat dense size="sm" label="»" @click="ir(col.key, estado[col.key].totalPaginas)"><q-tooltip>Última página</q-tooltip></q-btn>
            </q-btn-group>
            <span class="text-caption xc-text-secondary q-mx-xs">{{ estado[col.key].pagina }} / {{ estado[col.key].totalPaginas || 1 }}</span>
            <q-space />
            <q-select v-model="estado[col.key].registrosPorPagina" :options="opcionesPagina" emit-value map-options dense outlined style="min-width:88px" @update:model-value="cargar(col.key)" />
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { getHistorial } from '@/services/historial'

const opcionesPagina = [{ label: '5', value: 5 }, { label: '10', value: 10 }, { label: '20', value: 20 }]
const columnas = [
  { key: 'OrdenesCompra', titulo: 'Órdenes de compra', campos: [
    { key: 'fechaCreacion', label: 'Fecha', fn: (r) => fmt(r.fechaCreacion) }, { key: 'monedaOrigen', label: 'Origen' }, { key: 'monedaDestino', label: 'Destino' }, { key: 'cantidadOriginal', label: 'Original' }, { key: 'cantidadPendiente', label: 'Pendiente' }, { key: 'precioUnitario', label: 'Precio' }, { key: 'estado', label: 'Estado' },
  ]},
  { key: 'OfertasVenta', titulo: 'Ofertas de venta', campos: [
    { key: 'fechaCreacion', label: 'Fecha', fn: (r) => fmt(r.fechaCreacion) }, { key: 'monedaOrigen', label: 'Origen' }, { key: 'monedaDestino', label: 'Destino' }, { key: 'cantidadOriginal', label: 'Original' }, { key: 'cantidadPendiente', label: 'Pendiente' }, { key: 'precioUnitario', label: 'Precio' }, { key: 'estado', label: 'Estado' },
  ]},
  { key: 'ComprasInmediatas', titulo: 'Compras inmediatas', campos: [
    { key: 'fechaHora', label: 'Fecha', fn: (r) => fmt(r.fechaHora) }, { key: 'parMonedas', label: 'Par' }, { key: 'cantidadObtenida', label: 'Cantidad' }, { key: 'precioPromCompra', label: 'Precio prom.' }, { key: 'totalPagado', label: 'Total pagado' }, { key: 'estado', label: 'Estado' },
  ]},
  { key: 'VentasInmediatas', titulo: 'Ventas inmediatas', campos: [
    { key: 'fechaHora', label: 'Fecha', fn: (r) => fmt(r.fechaHora) }, { key: 'parMonedas', label: 'Par' }, { key: 'cantidadVendida', label: 'Cantidad' }, { key: 'precioPromVenta', label: 'Precio prom.' }, { key: 'totalRecibido', label: 'Total recibido' }, { key: 'estado', label: 'Estado' },
  ]},
]

const estado = reactive(Object.fromEntries(columnas.map((c) => [c.key, { filas: [], cargando: false, pagina: 1, totalPaginas: 1, registrosPorPagina: 5, fechaDesde: '', fechaHasta: '' }])))

onMounted(() => columnas.forEach((c) => cargar(c.key)))

function fechaInvalida(key) {
  const e = estado[key]
  return e.fechaDesde && e.fechaHasta && new Date(e.fechaDesde) > new Date(e.fechaHasta)
}
async function cargar(key) {
  if (fechaInvalida(key)) return
  const e = estado[key]
  e.cargando = true
  try {
    const { data } = await getHistorial({ tipo: key, pagina: e.pagina, registrosPorPagina: e.registrosPorPagina, fechaDesde: e.fechaDesde || undefined, fechaHasta: e.fechaHasta || undefined })
    e.filas = data.registros || []
    e.totalPaginas = data.totalPaginas || 1
  } finally { e.cargando = false }
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
  return fila.ordenCompraId || fila.ofertaVentaId || fila.operacionInmediataId || JSON.stringify(fila)
}
function fmt(fecha) {
  return fecha ? new Date(fecha).toLocaleString() : '-'
}
</script>
