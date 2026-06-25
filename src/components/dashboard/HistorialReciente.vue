<template>
  <q-card flat bordered class="xc-hist-card xc-card-accent xc-enter">
    <div class="row items-center justify-between q-mb-sm">
      <div class="text-subtitle1 text-weight-bold">Actividad reciente</div>

      <div class="row items-center q-gutter-sm">
        <q-select
          v-model="filtroEstado"
          dense
          borderless
          :options="estadoOptions"
          class="xc-hist-filtro"
        />
        <q-btn flat dense no-caps color="primary" label="Ver todo" :to="{ name: 'historial' }" />
      </div>
    </div>

    <q-table
      :rows="filasFiltradas"
      :columns="columnas"
      row-key="id"
      flat
      dense
      :loading="cargando"
      :pagination="{ rowsPerPage: 6 }"
      hide-pagination
    >
      <template #body-cell-par="props">
        <q-td :props="props">
          <ParMonedaChip :origen="props.row.origen" :destino="props.row.destino" />
        </q-td>
      </template>

      <template #body-cell-estado="props">
        <q-td :props="props">
          <EstadoBadge :estado="props.row.estado" />
        </q-td>
      </template>

      <template #no-data>
        <div class="xc-hist-empty">Aún no registras operaciones.</div>
      </template>
    </q-table>
  </q-card>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getHistorial } from '@/services/historial'
import ParMonedaChip from '@/components/common/ParMonedaChip.vue'
import EstadoBadge from '@/components/common/EstadoBadge.vue'
import { formatearFecha, formatearMonto } from '@/utils/formato'

const estadoOptions = ['Todos', 'Activa', 'Parcialmente ejecutada', 'Completada', 'Cancelada']
const filtroEstado = ref('Todos')
const cargando = ref(false)
const filas = ref([])

const columnas = [
  { name: 'fecha', label: 'Fecha', field: (r) => formatearFecha(r.fechaHora), align: 'left' },
  { name: 'par', label: 'Par', align: 'left' },
  { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left' },
  {
    name: 'monto',
    label: 'Monto',
    field: (r) => formatearMonto(r.monto),
    align: 'right',
    classes: 'xc-figure',
  },
  { name: 'estado', label: 'Estado', align: 'left' },
]

const filasFiltradas = computed(() => {
  if (filtroEstado.value === 'Todos') return filas.value
  return filas.value.filter((f) => f.estado === filtroEstado.value)
})

onMounted(cargar)

defineExpose({ cargar })

async function cargar() {
  cargando.value = true

  try {
    const [compras, ventas] = await Promise.all([
      getHistorial({ columna: 'ComprasInmediatas', registrosPorPagina: 5 }),
      getHistorial({ columna: 'VentasInmediatas', registrosPorPagina: 5 }),
    ])

    const deCompras = (compras.data?.comprasInmediatas?.lista || []).map((r, i) => ({
      id: `c-${i}`,
      tipo: 'Compra',
      fechaHora: r.fechaHora,
      origen: r.parMonedas?.split('/')?.[0] || '',
      destino: r.parMonedas?.split('/')?.[1] || '',
      monto: r.cantidadObtenida,
      estado: r.estado,
    }))

    const deVentas = (ventas.data?.ventasInmediatas?.lista || []).map((r, i) => ({
      id: `v-${i}`,
      tipo: 'Venta',
      fechaHora: r.fechaHora,
      origen: r.parMonedas?.split('/')?.[0] || '',
      destino: r.parMonedas?.split('/')?.[1] || '',
      monto: r.cantidadVendida,
      estado: r.estado,
    }))

    filas.value = [...deCompras, ...deVentas]
      .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))
      .slice(0, 6)
  } catch {
    filas.value = []
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.xc-hist-card {
  padding: 20px;
}

.xc-hist-filtro {
  width: 150px;
  font-size: 0.85rem;
}

.xc-hist-empty {
  padding: 28px 0;
  text-align: center;
  color: var(--xchang-text-secondary);
  font-size: 0.88rem;
}
</style>
