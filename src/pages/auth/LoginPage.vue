<template>
  <div>
    <div class="text-h4 text-weight-bold q-mb-lg">Te damos la bienvenida</div>

    <q-form class="q-gutter-lg" @submit.prevent="onSubmit">
      <q-input
        v-model="form.identificadorAcceso"
        name="identificadorAcceso"
        label="Usuario o correo electrónico"
        outlined
        stack-label
        lazy-rules
        :error="!!erroresServidor.identificadorAcceso"
        :error-message="erroresServidor.identificadorAcceso"
        :rules="[
          () =>
            validarIdentificador(form.identificadorAcceso) === true ||
            validarIdentificador(form.identificadorAcceso),
        ]"
        @update:model-value="erroresServidor.identificadorAcceso = ''"
      />

      <q-input
        v-model="form.password"
        name="password"
        label="Contraseña"
        outlined
        stack-label
        lazy-rules
        :type="showPassword ? 'text' : 'password'"
        :error="!!erroresServidor.password"
        :error-message="erroresServidor.password"
        :rules="[() => validarPassword(form.password) === true || validarPassword(form.password)]"
        @update:model-value="erroresServidor.password = ''"
      >
        <template #append>
          <q-icon
            :name="showPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>

      <q-banner v-if="errorMessage" dense class="xchang-banner xchang-banner--error" rounded>
        {{ errorMessage }}
      </q-banner>

      <q-btn
        type="submit"
        color="primary"
        label="Iniciar sesión"
        size="lg"
        class="full-width"
        unelevated
        :loading="loading"
        :disable="!formularioValido"
      />
    </q-form>

    <div class="text-center q-mt-lg">
      <router-link :to="{ name: 'forgot-password' }" class="xc-auth-link"
        >¿Olvidaste tu contraseña?</router-link
      >
    </div>
    <div class="text-center q-mt-sm">
      <router-link :to="{ name: 'register' }" class="xc-auth-link"
        >¿No tienes cuenta? Regístrate</router-link
      >
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ identificadorAcceso: '', password: '' })
const erroresServidor = reactive({ identificadorAcceso: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

function validarIdentificador(val) {
  if (!val || val.length < 2) return 'Mínimo 2 caracteres'
  if (val.length > 100) return 'Máximo 100 caracteres'
  return true
}

function validarPassword(val) {
  if (!val || val.length < 8) return 'Mínimo 8 caracteres'
  if (val.length > 50) return 'Máximo 50 caracteres'
  return true
}

const formularioValido = computed(() => {
  return (
    validarIdentificador(form.identificadorAcceso) === true &&
    validarPassword(form.password) === true &&
    !erroresServidor.identificadorAcceso &&
    !erroresServidor.password
  )
})

async function onSubmit() {
  if (!formularioValido.value) return

  loading.value = true
  errorMessage.value = ''
  erroresServidor.identificadorAcceso = ''
  erroresServidor.password = ''

  try {
    await authStore.login(form)
    router.push({ name: 'dashboard' })
  } catch (error) {
    const mensaje = error.response?.data?.mensaje || ''
    const mensajeNormalizado = mensaje.toLowerCase()

    if (mensajeNormalizado.includes('no registrado') || mensajeNormalizado.includes('no existe')) {
      erroresServidor.identificadorAcceso = 'Usuario o correo no registrado'
    } else if (mensajeNormalizado.includes('contraseña')) {
      erroresServidor.password = 'Contraseña incorrecta'
    } else {
      errorMessage.value = mensaje || 'No se pudo iniciar sesión.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.xc-auth-link {
  color: var(--q-primary);
  font-weight: 600;
  text-decoration: none;
}

.xc-auth-link:hover {
  text-decoration: underline;
}
</style>
