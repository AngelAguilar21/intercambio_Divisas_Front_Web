<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Mi billetera</div>

    <q-card flat bordered class="q-pa-md">
      <q-table
        :rows="billetera?.saldos || []"
        :columns="columnas"
        row-key="monedaId"
        :loading="cargando"
        flat
        hide-pagination
        :rows-per-page-options="[0]"
      />
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getBilletera } from '@/services/billetera'

const billetera = ref(null)
const cargando = ref(false)

const columnas = [
  { name: 'codigoISO', label: 'Moneda', field: 'codigoISO', align: 'left' },
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left' },
  { name: 'saldoDisponible', label: 'Saldo disponible', field: 'saldoDisponible', align: 'right' },
]

onMounted(async () => {
  cargando.value = true
  try {
    const { data } = await getBilletera()
    billetera.value = data
  } finally {
    cargando.value = false
  }
})
</script>
