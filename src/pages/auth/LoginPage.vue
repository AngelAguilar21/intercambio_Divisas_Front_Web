<template>
  <div>
    <div class="text-h6 q-mb-md">Iniciar sesión</div>

    <q-form class="q-gutter-md" @submit.prevent="onSubmit">
      <q-input
        v-model="form.identificadorAcceso"
        name="identificadorAcceso"
        label="Usuario o correo electrónico"
        outlined
        :rules="[(val) => !!val || 'Campo requerido']"
      />

      <q-input
        v-model="form.password"
        name="password"
        label="Contraseña"
        outlined
        :type="showPassword ? 'text' : 'password'"
        :rules="[(val) => !!val || 'Campo requerido']"
      >
        <template #append>
          <q-icon
            :name="showPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>

      <q-banner v-if="errorMessage" dense class="bg-red-1 text-red-9" rounded>
        {{ errorMessage }}
      </q-banner>

      <q-btn type="submit" color="primary" label="Ingresar" class="full-width" :loading="loading" />
    </q-form>

    <div class="text-center q-mt-md">
      <router-link :to="{ name: 'forgot-password' }" class="text-primary">¿Olvidaste tu contraseña?</router-link>
    </div>
    <div class="text-center q-mt-sm">
      <router-link :to="{ name: 'register' }" class="text-primary">¿No tienes cuenta? Regístrate</router-link>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ identificadorAcceso: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

async function onSubmit() {
  loading.value = true
  errorMessage.value = ''
  try {
    await authStore.login(form)
    router.push({ name: 'dashboard' })
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo iniciar sesión.'
  } finally {
    loading.value = false
  }
}
</script>
