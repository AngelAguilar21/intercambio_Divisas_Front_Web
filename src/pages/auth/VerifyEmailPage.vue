<template>
  <div class="text-center">
    <div class="text-h6 q-mb-md">Verificación de correo</div>

    <q-spinner v-if="loading" color="primary" size="40px" />

    <q-banner v-else-if="errorMessage" dense class="bg-red-1 text-red-9" rounded>
      {{ errorMessage }}
    </q-banner>

    <q-banner v-else dense class="bg-green-1 text-green-9" rounded>
      {{ successMessage }}
    </q-banner>

    <div class="q-mt-md">
      <router-link :to="{ name: 'login' }" class="text-primary">Ir a iniciar sesión</router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { verificarCorreo } from '@/services/auth'

const route = useRoute()
const loading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(async () => {
  const token = route.query.token
  if (!token) {
    errorMessage.value = 'Enlace de verificación inválido.'
    loading.value = false
    return
  }
  try {
    const { data } = await verificarCorreo(token)
    successMessage.value = data.mensaje
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo verificar el correo.'
  } finally {
    loading.value = false
  }
})
</script>
