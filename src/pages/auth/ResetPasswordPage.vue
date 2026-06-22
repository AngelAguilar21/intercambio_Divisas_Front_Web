<template>
  <div>
    <div class="text-h6 q-mb-md">Restablecer contraseña</div>

    <template v-if="!token">
      <q-banner dense class="bg-red-1 text-red-9" rounded>
        El enlace no es válido. Solicita uno nuevo.
      </q-banner>
    </template>

    <q-form v-else class="q-gutter-md" @submit.prevent="onSubmit">
      <q-input
        v-model="form.nuevaPassword"
        name="nuevaPassword"
        label="Nueva contraseña"
        outlined
        :type="showPassword ? 'text' : 'password'"
        hint="Mínimo 8 caracteres, una mayúscula, un número y un carácter especial"
        :rules="[(val) => passwordPattern.test(val) || 'No cumple los requisitos de seguridad']"
      >
        <template #append>
          <q-icon
            :name="showPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>

      <q-input
        v-model="form.confirmarPassword"
        name="confirmarPassword"
        label="Confirmar nueva contraseña"
        outlined
        :type="showPassword ? 'text' : 'password'"
        :rules="[(val) => val === form.nuevaPassword || 'Las contraseñas no coinciden']"
      />

      <q-banner v-if="errorMessage" dense class="bg-red-1 text-red-9" rounded>
        {{ errorMessage }}
      </q-banner>

      <q-banner v-if="successMessage" dense class="bg-green-1 text-green-9" rounded>
        {{ successMessage }}
      </q-banner>

      <q-btn type="submit" color="primary" label="Restablecer" class="full-width" :loading="loading" />
    </q-form>

    <div class="text-center q-mt-md">
      <router-link :to="{ name: 'login' }" class="text-primary">Volver a iniciar sesión</router-link>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { resetPassword } from '@/services/auth'

const route = useRoute()
const router = useRouter()

const token = route.query.token || ''
const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,50}$/

const form = reactive({ nuevaPassword: '', confirmarPassword: '' })
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function onSubmit() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await resetPassword({ token, ...form })
    successMessage.value = data.mensaje
    setTimeout(() => router.push({ name: 'login' }), 2000)
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo restablecer la contraseña.'
  } finally {
    loading.value = false
  }
}
</script>
