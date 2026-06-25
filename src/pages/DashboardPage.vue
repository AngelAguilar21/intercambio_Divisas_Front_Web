<template>
  <q-page class="q-pa-md xc-dashboard">
    <div class="xc-block-accent xc-hero xc-enter" style="--xc-delay: 0ms">
      <div class="row items-center justify-between">
        <div>
          <div class="text-h5 text-weight-bold">Hola, {{ authStore.user?.nombreUsuario }}</div>
          <div class="text-body2 xc-hero-sub">Este es el resumen de tu cuenta en X-Chang</div>
        </div>
        <q-badge :color="authStore.isAdmin ? 'deep-orange' : 'white'" class="xc-rol-badge">
          {{ authStore.user?.rol }}
        </q-badge>
      </div>
    </div>

    <div class="q-mt-md">
      <ResumenCuenta />
    </div>

    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-lg-5">
        <ModuloCambio @cambio-confirmado="onCambioConfirmado" />
      </div>
      <div class="col-12 col-lg-7">
        <PrecioParChart moneda-origen="USD" moneda-destino="PEN" titulo="Evolución USD/PEN" />
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
import ResumenCuenta from '@/components/dashboard/ResumenCuenta.vue'
import ModuloCambio from '@/components/dashboard/ModuloCambio.vue'
import HistorialReciente from '@/components/dashboard/HistorialReciente.vue'
import PrecioParChart from '@/components/home/PrecioParChart.vue'

const authStore = useAuthStore()
const historialRef = ref(null)

onMounted(() => {
  authStore.fetchProfile()
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
