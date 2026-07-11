<template>
  <q-page class="q-pa-md xc-dashboard">
    <div :class="['xc-block-accent', 'xc-hero', 'xc-enter', { 'xc-hero--restricted': authStore.isRestricted }]" style="--xc-delay: 0ms">
      <div class="row items-center justify-between">
        <div>
          <div class="text-h5 text-weight-bold">Hola, {{ authStore.user?.nombreUsuario }}</div>
          <div v-if="authStore.isRestricted" class="text-body2 xc-hero-sub">Tu cuenta está restringida. Puedes consultar información y retirar fondos, pero no puedes operar en el exchange.</div>
          <div v-else class="text-body2 xc-hero-sub">Este es el resumen de tu cuenta en X-Chang</div>
        </div>
        <q-badge :color="authStore.isRestricted ? 'negative' : (authStore.isAdmin ? 'deep-orange' : 'white')" class="xc-rol-badge">
          {{ authStore.user?.rol }}
        </q-badge>
      </div>
    </div>

    <div class="q-mt-md">
      <ResumenCuenta />
    </div>

    <div v-if="cargandoGraficos" class="flex flex-center q-py-lg">
      <q-spinner size="lg" color="primary" />
    </div>

    <q-banner v-else-if="errorGraficos" dense rounded class="xchang-banner xchang-banner--error q-mt-md">
      {{ errorGraficos }}
    </q-banner>

    <div v-else-if="parPrincipal" class="row q-col-gutter-md q-mt-md">
      <div :class="parSecundario ? 'col-12 col-lg-6' : 'col-12'">
        <q-card flat bordered class="q-pa-md">
          <div class="row items-center justify-between q-mb-sm q-col-gutter-sm">
            <div class="text-subtitle1 text-weight-medium">
              {{ parPrincipal.monedaOrigen }} / {{ parPrincipal.monedaDestino }}
            </div>
            <q-select
              v-model="rangoPrincipal"
              dense
              outlined
              style="width: 180px"
              :options="RANGO_OPTIONS"
              label="Rango"
              emit-value
              map-options
            />
          </div>
          <GraficoPar
            :origen="parPrincipal.monedaOrigen"
            :destino="parPrincipal.monedaDestino"
            :rango="rangoPrincipal"
            :auto-refresh="true"
            @rango-fallback="rangoPrincipal = $event"
          />
        </q-card>
      </div>

      <div v-if="parSecundario" class="col-12 col-lg-6">
        <q-card flat bordered class="q-pa-md">
          <div class="row items-center justify-between q-mb-sm q-col-gutter-sm">
            <div class="text-subtitle1 text-weight-medium">
              {{ parSecundario.monedaOrigen }} / {{ parSecundario.monedaDestino }}
            </div>
            <q-select
              v-model="rangoSecundario"
              dense
              outlined
              style="width: 180px"
              :options="RANGO_OPTIONS"
              label="Rango"
              emit-value
              map-options
            />
          </div>
          <GraficoPar
            :origen="parSecundario.monedaOrigen"
            :destino="parSecundario.monedaDestino"
            :rango="rangoSecundario"
            :auto-refresh="true"
            @rango-fallback="rangoSecundario = $event"
          />
        </q-card>
      </div>
    </div>


    <div class="q-mt-md">
      <HistorialReciente ref="historialRef" />
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import GraficoPar from '@/components/graficos/GraficoPar.vue'
import ResumenCuenta from '@/components/dashboard/ResumenCuenta.vue'
import HistorialReciente from '@/components/dashboard/HistorialReciente.vue'
import { getMenuPrincipal } from '@/services/preciosPares'
import { RANGO_OPTIONS } from '@/utils/validaciones'

const authStore = useAuthStore()
const historialRef = ref(null)

const cargandoGraficos = ref(false)
const errorGraficos = ref('')
const parPrincipal = ref(null)
const parSecundario = ref(null)
const rangoPrincipal = ref('UltimoDia')
const rangoSecundario = ref('UltimoDia')

function normalizarGraficoSecundario(principal, secundario) {
  if (!principal || !secundario) return secundario

  const mismoPar =
    principal.monedaOrigen === secundario.monedaOrigen &&
    principal.monedaDestino === secundario.monedaDestino

  if (!mismoPar) return secundario

  return {
    ...secundario,
    monedaOrigen: principal.monedaDestino,
    monedaDestino: principal.monedaOrigen,
  }
}

onMounted(async () => {
  authStore.fetchProfile()

  cargandoGraficos.value = true
  try {
    const { data } = await getMenuPrincipal()
    const principal = data.graficoPrincipal ?? data.GraficoPrincipal ?? null
    const secundario = data.graficoSecundario ?? data.GraficoSecundario ?? null

    parPrincipal.value = principal
    parSecundario.value = normalizarGraficoSecundario(principal, secundario)
  } catch {
    errorGraficos.value = 'No se pudo cargar la información de gráficos.'
  } finally {
    cargandoGraficos.value = false
  }
})

</script>

<style scoped>
.xc-dashboard {
  max-width: 1180px;
  margin: 0 auto;
}

.xc-hero {
  padding: 24px;
}

.xc-hero-sub {
  opacity: 0.85;
}

.xc-hero--restricted {
  background: linear-gradient(135deg, #b91c1c, #7f1d1d) !important;
  border-color: rgba(248, 113, 113, 0.55) !important;
}

.xc-hero--restricted .xc-rol-badge {
  color: white;
}

.xc-rol-badge {
  padding: 4px 14px;
  border-radius: 100px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--xchang-blue-dark);
}
</style>
