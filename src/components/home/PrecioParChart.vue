<template>
  <q-card flat bordered class="xc-chart-card xc-card-accent-hover">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-sm">
        <div class="xc-icon-badge">
          <q-icon name="show_chart" size="18px" color="primary" />
        </div>
        <div class="text-subtitle1 text-weight-bold">{{ titulo }}</div>
        <ParMonedaChip :origen="monedaOrigen" :destino="monedaDestino" />
      </div>
    </div>

    <div v-if="cargando" class="xc-chart-skeleton">
      <q-skeleton height="180px" square />
    </div>

    <q-banner v-else-if="errorMessage" dense class="xchang-banner xchang-banner--error">
      {{ errorMessage }}
    </q-banner>

    <template v-else>
      <svg
        v-if="puntos.length >= 2"
        :viewBox="`0 0 ${ancho} ${alto}`"
        class="xc-chart-svg"
        preserveAspectRatio="none"
        role="img"
        aria-label="Gráfico de mayor precio de compra y menor precio de venta a lo largo del tiempo"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
      >
        <line
          v-for="g in lineasGuia"
          :key="g"
          x1="0"
          :x2="ancho"
          :y1="g"
          :y2="g"
          class="xc-chart-grid"
        />
        <polyline :points="lineaCompra" class="xc-chart-line xchang-buy-line" />
        <polyline :points="lineaVenta" class="xc-chart-line xchang-sell-line" />

        <line
          v-if="indiceSeleccionado !== null"
          :x1="puntos[indiceSeleccionado].x"
          :x2="puntos[indiceSeleccionado].x"
          y1="0"
          :y2="alto"
          class="xc-chart-crosshair"
        />
        <circle
          v-if="indiceSeleccionado !== null"
          :cx="puntos[indiceSeleccionado].x"
          :cy="puntos[indiceSeleccionado].compraY"
          r="4"
          class="xchang-buy-line xc-chart-dot"
        />
        <circle
          v-if="indiceSeleccionado !== null"
          :cx="puntos[indiceSeleccionado].x"
          :cy="puntos[indiceSeleccionado].ventaY"
          r="4"
          class="xchang-sell-line xc-chart-dot"
        />
      </svg>

      <q-banner v-else dense class="xchang-banner xchang-banner--empty">
        Aún no hay suficiente historial para graficar este par.
      </q-banner>

      <div class="xc-chart-stats">
        <div class="xc-chart-stat">
          <div class="xc-chart-stat-label">Mayor precio de compra</div>
          <div class="xc-chart-stat-valor xchang-buy-line xc-figure">
            {{ formatearMonto(puntoActual.mayorPrecioCompra, 4) }}
          </div>
        </div>
        <div class="xc-chart-stat">
          <div class="xc-chart-stat-label">Menor precio de venta</div>
          <div class="xc-chart-stat-valor xchang-sell-line xc-figure">
            {{ formatearMonto(puntoActual.menorPrecioVenta, 4) }}
          </div>
        </div>
        <div class="xc-chart-stat">
          <div class="xc-chart-stat-label">Margen</div>
          <div class="xc-chart-stat-valor xc-figure">
            {{ formatearMonto(puntoActual.margen, 4) }}
          </div>
        </div>
        <div class="xc-chart-stat">
          <div class="xc-chart-stat-label">Fecha y hora</div>
          <div class="xc-chart-stat-valor">
            {{ puntoActual.fechaHora ? formatearFecha(puntoActual.fechaHora) : 'Actual' }}
          </div>
        </div>
      </div>
    </template>
  </q-card>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { getSerieHistorica } from '@/services/preciosPares'
import ParMonedaChip from '@/components/common/ParMonedaChip.vue'
import { formatearFecha, formatearMonto } from '@/utils/formato'

const props = defineProps({
  monedaOrigen: { type: String, required: true },
  monedaDestino: { type: String, required: true },
  titulo: { type: String, default: 'Evolución del par' },
  rango: { type: String, default: 'UltimoMes' },
})

const ancho = 560
const alto = 180

const cargando = ref(false)
const errorMessage = ref('')
const datosActuales = ref(null)
const serieRaw = ref([])
const indiceHover = ref(null)

watch([() => props.monedaOrigen, () => props.monedaDestino, () => props.rango], cargar)
onMounted(cargar)

