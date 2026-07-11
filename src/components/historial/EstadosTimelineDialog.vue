<template>
  <q-dialog v-model="abierto" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="xc-timeline-card">
      <q-card-section class="row items-center q-pb-none xc-timeline-header">
        <div>
          <div class="text-caption xc-text-secondary text-uppercase letter-spacing-wide">
            Auditoría de estados
          </div>
          <div class="text-h6 text-weight-bold q-mt-xs">
            {{ tituloDialog }}
          </div>
          <div class="text-caption xc-text-secondary q-mt-xs">ID #{{ props.referenciaId }}</div>
        </div>
        <q-space />
        <q-btn flat round dense icon="close" @click="abierto = false" />
      </q-card-section>

      <q-separator />

      <q-card-section class="xc-timeline-body">
        <div v-if="cargando" class="text-center q-pa-xl">
          <q-spinner size="36px" color="primary" />
          <div class="text-caption xc-text-secondary q-mt-sm">Cargando historial de estados...</div>
        </div>

        <div v-else-if="error" class="text-center q-pa-xl">
          <q-icon name="error_outline" size="40px" color="negative" />
          <div class="text-caption text-negative q-mt-sm">{{ error }}</div>
        </div>

        <div v-else-if="pasos.length === 0" class="text-center q-pa-xl">
          <q-icon name="history_toggle_off" size="40px" color="grey-5" />
          <div class="text-caption xc-text-secondary q-mt-sm">
            Sin registros de estados. Los nuevos cambios de estado aparecerán aquí.
          </div>
        </div>

        <div v-else class="xc-timeline">
          <div
            v-for="(paso, i) in pasos"
            :key="paso.logId"
            class="xc-timeline-step"
            :class="{ 'xc-timeline-step--last': i === pasos.length - 1 }"
            :style="{ '--delay': `${i * 80}ms` }"
          >
            <div class="xc-timeline-left">
              <div
                class="xc-timeline-dot"
                :class="`xc-timeline-dot--${colorEstado(paso.estadoNuevo)}`"
              >
                <q-icon :name="iconoEstado(paso.estadoNuevo)" size="16px" color="white" />
              </div>
              <div v-if="i < pasos.length - 1" class="xc-timeline-line" />
            </div>

            <div class="xc-timeline-content">
              <div class="row items-center q-gutter-xs q-mb-xs">
                <q-badge
                  :color="colorEstado(paso.estadoNuevo)"
                  :label="paso.estadoNuevo"
                  class="xc-estado-badge"
                />
                <q-icon
                  v-if="paso.estadoAnterior"
                  name="arrow_back"
                  size="12px"
                  class="xc-text-secondary"
                  style="transform: scaleX(-1)"
                />
                <span v-if="paso.estadoAnterior" class="text-caption xc-text-secondary xc-estado-anterior">
                  desde {{ paso.estadoAnterior }}
                </span>
              </div>

              <div class="text-caption xc-text-secondary q-mb-xs">
                <q-icon name="schedule" size="12px" class="q-mr-xs" />
                {{ fmtFecha(paso.fechaCambio) }}
              </div>

              <div v-if="paso.motivo" class="text-caption xc-timeline-motivo">
                {{ paso.motivo }}
                <span v-if="paso.cantidadAfectada" class="text-weight-medium">
                  &mdash; {{ fmtNum(paso.cantidadAfectada) }}
                </span>
              </div>

              <div v-if="i < pasos.length - 1" class="xc-timeline-delta text-caption xc-text-secondary">
                <q-icon name="more_vert" size="10px" />
                {{ deltaTiempo(paso.fechaCambio, pasos[i + 1].fechaCambio) }}
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { getEstadosOperacion } from '@/services/historial'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  tipo: { type: String, required: true },
  referenciaId: { type: Number, required: true },
})
const emit = defineEmits(['update:modelValue'])

const abierto = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const pasos = ref([])
const cargando = ref(false)
const error = ref('')

const tituloDialog = computed(() =>
  props.tipo === 'OrdenCompra' ? 'Historial de estados — Orden de compra' : 'Historial de estados — Oferta de venta',
)

watch(
  () => props.modelValue,
  (val) => {
    if (val) cargar()
  },
)

async function cargar() {
  cargando.value = true
  error.value = ''
  pasos.value = []
  try {
    const { data } = await getEstadosOperacion(props.tipo, props.referenciaId)
    pasos.value = data
  } catch {
    error.value = 'No se pudo cargar el historial de estados.'
  } finally {
    cargando.value = false
  }
}

const COLORES = {
  Activa: 'info',
  'Parcialmente ejecutada': 'warning',
  Completada: 'positive',
  Cancelada: 'negative',
}
const ICONOS = {
  Activa: 'radio_button_checked',
  'Parcialmente ejecutada': 'timelapse',
  Completada: 'check_circle',
  Cancelada: 'cancel',
}

function colorEstado(e) {
  return COLORES[e] ?? 'grey'
}
function iconoEstado(e) {
  return ICONOS[e] ?? 'circle'
}

function fmtFecha(f) {
  return f ? new Date(f).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'medium' }) : '-'
}
function fmtNum(v) {
  return Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}
function deltaTiempo(a, b) {
  const ms = new Date(b) - new Date(a)
  if (ms < 0) return ''
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}min`
}
</script>

<style scoped>
.xc-timeline-card {
  max-width: 520px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background: var(--xchang-bg);
  color: var(--xchang-page-text);
}

.xc-timeline-header {
  padding: 20px 24px 16px;
}

.xc-timeline-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.xc-timeline {
  position: relative;
}

.xc-timeline-step {
  display: flex;
  gap: 16px;
  opacity: 0;
  transform: translateX(16px);
  animation: tlFadeIn 0.35s ease forwards;
  animation-delay: var(--delay, 0ms);
}

@keyframes tlFadeIn {
  to { opacity: 1; transform: translateX(0); }
}

.xc-timeline-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.xc-timeline-dot {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
}

.xc-timeline-dot--info     { background: var(--q-info); }
.xc-timeline-dot--warning  { background: var(--q-warning); }
.xc-timeline-dot--positive { background: var(--q-positive); }
.xc-timeline-dot--negative { background: var(--q-negative); }
.xc-timeline-dot--grey     { background: #9e9e9e; }

.xc-timeline-line {
  width: 2px;
  flex: 1;
  min-height: 20px;
  background: linear-gradient(to bottom, var(--xchang-border), transparent);
  margin: 4px 0;
}

.xc-timeline-content {
  padding-bottom: 28px;
  flex: 1;
  min-width: 0;
}

.xc-timeline-step--last .xc-timeline-content {
  padding-bottom: 0;
}

.xc-estado-badge {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  padding: 3px 10px;
  border-radius: 20px;
}

.xc-estado-anterior {
  font-size: 0.72rem;
  opacity: 0.7;
}

.xc-timeline-motivo {
  background: color-mix(in srgb, var(--xchang-surface) 70%, transparent);
  border-left: 3px solid var(--xchang-border);
  padding: 4px 10px;
  border-radius: 0 4px 4px 0;
  margin-top: 6px;
  font-size: 0.8rem;
}

.xc-timeline-delta {
  margin-top: 4px;
  opacity: 0.55;
  font-size: 0.72rem;
}

.letter-spacing-wide { letter-spacing: 0.08em; }
</style>
