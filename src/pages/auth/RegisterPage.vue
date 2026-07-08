<template>
  <div>
    <div class="text-h4 text-weight-bold q-mb-lg">Crea tu cuenta</div>

    <q-form class="q-gutter-lg" @submit.prevent="onSubmit">
      <q-input v-model="form.nombreUsuario" label="Nombre de usuario" outlined stack-label lazy-rules :rules="[validarNombreUsuario]" />
      <q-input v-model="form.correoElectronico" label="Correo electrónico" type="email" outlined stack-label lazy-rules :rules="[validarCorreo]" />
      <q-select v-model="form.paisId" label="País de residencia" outlined stack-label lazy-rules :options="paisOptions" :loading="cargandoPaises" emit-value map-options :rules="[validarPais]" />
      <q-input v-model="form.password" label="Contraseña" outlined stack-label lazy-rules :type="showPassword ? 'text' : 'password'" :rules="[validarPassword]">
        <template #append><q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cursor-pointer" @click="showPassword = !showPassword" /></template>
      </q-input>
      <q-input v-model="form.confirmarPassword" label="Confirmar contraseña" outlined stack-label lazy-rules :type="showPassword ? 'text' : 'password'" :rules="[validarConfirmarPassword]" />

      <q-banner v-if="errorMessage" dense class="xchang-banner xchang-banner--error" rounded>{{ errorMessage }}</q-banner>
      <q-btn type="submit" color="primary" label="Registrarse" size="lg" class="full-width" unelevated :loading="loading" :disable="!formularioValido" />
    </q-form>

    <div class="text-center q-mt-lg">
      <router-link :to="{ name: 'login' }" class="xc-auth-link">¿Ya tienes cuenta? Inicia sesión</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getPaises } from '@/services/paises'

const router = useRouter()
const authStore = useAuthStore()
const correoPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const form = reactive({ nombreUsuario: '', correoElectronico: '', paisId: null, password: '', confirmarPassword: '' })
const paisOptions = ref([])
const cargandoPaises = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  cargandoPaises.value = true
  try {
    const { data } = await getPaises()
    paisOptions.value = data.map((pais) => ({ label: pais.nombre, value: pais.paisId }))
  } finally { cargandoPaises.value = false }
})

function validarNombreUsuario(val) {
  if (!val || val.length < 2) return 'Mínimo 2 caracteres'
  if (val.length > 30) return 'Máximo 30 caracteres'
  return true
}
function validarCorreo(val) {
  if (!val || val.length < 5) return 'Mínimo 5 caracteres'
  if (val.length > 100) return 'Máximo 100 caracteres'
  if (!correoPattern.test(val)) return 'Correo inválido'
  return true
}
function validarPassword(val) {
  if (!val || val.length < 8) return 'Mínimo 8 caracteres'
  if (val.length > 50) return 'Máximo 50 caracteres'
  return true
}
function validarConfirmarPassword() {
  if (form.confirmarPassword !== form.password) return 'No coinciden'
  return true
}
function validarPais(val) {
  if (!val) return 'Seleccione un país'
  return true
}
const formularioValido = computed(() => validarNombreUsuario(form.nombreUsuario) === true && validarCorreo(form.correoElectronico) === true && validarPassword(form.password) === true && validarConfirmarPassword() === true && validarPais(form.paisId) === true)

async function onSubmit() {
  if (!formularioValido.value) return
  loading.value = true
  errorMessage.value = ''
  try {
    await authStore.register(form)
    router.push({ name: 'dashboard' })
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'Valor inválido'
  } finally { loading.value = false }
}
</script>

<style scoped>
.xc-auth-link { color: var(--q-primary); font-weight: 600; text-decoration: none; }
.xc-auth-link:hover { text-decoration: underline; }
</style>
