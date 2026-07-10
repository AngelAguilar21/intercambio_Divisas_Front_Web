<template>
  <div>
    <div class="text-h4 text-weight-bold q-mb-lg">Te damos la bienvenida</div>

    <q-form ref="formRef" class="q-gutter-lg" @submit.prevent="onSubmit">
      <q-input
        v-model.trim="form.identificadorAcceso"
        name="identificadorAcceso"
        label="Usuario o correo electrónico"
        outlined
        stack-label
        :error="!!erroresServidor.identificadorAcceso"
        :error-message="erroresServidor.identificadorAcceso"
        :rules="[validarIdentificadorAcceso]"
        @update:model-value="limpiarErrorCampo('identificadorAcceso')"
      />

      <q-input
        v-model="form.password"
        name="password"
        label="Contraseña"
        outlined
        stack-label
        :type="showPassword ? 'text' : 'password'"
        :error="!!erroresServidor.password"
        :error-message="erroresServidor.password"
        :rules="[validarPassword]"
        @update:model-value="limpiarErrorCampo('password')"
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
      <router-link :to="{ name: 'forgot-password' }" class="xc-auth-link">¿Olvidaste tu contraseña?</router-link>
    </div>
    <div class="text-center q-mt-sm">
      <router-link :to="{ name: 'register' }" class="xc-auth-link">¿No tienes cuenta? Regístrate</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { normalizarMensajeError, validarIdentificadorAcceso, validarPassword } from '@/utils/validaciones'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const form = reactive({ identificadorAcceso: '', password: '' })
const erroresServidor = reactive({ identificadorAcceso: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const formularioValido = computed(
  () =>
    validarIdentificadorAcceso(form.identificadorAcceso) === true &&
    validarPassword(form.password) === true &&
    !erroresServidor.identificadorAcceso &&
    !erroresServidor.password,
)

function limpiarErrorCampo(campo) {
  erroresServidor[campo] = ''
  errorMessage.value = ''
}

async function onSubmit() {
  errorMessage.value = ''
  erroresServidor.identificadorAcceso = ''
  erroresServidor.password = ''

  const valido = await formRef.value?.validate()
  if (!valido || !formularioValido.value) return

  loading.value = true
  try {
    await authStore.login({ ...form })
    router.push({ name: 'dashboard' })
  } catch (error) {
    const mensaje = normalizarMensajeError(error, 'Credenciales inválidas')
    const lower = mensaje.toLowerCase()

    if (lower.includes('no registrado') || lower.includes('no existe')) {
      erroresServidor.identificadorAcceso = 'Usuario o correo no registrado'
    } else if (lower.includes('contraseña incorrecta')) {
      erroresServidor.password = 'Contraseña incorrecta'
    } else {
      errorMessage.value = mensaje === 'Valor inválido' ? 'Credenciales inválidas' : mensaje
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
