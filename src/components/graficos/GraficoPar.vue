<template>
  <div>
    <div v-if="cargando && !serie.length" class="flex flex-center grafico-wrapper">
      <q-spinner size="lg" color="primary" />
    </div>

    <div v-else-if="!serie.length" class="grafico-wrapper flex flex-center">
      <q-banner
        v-if="errorCarga"
        dense
        rounded
        class="xchang-banner xchang-banner--error"
        style="max-width: 420px"
      >
        {{ errorCarga }}
      </q-banner>
      <span v-else-if="!props.origen || !props.destino" class="text-grey-6 text-body2">
        Selecciona un par desde la sección Monedas para ver el gráfico.
      </span>
      <span v-else class="text-grey-6 text-body2">
        Aún no hay suficiente historial para graficar este par.
      </span>
    </div>

    <div v-else>
      <q-banner
        v-if="rangoEfectivo !== props.rango"
        dense
        rounded
        class="xchang-banner xchang-banner--info q-mb-sm"
      >
        No había datos en Último día. Se muestra automáticamente Última semana.
      </q-banner>

      <div
        ref="canvasWrapper"
        class="grafico-wrapper"
        @mousemove.passive="onMouseMove"
        @mouseleave="onMouseLeave"
      >
        <Line ref="lineRef" :data="chartData" :options="chartOptions" />
      </div>

      <div class="row q-col-gutter-sm q-mt-xs items-end">
        <div class="col-auto">
          <div class="text-caption text-grey-6">Mayor precio de compra</div>
          <div class="text-subtitle2 text-weight-bold" style="color: var(--xchang-buy-color)">
            {{ puntoActual ? formatearDecimal(puntoActual.mayorPrecioCompra) : '—' }}
          </div>
        </div>
        <div class="col-auto">
          <div class="text-caption text-grey-6">Menor precio de venta</div>
          <div class="text-subtitle2 text-weight-bold" style="color: var(--xchang-sell-color)">
            {{ puntoActual ? formatearDecimal(puntoActual.menorPrecioVenta) : '—' }}
          </div>
        </div>
        <div class="col-auto">
          <div class="text-caption text-grey-6">Margen</div>
          <div class="text-subtitle2 text-weight-bold">
            {{ puntoActual ? formatearDecimal(puntoActual.margen) : '—' }}
          </div>
        </div>
        <div v-if="puntoActual?.fechaHora" class="col-auto">
          <div class="text-caption text-grey-6">Fecha/hora</div>
          <div class="text-caption text-grey-8">{{ formatearFechaCompleta(puntoActual.fechaHora) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'vue-chartjs'
import { useAuthStore } from '@/stores/auth'
import { getSerieHistorica } from '@/services/preciosPares'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps({
  origen: { type: String, default: '' },
  destino: { type: String, default: '' },
  rango: { type: String, default: 'UltimoDia' },
  autoRefresh: { type: Boolean, default: true },
  fallbackUltimaSemana: { type: Boolean, default: true },
})

const emit = defineEmits(['punto-seleccionado', 'rango-fallback', 'rango-resuelto'])

const authStore = useAuthStore()
const lineRef = ref(null)

const serie = ref([])
const cargando = ref(false)
const errorCarga = ref('')
const puntoActual = ref(null)
const rangoEfectivo = ref(props.rango)

let intervalo = null

const colorCompra = computed(() => (authStore.temaVisual === 'Oscuro' ? '#64b5f6' : '#1565c0'))
const colorVenta = computed(() => (authStore.temaVisual === 'Oscuro' ? '#81c784' : '#2e7d32'))

const chartData = computed(() => ({
  labels: serie.value.map((p) => formatearEtiqueta(p.fechaHora, rangoEfectivo.value)),
  datasets: [
    {
      label: 'Mayor precio de compra',
      data: serie.value.map((p) => normalizarNumero(p.mayorPrecioCompra)),
      borderColor: colorCompra.value,
      backgroundColor: `${colorCompra.value}22`,
      tension: 0.3,
      fill: false,
      pointRadius: 2,
      pointHoverRadius: 5,
    },
    {
      label: 'Menor precio de venta',
      data: serie.value.map((p) => normalizarNumero(p.menorPrecioVenta)),
      borderColor: colorVenta.value,
      backgroundColor: `${colorVenta.value}22`,
      tension: 0.3,
      fill: false,
      pointRadius: 2,
      pointHoverRadius: 5,
    },
  ],
}))

const chartOptions = computed(() => {
  const isDark = authStore.temaVisual === 'Oscuro'
  const tickColor = isDark ? '#b0bec5' : '#555555'
  const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const textColor = isDark ? '#e0e0e0' : '#222222'
  const esSemana = rangoEfectivo.value === 'UltimaSemana'

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true,
        labels: { usePointStyle: true, boxWidth: 10, color: textColor },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          title: (items) => {
            const index = items[0]?.dataIndex ?? 0
            return serie.value[index]?.fechaHora ? formatearFechaCompleta(serie.value[index].fechaHora) : ''
          },
          label: (ctx) => `${ctx.dataset.label}: ${formatearDecimal(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Tiempo', color: tickColor },
        ticks: {
          color: tickColor,
          maxRotation: esSemana ? 0 : 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: esSemana ? 8 : 12,
        },
        grid: { color: gridColor },
      },
      y: {
        title: { display: true, text: 'Precio', color: tickColor },
        ticks: { color: tickColor },
        grid: { color: gridColor },
      },
    },
  }
})

watch(
  () => authStore.temaVisual,
  () => {
    const chart = lineRef.value?.chart
    if (!chart) return
    chart.update()
  },
)

function normalizarPuntos(data) {
  const puntos = data?.serie ?? data?.puntos ?? data?.datos ?? data?.registros ?? (Array.isArray(data) ? data : [])
  return puntos.filter(
    (p) =>
      Number.isFinite(Number(p.mayorPrecioCompra)) ||
      Number.isFinite(Number(p.menorPrecioVenta)) ||
      Number.isFinite(Number(p.precio)),
  )
}

async function obtenerSerie(rangoConsulta) {
  const { data } = await getSerieHistorica(props.origen, props.destino, rangoConsulta)
  return normalizarPuntos(data)
}

async function cargarSerie() {
  if (!props.origen || !props.destino) return
  cargando.value = true
  errorCarga.value = ''

  try {
    let puntos = await obtenerSerie(props.rango)
    let rangoUsado = props.rango

    if (!puntos.length && props.rango === 'UltimoDia' && props.fallbackUltimaSemana) {
      const puntosSemana = await obtenerSerie('UltimaSemana')
      if (puntosSemana.length) {
        puntos = puntosSemana
        rangoUsado = 'UltimaSemana'
        emit('rango-fallback', 'UltimaSemana')
      }
    }

    rangoEfectivo.value = rangoUsado
    emit('rango-resuelto', rangoUsado)
    serie.value = puntos

    const ultimo = serie.value.at(-1) ?? null
    puntoActual.value = ultimo
    emit('punto-seleccionado', ultimo)
  } catch {
    errorCarga.value = `No se pudo cargar la serie para ${props.origen}/${props.destino}.`
    serie.value = []
    puntoActual.value = null
  } finally {
    cargando.value = false
  }
}

watch([() => props.origen, () => props.destino, () => props.rango], cargarSerie)

onMounted(async () => {
  await cargarSerie()
  if (props.autoRefresh) {
    intervalo = setInterval(cargarSerie, 30_000)
  }
})

onUnmounted(() => {
  if (intervalo) clearInterval(intervalo)
})

function onMouseMove(event) {
  const chart = lineRef.value?.chart
  if (!chart || !serie.value.length) return

  const rect = chart.canvas.getBoundingClientRect()
  const pixelX = event.clientX - rect.left
  const xScale = chart.scales.x
  if (!xScale) return

  const { left, right } = chart.chartArea
  const clampedX = Math.max(left, Math.min(right, pixelX))
  const rawIndex = xScale.getValueForPixel(clampedX)
  if (rawIndex == null) return

  const index = Math.max(0, Math.min(Math.round(rawIndex), serie.value.length - 1))
  const punto = serie.value[index]
  if (!punto) return

  if (punto !== puntoActual.value) {
    puntoActual.value = punto
    emit('punto-seleccionado', punto)
  }
}

function onMouseLeave() {
  const ultimo = serie.value.at(-1) ?? null
  puntoActual.value = ultimo
  emit('punto-seleccionado', ultimo)
}

function formatearEtiqueta(fecha, rango) {
  const d = new Date(fecha)

  if (rango === 'UltimoDia') {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (rango === 'UltimaSemana') {
    return [
      d.toLocaleDateString([], { day: '2-digit', month: '2-digit' }),
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ]
  }

  if (rango === 'UltimoAno' || rango === 'Total') {
    return d.toLocaleDateString([], { month: '2-digit', year: 'numeric' })
  }

  return d.toLocaleDateString([], { day: '2-digit', month: '2-digit' })
}

function formatearFechaCompleta(fecha) {
  return new Date(fecha).toLocaleString([], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function normalizarNumero(valor) {
  if (valor == null || Number.isNaN(Number(valor))) return null
  return Number(valor)
}

function formatearDecimal(valor) {
  if (valor == null || Number.isNaN(Number(valor))) return '-'
  return Number(valor).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}
</script>

<style scoped>
.grafico-wrapper {
  position: relative;
  height: 280px;
  cursor: crosshair;
}
</style>
