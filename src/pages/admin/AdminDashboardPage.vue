<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5 col">Panel administrativo</div>
      <q-btn flat icon="refresh" label="Actualizar" @click="cargar" />
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div v-for="m in metricas" :key="m.label" class="col-6 col-md-3">
        <q-card flat bordered class="q-pa-md text-center">
          <div class="text-h4">{{ m.valor }}</div>
          <div class="text-caption text-grey-7">{{ m.label }}</div>
        </q-card>
      </div>
    </div>

    <q-card flat bordered class="q-pa-md">
      <div class="text-subtitle1 text-weight-medium q-mb-md">Volumen de operaciones (últimos 30 días)</div>
      <div class="row items-end" style="height: 160px; gap: 3px">
        <div
          v-for="v in dashboard?.volumenUltimos30Dias"
          :key="v.fecha"
          class="bg-primary"
          :style="{ width: '8px', height: barHeight(v.cantidadOperaciones) + 'px' }"
          :title="`${new Date(v.fecha).toLocaleDateString()}: ${v.cantidadOperaciones}`"
        />
        <div v-if="!dashboard?.volumenUltimos30Dias?.length" class="text-grey-7">Sin operaciones registradas.</div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getDashboard } from '@/services/admin'

const dashboard = ref(null)

const metricas = computed(() => {
  if (!dashboard.value) return []
  const d = dashboard.value
  return [
    { label: 'Usuarios registrados', valor: d.totalUsuarios },
    { label: 'Usuarios activos', valor: d.usuariosActivos },
    { label: 'Ofertas activas', valor: d.ofertasActivas },
    { label: 'Órdenes activas', valor: d.ordenesActivas },
    { label: 'Operaciones en curso', valor: d.operacionesEnCurso },
    { label: 'Operaciones completadas', valor: d.operacionesCompletadas },
    { label: 'Disputas abiertas', valor: d.disputasAbiertas },
    { label: 'Usuarios restringidos', valor: d.usuariosRestringidos },
  ]
})

const maxVolumen = computed(() =>
  Math.max(1, ...(dashboard.value?.volumenUltimos30Dias?.map((v) => v.cantidadOperaciones) || [1])),
)

function barHeight(cantidad) {
  return Math.max(4, (cantidad / maxVolumen.value) * 150)
}

async function cargar() {
  const { data } = await getDashboard()
  dashboard.value = data
}

onMounted(cargar)
</script>
