<template>
  <q-page class="q-pa-md">
    <div class="xc-page-head">
      <span class="xc-section-kicker"><q-icon name="admin_panel_settings" size="14px" /> Administración</span>
      <h1 class="xc-section-title">Visión general de operaciones</h1>
      <div class="xc-section-bar" aria-hidden="true" />
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div v-for="card in cards" :key="card.label" class="col-12 col-sm-6 col-md-3">
        <q-card flat bordered class="q-pa-md xc-card-accent">
          <div class="text-caption xc-text-secondary">{{ card.label }}</div>
          <div class="text-h5 text-weight-bold">{{ card.value }}</div>
        </q-card>
      </div>
    </div>

    <q-card flat bordered class="q-pa-md xc-card-accent">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">Volumen del día por moneda</div>
      <q-table :rows="resumen.volumenDiaPorMoneda || []" :columns="columnas" row-key="monedaId" :loading="cargando" flat />
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { getResumen } from '@/services/panelAdministrativo'

const cargando = ref(false)
const resumen = ref({})
const columnas = [
  { name: 'codigoISO', label: 'Moneda', field: 'codigoISO', align: 'left' },
  { name: 'volumen', label: 'Volumen', field: 'volumen', align: 'right' },
]
const cards = computed(() => [
  { label: 'Usuarios', value: resumen.value.totalUsuarios ?? 0 },
  { label: 'Órdenes activas', value: resumen.value.ordenesActivas ?? 0 },
  { label: 'Ofertas activas', value: resumen.value.ofertasActivas ?? 0 },
  { label: 'Transacciones del día', value: resumen.value.transaccionesDia ?? 0 },
])

onMounted(async () => {
  cargando.value = true
  try { resumen.value = (await getResumen()).data } finally { cargando.value = false }
})
</script>
