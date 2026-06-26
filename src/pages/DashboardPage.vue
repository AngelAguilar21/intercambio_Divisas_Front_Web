<template>
  <q-page class="q-pa-md xc-dashboard">

    <div class="xc-block-accent xc-hero xc-enter" style="--xc-delay: 0ms">
      <div class="row items-center justify-between">
        <div>
          <div class="text-h5 text-weight-bold">
            Hola, {{ authStore.user?.nombreUsuario }}
          </div>
          <div class="text-body2 xc-hero-sub">
            Este es el resumen de tu cuenta en X-Chang
          </div>
        </div>
        <q-badge
          :color="authStore.isAdmin ? 'deep-orange' : 'white'"
          class="xc-rol-badge"
        >
          {{ authStore.user?.rol }}
        </q-badge>
      </div>
    </div>

    <div class="q-mt-md">
      <ResumenCuenta />
    </div>

    <!-- Gráficos dinámicos según moneda principal del usuario (US-009) -->
    <div v-if="cargandoGraficos" class="flex flex-center q-py-lg">
      <q-spinner size="lg" color="primary" />
    </div>

    <q-banner
      v-else-if="errorGraficos"
      dense
      rounded
      class="xchang-banner xchang-banner--error q-mt-md"
    >
      {{ errorGraficos }}
    </q-banner>

    <div v-else-if="parPrincipal" class="row q-col-gutter-md q-mt-md">
      <div :class="parSecundario ? 'col-12 col-lg-6' : 'col-12'">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">
            {{ parPrincipal.monedaOrigen }} / {{ parPrincipal.monedaDestino }}
          </div>
          <GraficoPar
            :origen="parPrincipal.monedaOrigen"
            :destino="parPrincipal.monedaDestino"
            rango="UltimoDia"
            :auto-refresh="true"
          />
        </q-card>
      </div>

      <div v-if="parSecundario" class="col-12 col-lg-6">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 text-weight-medium q-mb-sm">
            {{ parSecundario.monedaOrigen }} / {{ parSecundario.monedaDestino }}
          </div>
          <GraficoPar
            :origen="parSecundario.monedaOrigen"
            :destino="parSecundario.monedaDestino"
            rango="UltimoDia"
            :auto-refresh="true"
          />
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12">
        <ModuloCambio @cambio-confirmado="onCambioConfirmado" />
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
import ModuloCambio from '@/components/dashboard/ModuloCambio.vue'
import HistorialReciente from '@/components/dashboard/HistorialReciente.vue'
import { getMenuPrincipal } from '@/services/preciosPares'

const authStore = useAuthStore()
const historialRef = ref(null)

const cargandoGraficos = ref(false)
const errorGraficos = ref('')
const parPrincipal = ref(null)
const parSecundario = ref(null)

onMounted(async () => {
  authStore.fetchProfile()

  cargandoGraficos.value = true
  try {
    const { data } = await getMenuPrincipal()
    parPrincipal.value = data.graficoPrincipal ?? data.GraficoPrincipal ?? null
    parSecundario.value = data.graficoSecundario ?? data.GraficoSecundario ?? null
  } catch {
    errorGraficos.value = 'No se pudo cargar la información de gráficos.'
  } finally {
    cargandoGraficos.value = false
  }
})

function onCambioConfirmado() {
  historialRef.value?.cargar?.()
}
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

.xc-rol-badge {
  padding: 4px 14px;
  border-radius: 100px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: var(--xchang-blue-dark);
}
</style>