async function cargar() {
  cargando.value = true
  errorMessage.value = ''

  try {
    const { data } = await getSerieHistorica(props.monedaOrigen, props.monedaDestino, props.rango)
    datosActuales.value = data
    serieRaw.value = (data?.serie || []).filter(
      (p) => Number.isFinite(Number(p.mayorPrecioCompra)) && Number.isFinite(Number(p.menorPrecioVenta)),
    )
  } catch {
    errorMessage.value = 'No se pudo cargar el gráfico de este par.'
    datosActuales.value = null
    serieRaw.value = []
  } finally {
    cargando.value = false
  }
}

const puntos = computed(() => {
  if (serieRaw.value.length < 2) return []

  const compras = serieRaw.value.map((p) => Number(p.mayorPrecioCompra))
  const ventas = serieRaw.value.map((p) => Number(p.menorPrecioVenta))
  const min = Math.min(...compras, ...ventas)
  const max = Math.max(...compras, ...ventas)
  const rangoValores = max - min || 1

  return serieRaw.value.map((p, i) => {
    const x = (i / (serieRaw.value.length - 1)) * ancho
    const compraY = alto - ((Number(p.mayorPrecioCompra) - min) / rangoValores) * (alto - 20) - 10
    const ventaY = alto - ((Number(p.menorPrecioVenta) - min) / rangoValores) * (alto - 20) - 10

    return {
      x,
      compraY,
      ventaY,
      fechaHora: p.fechaHora,
      mayorPrecioCompra: Number(p.mayorPrecioCompra),
      menorPrecioVenta: Number(p.menorPrecioVenta),
      margen: Number(p.margen),
    }
  })
})

const lineaCompra = computed(() => puntos.value.map((p) => `${p.x},${p.compraY}`).join(' '))
const lineaVenta = computed(() => puntos.value.map((p) => `${p.x},${p.ventaY}`).join(' '))
const lineasGuia = [alto * 0.25, alto * 0.5, alto * 0.75]

const indiceSeleccionado = computed(() => {
  if (indiceHover.value !== null) return indiceHover.value
  return puntos.value.length ? puntos.value.length - 1 : null
})

const puntoActual = computed(() => {
  if (indiceSeleccionado.value !== null) return puntos.value[indiceSeleccionado.value]

  return {
    mayorPrecioCompra: datosActuales.value?.mayorPrecioCompraActual ?? null,
    menorPrecioVenta: datosActuales.value?.menorPrecioVentaActual ?? null,
    margen: datosActuales.value?.margenActual ?? null,
    fechaHora: null,
  }
})

function onMouseMove(evento) {
  if (!puntos.value.length) return

  const rect = evento.currentTarget.getBoundingClientRect()
  const xRelativo = ((evento.clientX - rect.left) / rect.width) * ancho

  let masCercano = 0
  let distanciaMinima = Infinity

  puntos.value.forEach((p, i) => {
    const distancia = Math.abs(p.x - xRelativo)
    if (distancia < distanciaMinima) {
      distanciaMinima = distancia
      masCercano = i
    }
  })

  indiceHover.value = masCercano
}

function onMouseLeave() {
  indiceHover.value = null
}
</script>

<style scoped>
.xc-chart-card {
  padding: 24px;
}

.xc-chart-svg {
  width: 100%;
  height: 180px;
  display: block;
  cursor: crosshair;
}

.xc-chart-grid {
  stroke: var(--xchang-border);
  stroke-width: 1;
}

.xc-chart-line {
  fill: none;
  stroke-width: 2.5;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.xc-chart-crosshair {
  stroke: var(--xchang-text-secondary);
  stroke-width: 1;
  stroke-dasharray: 3 3;
  opacity: 0.6;
}

.xc-chart-dot {
  fill: currentColor;
}

.xc-chart-skeleton {
  border-radius: var(--xchang-radius-md);
  overflow: hidden;
}

.xc-chart-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.xc-chart-stat-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--xchang-text-secondary);
  font-weight: 600;
}

.xc-chart-stat-valor {
  font-size: 1.2rem;
  font-weight: 800;
  margin-top: 4px;
  color: var(--xchang-page-text);
}

@media (max-width: 599px) {
  .xc-chart-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
