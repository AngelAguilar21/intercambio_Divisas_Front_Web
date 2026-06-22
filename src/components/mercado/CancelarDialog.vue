<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 350px">
      <q-card-section class="text-h6"> Confirmar cancelación </q-card-section>

      <q-card-section v-if="loading" class="text-center">
        <q-spinner color="primary" size="32px" />
      </q-card-section>

      <q-card-section v-else-if="detalle">
        <q-list dense>
          <q-item>
            <q-item-section>Par</q-item-section>
            <q-item-section side>{{ detalle.par }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Cantidad pendiente</q-item-section>
            <q-item-section side>{{ detalle.cantidadPendiente }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Monto a reembolsar</q-item-section>
            <q-item-section side>{{ detalle.montoReembolso }} {{ detalle.monedaReembolso }}</q-item-section>
          </q-item>
        </q-list>

        <q-banner v-if="!detalle.puedeCancelar" dense class="bg-orange-1 text-orange-9 q-mt-sm" rounded>
          Esta operación ya no se puede cancelar.
        </q-banner>
      </q-card-section>

      <q-card-section v-if="errorMessage">
        <q-banner dense class="bg-red-1 text-red-9" rounded>
          {{ errorMessage }}
        </q-banner>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat label="Cerrar" />
        <q-btn
          v-if="detalle?.puedeCancelar"
          color="negative"
          label="Cancelar operación"
          :loading="confirming"
          @click="onConfirmar"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getDetalleCancelacion, confirmarCancelacion } from '@/services/cancelacion'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  tipoOperacion: { type: String, required: true },
  referenciaId: { type: Number, required: true },
})
const emit = defineEmits(['update:modelValue', 'cancelado'])

const detalle = ref(null)
const loading = ref(false)
const confirming = ref(false)
const errorMessage = ref('')

watch(
  () => props.modelValue,
  async (open) => {
    if (!open) return
    detalle.value = null
    errorMessage.value = ''
    loading.value = true
    try {
      const { data } = await getDetalleCancelacion(props.tipoOperacion, props.referenciaId)
      detalle.value = data
    } catch (error) {
      errorMessage.value = error.response?.data?.mensaje || 'No se pudo cargar el detalle.'
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

async function onConfirmar() {
  confirming.value = true
  errorMessage.value = ''
  try {
    const { data } = await confirmarCancelacion({
      tipoOperacion: props.tipoOperacion,
      referenciaId: props.referenciaId,
    })
    emit('cancelado', data)
    emit('update:modelValue', false)
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo cancelar la operación.'
  } finally {
    confirming.value = false
  }
}
</script>
