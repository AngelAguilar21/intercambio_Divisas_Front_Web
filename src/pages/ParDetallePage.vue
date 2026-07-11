<template>
  <q-page class="q-pa-md">

    <!-- Encabezado -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="row items-center q-gutter-sm">
          <div class="text-h5">Detalle del par</div>
          <ParMonedaChip :origen="monedaOrigen" :destino="monedaDestino" />
        </div>
        <div class="text-body2 text-grey-7">
          Gráfico histórico y operaciones para este par de monedas.
        </div>
      </div>
      <q-btn
        flat
        color="primary"
        icon="arrow_back"
        label="Volver a monedas"
        :to="{ name: 'monedas' }"
      />
    </div>

    <!-- Gráfico histórico (US-011) -->
    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-subtitle1 text-weight-medium">Gráfico histórico</div>
        <q-select
          v-model="rango"
          dense
          outlined
          style="width: 190px"
          :options="rangoOptions"
          label="Rango"
          emit-value
          map-options
        />
      </div>

      <GraficoPar
        :origen="monedaOrigen"
        :destino="monedaDestino"
        :rango="rango"
        :auto-refresh="true"
        @rango-fallback="rango = $event"
      />
    </q-card>

    <!-- Mensaje para usuario no autenticado -->
    <div v-if="!authStore.isAuthenticated" class="q-mb-md">
      <q-banner dense rounded class="xchang-banner xchang-banner--info">
        Inicia sesión para ver el libro de órdenes y realizar operaciones en este par.
      </q-banner>
    </div>

    <!-- Sección de operación (US-012 a US-016) — solo usuario autenticado -->
    <div v-if="authStore.isAuthenticated" class="row q-col-gutter-md">

      <!-- Columna izquierda: Generar orden de compra (US-013) + Venta inmediata (US-016) -->
      <div class="col-12 col-lg-4">
        <GenerarOrdenCompra
          :par-moneda-id="parMonedaId"
          :moneda-origen="monedaOrigen"
          :moneda-destino="monedaDestino"
          :precio-inicial-compra="precioInicialCompra"
          class="q-mb-md"
          @operacion-completada="onOperacionCompletada"
        />
        <VentaInmediata
          :par-moneda-id="parMonedaId"
          :moneda-origen="monedaOrigen"
          :moneda-destino="monedaDestino"
          @operacion-completada="onOperacionCompletada"
        />
      </div>

      <!-- Columna central: Libro de órdenes (US-012) -->
      <div class="col-12 col-lg-4">
        <LibroOrdenes
          :key="libroKey"
          ref="libroRef"
          :par-moneda-id="parMonedaId"
          :moneda-origen="monedaOrigen"
          :moneda-destino="monedaDestino"
          :refresh-key="libroRefreshKey"
          @libro-cargado="onLibroCargado"
        />
      </div>

      <!-- Columna derecha: Generar oferta de venta (US-014) + Compra inmediata (US-015) -->
      <div class="col-12 col-lg-4">
        <GenerarOfertaVenta
          :par-moneda-id="parMonedaId"
          :moneda-origen="monedaOrigen"
          :moneda-destino="monedaDestino"
          :precio-inicial-venta="precioInicialVenta"
          class="q-mb-md"
          @operacion-completada="onOperacionCompletada"
        />
        <CompraInmediata
          :par-moneda-id="parMonedaId"
          :moneda-origen="monedaOrigen"
          :moneda-destino="monedaDestino"
          @operacion-completada="onOperacionCompletada"
        />
      </div>

    </div>

  </q-page>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBilleteraStore } from '@/stores/billetera'
import ParMonedaChip from '@/components/common/ParMonedaChip.vue'
import GraficoPar from '@/components/graficos/GraficoPar.vue'
import LibroOrdenes from '@/components/trading/LibroOrdenes.vue'
import GenerarOrdenCompra from '@/components/trading/GenerarOrdenCompra.vue'
import GenerarOfertaVenta from '@/components/trading/GenerarOfertaVenta.vue'
import CompraInmediata from '@/components/trading/CompraInmediata.vue'
import VentaInmediata from '@/components/trading/VentaInmediata.vue'

const route = useRoute()
const authStore = useAuthStore()
const billeteraStore = useBilleteraStore()

const parMonedaId = computed(() => Number(route.params.parMonedaId))
const monedaOrigen = computed(() => String(route.query.origen || '').toUpperCase())
const monedaDestino = computed(() => String(route.query.destino || '').toUpperCase())

const rango = ref('UltimoDia')
const libroRef = ref(null)
const libroKey = ref(0)
const libroRefreshKey = ref(0)

// Precios del libro para inicializar US-013 y US-014
const precioInicialCompra = ref(null)
const precioInicialVenta = ref(null)

const rangoOptions = [
  { label: 'Último día', value: 'UltimoDia' },
  { label: 'Última semana', value: 'UltimaSemana' },
  { label: 'Último mes', value: 'UltimoMes' },
  { label: 'Último año', value: 'UltimoAno' },
  { label: 'Tiempo total', value: 'Total' },
]

// Cuando el libro se carga, extrae los precios iniciales para US-013 y US-014
function onLibroCargado(libro) {
  if (!libro) return
  const ordenes = libro.ordenesCompra ?? []
  const ofertas = libro.ofertasVenta ?? []
  precioInicialCompra.value = ordenes.length ? Number(ordenes[0].precioUnitario) : null
  precioInicialVenta.value = ofertas.length ? Number(ofertas[0].precioUnitario) : null
}

// Cuando cualquier operación se completa, refresca el libro y la billetera
async function onOperacionCompletada() {
  libroRefreshKey.value += 1
  libroKey.value += 1

  await nextTick()

  await libroRef.value?.cargar?.()
  setTimeout(() => libroRef.value?.cargar?.(), 350)
  billeteraStore.refrescar()
}
</script>
