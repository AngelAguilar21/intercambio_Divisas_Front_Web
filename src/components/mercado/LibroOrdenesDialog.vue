<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 500px; max-width: 700px">
      <q-card-section class="text-h6">Libro de órdenes: {{ par }}</q-card-section>

      <q-card-section v-if="loading" class="text-center">
        <q-spinner color="primary" size="32px" />
      </q-card-section>

      <q-card-section v-else class="row q-col-gutter-md">
        <div class="col-6">
          <div class="text-subtitle2 text-positive q-mb-sm">Compras (órdenes)</div>
          <q-markup-table dense flat>
            <thead>
              <tr>
                <th class="text-left">Precio</th>
                <th class="text-right">Cantidad</th>
                <th class="text-left">Vigente hasta</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in detalle?.compras" :key="item.id">
                <td class="text-left">{{ item.precioUnitario }}</td>
                <td class="text-right">{{ item.cantidad }}</td>
                <td class="text-left">{{ item.fechaExpiracion ? new Date(item.fechaExpiracion).toLocaleString() : '-' }}</td>
              </tr>
              <tr v-if="!detalle?.compras?.length">
                <td colspan="3" class="text-center text-grey">Sin órdenes activas</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>

        <div class="col-6">
          <div class="text-subtitle2 text-negative q-mb-sm">Ventas (ofertas)</div>
          <q-markup-table dense flat>
            <thead>
              <tr>
                <th class="text-left">Precio</th>
                <th class="text-right">Cantidad</th>
                <th class="text-left">Vigente hasta</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in detalle?.ventas" :key="item.id">
                <td class="text-left">{{ item.precioUnitario }}</td>
                <td class="text-right">{{ item.cantidad }}</td>
                <td class="text-left">{{ item.fechaExpiracion ? new Date(item.fechaExpiracion).toLocaleString() : '-' }}</td>
              </tr>
              <tr v-if="!detalle?.ventas?.length">
                <td colspan="3" class="text-center text-grey">Sin ofertas activas</td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="Cerrar" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getLibroOrdenesDetalle } from '@/services/ordenes'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  parMonedaId: { type: Number, default: null },
  par: { type: String, default: '' },
})
defineEmits(['update:modelValue'])

const detalle = ref(null)
const loading = ref(false)

watch(
  () => props.modelValue,
  async (open) => {
    if (!open || !props.parMonedaId) return
    loading.value = true
    try {
      const { data } = await getLibroOrdenesDetalle(props.parMonedaId, 15)
      detalle.value = data
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)
</script>
