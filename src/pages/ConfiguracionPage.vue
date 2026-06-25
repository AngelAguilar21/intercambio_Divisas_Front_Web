<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Configuración</div>

    <q-card flat bordered class="q-pa-md">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">Tema visual</div>

      <div class="text-body2 text-grey-7 q-mb-md">
        Selecciona el tema de la aplicación. El cambio se aplica inmediatamente.
      </div>

      <q-select
        v-model="temaSeleccionado"
        label="Tema visual"
        outlined
        :options="temaOptions"
        :loading="cargando"
        :disable="guardando"
        @update:model-value="onCambiarTema"
      />

      <q-banner
        v-if="!authStore.isAuthenticated"
        dense
        class="bg-blue-1 text-blue-9 q-mt-md"
        rounded
      >
        No has iniciado sesión. El tema se aplicará solo localmente. Al iniciar sesión, se usará el
        tema guardado en tu cuenta.
      </q-banner>

      <q-banner v-if="successMessage" dense class="bg-green-1 text-green-9 q-mt-md" rounded>
        {{ successMessage }}
      </q-banner>

      <q-banner v-if="errorMessage" dense class="bg-red-1 text-red-9 q-mt-md" rounded>
        {{ errorMessage }}
      </q-banner>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const temaOptions = ['Claro', 'Oscuro']
const temaSeleccionado = ref(authStore.temaVisual || 'Claro')
const cargando = ref(false)
const guardando = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

onMounted(async () => {
  cargando.value = true
  errorMessage.value = ''

  try {
    const data = await authStore.cargarTemaVisualDesdeBackend()
    temaSeleccionado.value = data.temaVisual || data.TemaVisual || authStore.temaVisual
  } catch {
    temaSeleccionado.value = authStore.temaVisual
    errorMessage.value = 'No se pudo cargar el tema guardado. Se usará el tema local.'
  } finally {
    cargando.value = false
  }
})

async function onCambiarTema(valor) {
  guardando.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    await authStore.actualizarTemaVisual(valor)
    successMessage.value = authStore.isAuthenticated
      ? 'Tema visual guardado correctamente.'
      : 'Tema visual aplicado localmente.'
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo actualizar el tema visual.'
    temaSeleccionado.value = authStore.temaVisual
  } finally {
    guardando.value = false
  }
}
</script>
