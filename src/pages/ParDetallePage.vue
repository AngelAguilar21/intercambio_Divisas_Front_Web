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
        <GenerarOrdenCompraStub
          :par-moneda-id="parMonedaId"
          :moneda-origen="monedaOrigen"
          :moneda-destino="monedaDestino"
          class="q-mb-md"
        />
        <VentaInmediataStub
          :par-moneda-id="parMonedaId"
          :moneda-origen="monedaOrigen"
          :moneda-destino="monedaDestino"
        />
      </div>

      <!-- Columna central: Libro de órdenes (US-012) -->
      <div class="col-12 col-lg-4">
        <LibroOrdenesStub
          :par-moneda-id="parMonedaId"
          :moneda-origen="monedaOrigen"
          :moneda-destino="monedaDestino"
        />
      </div>

      <!-- Columna derecha: Generar oferta de venta (US-014) + Compra inmediata (US-015) -->
      <div class="col-12 col-lg-4">
        <GenerarOfertaVentaStub
          :par-moneda-id="parMonedaId"
          :moneda-origen="monedaOrigen"
          :moneda-destino="monedaDestino"
          class="q-mb-md"
        />
        <CompraInmediataStub
          :par-moneda-id="parMonedaId"
          :moneda-origen="monedaOrigen"
          :moneda-destino="monedaDestino"
        />
      </div>

    </div>

  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ParMonedaChip from '@/components/common/ParMonedaChip.vue'
import GraficoPar from '@/components/graficos/GraficoPar.vue'
import LibroOrdenesStub from '@/components/trading/LibroOrdenesStub.vue'
import GenerarOrdenCompraStub from '@/components/trading/GenerarOrdenCompraStub.vue'
import GenerarOfertaVentaStub from '@/components/trading/GenerarOfertaVentaStub.vue'
import CompraInmediataStub from '@/components/trading/CompraInmediataStub.vue'
import VentaInmediataStub from '@/components/trading/VentaInmediataStub.vue'

const route = useRoute()
const authStore = useAuthStore()

const parMonedaId = computed(() => Number(route.params.parMonedaId))
const monedaOrigen = computed(() => String(route.query.origen || '').toUpperCase())
const monedaDestino = computed(() => String(route.query.destino || '').toUpperCase())

const rango = ref('UltimoDia')

const rangoOptions = [
  { label: 'Último día', value: 'UltimoDia' },
  { label: 'Última semana', value: 'UltimaSemana' },
  { label: 'Último mes', value: 'UltimoMes' },
  { label: 'Último año', value: 'UltimoAno' },
  { label: 'Tiempo total', value: 'Total' },
]
</script>
