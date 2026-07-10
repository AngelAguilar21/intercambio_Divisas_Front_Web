<template>
  <div>
    <div class="text-h4 text-weight-bold q-mb-lg">Crea tu cuenta</div>

    <q-form ref="formRef" class="q-gutter-lg" @submit.prevent="onSubmit">
      <q-input
        v-model.trim="form.nombreUsuario"
        label="Nombre de usuario"
        outlined
        stack-label
        :error="!!erroresServidor.nombreUsuario"
        :error-message="erroresServidor.nombreUsuario"
        :rules="[validarNombreUsuario]"
        @update:model-value="erroresServidor.nombreUsuario = ''"
      />

      <q-input
        v-model.trim="form.correoElectronico"
        label="Correo electrónico"
        type="email"
        outlined
        stack-label
        :error="!!erroresServidor.correoElectronico"
        :error-message="erroresServidor.correoElectronico"
        :rules="[validarCorreo]"
        @update:model-value="erroresServidor.correoElectronico = ''"
      />

      <q-select
        v-model="form.paisId"
        label="País de residencia"
        outlined
        stack-label
        :options="paisOptions"
        :loading="cargandoPaises"
        emit-value
        map-options
        :rules="[(val) => validarRequerido(val, 'Seleccione un país')]"
      />

      <q-input
        v-model="form.password"
        label="Contraseña"
        outlined
        stack-label
        :type="showPassword ? 'text' : 'password'"
        :rules="[(val) => validarPassword(val, { exigirComplejidad: true })]"
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
        label="Confirmar contraseña"
        outlined
        stack-label
        :type="showPassword ? 'text' : 'password'"
        :rules="[(val) => validarConfirmarPassword(val, form.password)]"
      />

      <q-banner v-if="errorMessage" dense class="xchang-banner xchang-banner--error" rounded>
        {{ errorMessage }}
      </q-banner>

      <q-btn
        type="submit"
        color="primary"
        label="Registrarse"
        size="lg"
        class="full-width"
        unelevated
        :loading="loading"
        :disable="!formularioValido"
      />
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
import {
  normalizarMensajeError,
  validarConfirmarPassword,
  validarCorreo,
  validarNombreUsuario,
  validarPassword,
  validarRequerido,
} from '@/utils/validaciones'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref(null)
const form = reactive({
  nombreUsuario: '',
  correoElectronico: '',
  paisId: null,
  password: '',
  confirmarPassword: '',
})
const erroresServidor = reactive({ nombreUsuario: '', correoElectronico: '' })
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
  } finally {
    cargandoPaises.value = false
  }
})

const formularioValido = computed(
  () =>
    validarNombreUsuario(form.nombreUsuario) === true &&
    validarCorreo(form.correoElectronico) === true &&
    validarRequerido(form.paisId, 'Seleccione un país') === true &&
    validarPassword(form.password, { exigirComplejidad: true }) === true &&
    validarConfirmarPassword(form.confirmarPassword, form.password) === true &&
    !erroresServidor.nombreUsuario &&
    !erroresServidor.correoElectronico,
)

async function onSubmit() {
  errorMessage.value = ''
  erroresServidor.nombreUsuario = ''
  erroresServidor.correoElectronico = ''

  const valido = await formRef.value?.validate()
  if (!valido || !formularioValido.value) return

  loading.value = true
  try {
    await authStore.register({ ...form })
    router.push({ name: 'dashboard' })
  } catch (error) {
    const mensaje = normalizarMensajeError(error, 'Valor inválido')
    const lower = mensaje.toLowerCase()

    if (lower.includes('usuario ya')) {
      erroresServidor.nombreUsuario = 'Usuario ya registrado'
    } else if (lower.includes('correo ya')) {
      erroresServidor.correoElectronico = 'Correo ya registrado'
    } else {
      errorMessage.value = mensaje
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
