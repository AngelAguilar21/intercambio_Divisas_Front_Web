<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Configuración del sistema</div>

    <q-card flat bordered class="q-pa-md">
      <q-list bordered separator>
        <q-item v-for="c in configuraciones" :key="c.configuracionId">
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ c.clave }}</q-item-label>
            <q-item-label caption>{{ c.descripcion }}</q-item-label>
            <q-item-label caption
              >Actualizado: {{ new Date(c.fechaActualizacion).toLocaleString() }}</q-item-label
            >
          </q-item-section>
          <q-item-section>
            <q-input v-model="ediciones[c.clave]" dense outlined />
          </q-item-section>
          <q-item-section side>
            <q-btn
              color="primary"
              size="sm"
              label="Guardar"
              :loading="guardando === c.clave"
              @click="onGuardar(c)"
            />
          </q-item-section>
        </q-item>
      </q-list>
      <q-banner
        v-if="errorMessage"
        dense
        class="xchang-banner xchang-banner--error q-mt-md"
        rounded
        >{{ errorMessage }}</q-banner
      >
    </q-card>

    <q-dialog v-model="confirmando">
      <q-card style="min-width: 350px">
        <q-card-section class="text-h6">Confirmar cambio</q-card-section>
        <q-card-section>
          ¿Confirmas cambiar <strong>{{ pendiente?.clave }}</strong> a
          <strong>{{ pendiente?.nuevoValor }}</strong
          >?
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat label="Cancelar" />
          <q-btn color="primary" label="Confirmar" @click="confirmarGuardar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { getConfiguracion, actualizarConfiguracion } from '@/services/admin'

const configuraciones = ref([])
const ediciones = reactive({})
const guardando = ref(null)
const errorMessage = ref('')
const confirmando = ref(false)
const pendiente = ref(null)

async function cargar() {
  const { data } = await getConfiguracion()
  configuraciones.value = data
  data.forEach((c) => (ediciones[c.clave] = c.valor))
}

onMounted(cargar)

function onGuardar(c) {
  if (ediciones[c.clave] === c.valor) return
  pendiente.value = { clave: c.clave, nuevoValor: ediciones[c.clave] }
  confirmando.value = true
}

async function confirmarGuardar() {
  guardando.value = pendiente.value.clave
  errorMessage.value = ''
  try {
    await actualizarConfiguracion(pendiente.value.clave, pendiente.value.nuevoValor)
    Notify.create({ type: 'positive', message: 'Parámetro actualizado.' })
    await cargar()
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo actualizar el parámetro.'
  } finally {
    guardando.value = null
    confirmando.value = false
  }
}
</script>
