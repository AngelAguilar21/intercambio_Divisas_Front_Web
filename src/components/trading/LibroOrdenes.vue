<template>
  <q-card flat bordered class="q-pa-md">
    <div class="row items-center justify-between q-mb-sm">
      <div class="text-subtitle1 text-weight-medium">Libro de órdenes</div>
      <q-btn flat dense round icon="refresh" size="sm" color="primary" :loading="cargando" @click="cargar" />
    </div>

    <q-banner v-if="error" dense rounded class="xchang-banner xchang-banner--error q-mb-sm">
      {{ error }}
    </q-banner>

    <!-- Órdenes de compra -->
    <div class="text-caption text-weight-bold text-uppercase text-blue-8 q-mb-xs">
      Órdenes de compra
    </div>

    <div v-if="cargando" class="flex flex-center q-py-sm">
      <q-spinner color="primary" size="xs" />
    </div>
    <template v-else>
      <div v-if="!libro?.ordenesCompra?.length" class="text-body2 xc-libro-vacio q-py-sm">
        No existen órdenes de compra activas
      </div>
      <template v-else>
        <div class="row xc-libro-header text-caption text-grey-7 q-py-xs">
          <div class="col">Cantidad ({{ monedaDestino }})</div>
          <div class="col-auto q-px-sm text-right">Precio unitario</div>
          <div class="col-auto text-right" style="min-width:90px">Fecha</div>
        </div>
        <div
          v-for="o in libro.ordenesCompra"
          :key="o.id"
          class="row xc-libro-fila text-body2 q-py-xs"
        >
          <div class="col xc-figure">{{ formatNum(o.cantidad) }}</div>
          <div class="col-auto q-px-sm text-right xc-figure text-positive">{{ formatNum(o.precioUnitario) }}</div>
          <div class="col-auto text-right text-grey-6" style="min-width:90px; font-size:11px">
            {{ formatFecha(o.fechaCreacion) }}
          </div>
        </div>
        <q-btn
          v-if="!verTodasOrdenes && libro.ordenesCompra.length >= 10"
          flat
          dense
          size="sm"
          color="primary"
          label="Ver más"
          class="q-mt-xs"
          @click="verTodasOrdenes = true; cargar()"
        />
      </template>
    </template>

    <q-separator class="q-my-sm" />

    <!-- Ofertas de venta -->
    <div class="text-caption text-weight-bold text-uppercase text-red-8 q-mb-xs">
      Ofertas de venta
    </div>

    <div v-if="cargando" class="flex flex-center q-py-sm">
      <q-spinner color="primary" size="xs" />
    </div>
    <template v-else>
      <div v-if="!libro?.ofertasVenta?.length" class="text-body2 xc-libro-vacio q-py-sm">
        No existen ofertas de venta activas
      </div>
      <template v-else>
        <div class="row xc-libro-header text-caption text-grey-7 q-py-xs">
          <div class="col">Cantidad ({{ monedaDestino }})</div>
          <div class="col-auto q-px-sm text-right">Precio unitario</div>
          <div class="col-auto text-right" style="min-width:90px">Fecha</div>
        </div>
        <div
          v-for="o in libro.ofertasVenta"
          :key="o.id"
          class="row xc-libro-fila text-body2 q-py-xs"
        >
          <div class="col xc-figure">{{ formatNum(o.cantidad) }}</div>
          <div class="col-auto q-px-sm text-right xc-figure text-negative">{{ formatNum(o.precioUnitario) }}</div>
          <div class="col-auto text-right text-grey-6" style="min-width:90px; font-size:11px">
            {{ formatFecha(o.fechaCreacion) }}
          </div>
        </div>
        <q-btn
          v-if="!verTodasOfertas && libro.ofertasVenta.length >= 10"
          flat
          dense
          size="sm"
          color="primary"
          label="Ver más"
          class="q-mt-xs"
          @click="verTodasOfertas = true; cargar()"
        />
      </template>
    </template>
  </q-card>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { getLibroOrdenes } from '@/services/mercado'

const props = defineProps({
  parMonedaId: { type: Number, required: true },
  monedaOrigen: { type: String, required: true },
  monedaDestino: { type: String, required: true },
})

const emit = defineEmits(['libro-cargado'])

const libro = ref(null)
const cargando = ref(false)
const error = ref('')
const verTodasOrdenes = ref(false)
const verTodasOfertas = ref(false)

let intervalo = null

async function cargar() {
  if (!props.parMonedaId) return
  cargando.value = true
  error.value = ''
  try {
    const { data } = await getLibroOrdenes(props.parMonedaId, {
      verTodasOrdenes: verTodasOrdenes.value,
      verTodasOfertas: verTodasOfertas.value,
    })
    libro.value = data
    emit('libro-cargado', data)
  } catch {
    error.value = 'No se pudo cargar el libro de órdenes.'
  } finally {
    cargando.value = false
  }
}

function formatNum(val) {
  if (val == null) return '-'
  return Number(val).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 8 })
}

function formatFecha(val) {
  if (!val) return '-'
  const d = new Date(val)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

watch(() => props.parMonedaId, () => {
  verTodasOrdenes.value = false
  verTodasOfertas.value = false
  cargar()
})

onMounted(() => {
  cargar()
  intervalo = setInterval(cargar, 30000)
})
onUnmounted(() => clearInterval(intervalo))

defineExpose({ cargar })
</script>

<style scoped>
.xc-libro-vacio {
  color: var(--xchang-text-secondary);
  font-style: italic;
}
.xc-libro-header {
  border-bottom: 1px solid var(--xchang-border);
}
.xc-libro-fila {
  border-bottom: 1px solid var(--xchang-border);
}
.xc-libro-fila:last-child {
  border-bottom: none;
}
</style>
