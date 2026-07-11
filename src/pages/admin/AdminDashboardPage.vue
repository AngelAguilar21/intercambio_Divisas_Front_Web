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
          <q-btn color="primary" icon="refresh" label="Actualizar" :loading="cargando" @click="cargarResumen" />
        </div>
      </div>
    </div>

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
            @click="cargarResumen"
          />
        </div>
      </div>
    </q-card>

    <q-banner v-if="errorMessage" dense rounded class="xchang-banner xchang-banner--error q-mb-md">
      {{ errorMessage }}
    </q-banner>

    <div class="row q-col-gutter-md q-mb-md">
      <div v-for="card in cards" :key="card.label" class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="q-pa-md xc-card-accent">
          <div class="text-caption xc-text-secondary">{{ card.label }}</div>
          <div class="text-h5 text-weight-bold">{{ card.value }}</div>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-lg-6">
        <q-card flat bordered class="q-pa-md xc-card-accent full-height">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">Volumen total operado por día</div>

          <div v-if="volumenPorDia.length" class="admin-bars">
            <div
              v-for="item in volumenPorDia"
              :key="`vol-${item.fecha}`"
              class="admin-bar-row"
            >
              <div class="admin-bar-label">{{ formatearFechaCorta(item.fecha) }}</div>
              <div class="admin-bar-track">
                <div class="admin-bar-fill" :style="{ width: porcentajeVolumen(item.volumen) + '%' }" />
              </div>
              <div class="admin-bar-value">{{ formatearDecimal(item.volumen) }}</div>
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
            <div
              v-for="item in operacionesPorDia"
              :key="`op-${item.fecha}`"
              class="admin-bar-row"
            >
              <div class="admin-bar-label">{{ formatearFechaCorta(item.fecha) }}</div>
              <div class="admin-bar-track">
                <div class="admin-bar-fill admin-bar-fill--secondary" :style="{ width: porcentajeOperaciones(item.cantidadOperaciones) + '%' }" />
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

    <q-card flat bordered class="q-pa-md xc-card-accent">
      <div class="row items-center q-mb-sm">
        <div class="text-subtitle1 text-weight-medium col">Volumen del día por moneda</div>
        <div class="text-caption xc-text-secondary">{{ rangoTexto }}</div>
      </div>

      <q-table
        :rows="volumenPorMoneda"
        :columns="columnasVolumen"
        row-key="monedaId"
        :loading="cargando"
        flat
        no-data-label="No hay volumen registrado para el período seleccionado"
      />
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { getResumen } from '@/services/panelAdministrativo'

const cargando = ref(false)
const resumen = ref({})
const errorMessage = ref('')

const hoy = new Date().toISOString().slice(0, 10)

const filtros = reactive({
  fechaDesde: hoy,
  fechaHasta: hoy,
})

const columnasVolumen = [
  {
    name: 'codigoMoneda',
    label: 'Moneda',
    field: (row) => row.codigoMoneda || row.codigoISO || '-',
    align: 'left',
  },
  {
    name: 'volumen',
    label: 'Volumen',
    field: 'volumen',
    align: 'right',
    format: formatearDecimal,
  },
]

const fechaError = computed(() => {
  if (filtros.fechaDesde && filtros.fechaHasta && filtros.fechaDesde > filtros.fechaHasta) {
    return 'La fecha final debe ser posterior a la fecha inicial'
  }

  return ''
})

const cards = computed(() => [
  { label: 'Total usuarios registrados', value: resumen.value.totalUsuariosRegistrados ?? 0 },
  { label: 'Usuarios activos en el período', value: resumen.value.usuariosActivosEnPeriodo ?? 0 },
  { label: 'Total de depósitos', value: formatearDecimal(resumen.value.totalDepositos ?? 0) },
  { label: 'Total de retiros', value: formatearDecimal(resumen.value.totalRetiros ?? 0) },
  { label: 'Volumen total operado', value: formatearDecimal(resumen.value.volumenTotalOperado ?? 0) },
  { label: 'Órdenes activas', value: resumen.value.ordenesActivas ?? 0 },
  { label: 'Ofertas activas', value: resumen.value.ofertasActivas ?? 0 },
  { label: 'Transacciones ejecutadas', value: resumen.value.transaccionesEjecutadas ?? 0 },
])

const volumenPorMoneda = computed(() => resumen.value.volumenPorMoneda || [])
const volumenPorDia = computed(() => resumen.value.volumenPorDia || [])
const operacionesPorDia = computed(() => resumen.value.operacionesPorDia || [])

const maxVolumen = computed(() =>
  Math.max(1, ...volumenPorDia.value.map((item) => Number(item.volumen || 0))),
)

const maxOperaciones = computed(() =>
  Math.max(1, ...operacionesPorDia.value.map((item) => Number(item.cantidadOperaciones || 0))),
)

const rangoTexto = computed(() => {
  if (filtros.fechaDesde === filtros.fechaHasta) {
    return `Período actual: ${filtros.fechaDesde}`
  }

  return `Período actual: ${filtros.fechaDesde} a ${filtros.fechaHasta}`
})

onMounted(cargarResumen)

async function cargarResumen() {
  if (fechaError.value) {
    return
  }

  cargando.value = true
  errorMessage.value = ''

  try {
    const { data } = await getResumen({
      fechaDesde: filtros.fechaDesde || undefined,
      fechaHasta: filtros.fechaHasta || undefined,
    })

    resumen.value = data || {}
  } catch (error) {
    errorMessage.value =
      error.response?.data?.mensaje ||
      error.response?.data?.detalle ||
      'No se pudo cargar el panel administrativo.'
  } finally {
    cargando.value = false
  }
}

function porcentajeVolumen(valor) {
  return Math.max(3, Math.min(100, (Number(valor || 0) / maxVolumen.value) * 100))
}

function porcentajeOperaciones(valor) {
  return Math.max(3, Math.min(100, (Number(valor || 0) / maxOperaciones.value) * 100))
}

function formatearDecimal(valor) {
  const n = Number(valor)
  if (Number.isNaN(n)) return '0.00'
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatearFechaCorta(fecha) {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleDateString()
}
</script>

<style scoped>
.admin-bars {
  display: grid;
  gap: 12px;
}

.admin-bar-row {
  display: grid;
  grid-template-columns: 90px 1fr 90px;
  gap: 10px;
  align-items: center;
}

.admin-bar-label,
.admin-bar-value {
  font-size: 12px;
  color: currentColor;
  opacity: 0.75;
}

.admin-bar-value {
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
}

.admin-bar-fill--secondary {
  background: #22c55e;
}
</style>
