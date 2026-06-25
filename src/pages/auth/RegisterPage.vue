<template>
  <div>
    <div class="text-h4 text-weight-bold q-mb-lg">Crea tu cuenta</div>

    <q-form class="q-gutter-lg" @submit.prevent="onSubmit">
      <q-input
        v-model="form.nombreUsuario"
        name="nombreUsuario"
        label="Nombre de usuario"
        outlined
        stack-label
        lazy-rules
        :error="!!erroresServidor.nombreUsuario"
        :error-message="erroresServidor.nombreUsuario"
        :rules="[
          () =>
            validarNombreUsuario(form.nombreUsuario) === true ||
            validarNombreUsuario(form.nombreUsuario),
        ]"
        @update:model-value="erroresServidor.nombreUsuario = ''"
      />

      <q-input
        v-model="form.correoElectronico"
        name="correoElectronico"
        label="Correo electrónico"
        type="email"
        outlined
        stack-label
        lazy-rules
        :error="!!erroresServidor.correoElectronico"
        :error-message="erroresServidor.correoElectronico"
        :rules="[
          () =>
            validarCorreo(form.correoElectronico) === true || validarCorreo(form.correoElectronico),
        ]"
        @update:model-value="erroresServidor.correoElectronico = ''"
      />

      <q-input
        v-model="form.telefono"
        name="telefono"
        label="Teléfono"
        outlined
        stack-label
        lazy-rules
        :rules="[() => validarTelefono(form.telefono) === true || validarTelefono(form.telefono)]"
      />

      <div class="row q-col-gutter-md">
        <div class="col-5">
          <q-select
            v-model="form.tipoDocumento"
            name="tipoDocumento"
            label="Tipo de documento"
            outlined
            stack-label
            lazy-rules
            :options="['DNI', 'Pasaporte', 'Carné de Extranjería']"
            :rules="[
              () =>
                validarTipoDocumento(form.tipoDocumento) === true ||
                validarTipoDocumento(form.tipoDocumento),
            ]"
          />
        </div>
        <div class="col-7">
          <q-input
            v-model="form.numeroDocumento"
            name="numeroDocumento"
            label="Número de documento"
            outlined
            stack-label
            lazy-rules
            :rules="[
              () =>
                validarNumeroDocumento(form.numeroDocumento) === true ||
                validarNumeroDocumento(form.numeroDocumento),
            ]"
          />
        </div>
      </div>

      <q-select
        v-model="form.paisId"
        name="paisId"
        label="País de residencia"
        outlined
        stack-label
        lazy-rules
        :options="paisOptions"
        :loading="cargandoPaises"
        emit-value
        map-options
        :rules="[() => validarPais(form.paisId) === true || validarPais(form.paisId)]"
      />

      <div>
        <q-input
          v-model="form.password"
          name="password"
          label="Contraseña"
          outlined
          stack-label
          lazy-rules
          :type="showPassword ? 'text' : 'password'"
          :rules="[() => validarPassword(form.password) === true || validarPassword(form.password)]"
        >
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <div class="q-px-sm q-pt-xs">
          <div
            v-for="requisito in requisitosPassword"
            :key="requisito.label"
            class="row items-center text-caption"
            :class="requisito.cumple ? 'text-positive' : 'text-grey-7'"
          >
            <q-icon
              :name="requisito.cumple ? 'check_circle' : 'radio_button_unchecked'"
              size="16px"
              class="q-mr-xs"
            />
            {{ requisito.label }}
          </div>
        </div>
      </div>

      <q-input
        v-model="form.confirmarPassword"
        name="confirmarPassword"
        label="Confirmar contraseña"
        outlined
        stack-label
        lazy-rules
        :type="showPassword ? 'text' : 'password'"
        :rules="[
          () =>
            validarConfirmarPassword(form.confirmarPassword, form.password) === true ||
            validarConfirmarPassword(form.confirmarPassword, form.password),
        ]"
      />

      <q-banner v-if="errorMessage" dense class="xchang-banner xchang-banner--error" rounded>
        {{ errorMessage }}
      </q-banner>

      <q-banner v-if="successMessage" dense class="xchang-banner xchang-banner--success" rounded>
        {{ successMessage }}
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
      <router-link :to="{ name: 'login' }" class="xc-auth-link"
        >¿Ya tienes cuenta? Inicia sesión</router-link
      >
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
const passwordComplejidadPattern = /(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/

const form = reactive({
  nombreUsuario: '',
  correoElectronico: '',
  telefono: '',
  tipoDocumento: null,
  numeroDocumento: '',
  paisId: null,
  password: '',
  confirmarPassword: '',
})

const erroresServidor = reactive({
  nombreUsuario: '',
  correoElectronico: '',
})

const paisOptions = ref([])
const cargandoPaises = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(async () => {
  cargandoPaises.value = true
  try {
    const { data } = await getPaises()
    paisOptions.value = data.map((pais) => ({ label: pais.nombre, value: pais.paisId }))
  } finally {
    cargandoPaises.value = false
  }
})

function validarTelefono(val) {
  if (!val || val.length < 6) return 'Mínimo 6 caracteres'
  if (val.length > 20) return 'Máximo 20 caracteres'
  return true
}

function validarTipoDocumento(val) {
  if (!val) return 'Seleccione un tipo de documento'
  return true
}

function validarNumeroDocumento(val) {
  if (!val || val.length < 5) return 'Mínimo 5 caracteres'
  if (val.length > 20) return 'Máximo 20 caracteres'
  return true
}

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
  if (!passwordComplejidadPattern.test(val)) {
    return 'La contraseña debe contener una mayúscula, un número y un carácter especial'
  }
  return true
}

const requisitosPassword = computed(() => [
  {
    label: 'Entre 8 y 50 caracteres',
    cumple: form.password.length >= 8 && form.password.length <= 50,
  },
  { label: 'Una letra mayúscula', cumple: /[A-Z]/.test(form.password) },
  { label: 'Un número', cumple: /\d/.test(form.password) },
  { label: 'Un carácter especial', cumple: /[^A-Za-z0-9]/.test(form.password) },
])

function validarConfirmarPassword(val, password) {
  if (val !== password) return 'Las contraseñas no coinciden'
  return true
}

function validarPais(val) {
  if (!val) return 'Seleccione un país'
  return true
}

const formularioValido = computed(() => {
  return (
    validarNombreUsuario(form.nombreUsuario) === true &&
    validarCorreo(form.correoElectronico) === true &&
    validarTelefono(form.telefono) === true &&
    validarTipoDocumento(form.tipoDocumento) === true &&
    validarNumeroDocumento(form.numeroDocumento) === true &&
    validarPassword(form.password) === true &&
    validarConfirmarPassword(form.confirmarPassword, form.password) === true &&
    validarPais(form.paisId) === true &&
    !erroresServidor.nombreUsuario &&
    !erroresServidor.correoElectronico
  )
})

async function onSubmit() {
  if (!formularioValido.value) return

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  erroresServidor.nombreUsuario = ''
  erroresServidor.correoElectronico = ''

  try {
    await authStore.register({
      nombreUsuario: form.nombreUsuario,
      correoElectronico: form.correoElectronico,
      telefono: form.telefono,
      tipoDocumento: form.tipoDocumento,
      numeroDocumento: form.numeroDocumento,
      password: form.password,
      confirmarPassword: form.confirmarPassword,
      paisId: form.paisId,
    })

    successMessage.value = 'Registro exitoso. Redirigiendo al menú principal...'
    router.push({ name: 'dashboard' })
  } catch (error) {
    const mensaje = error.response?.data?.mensaje || ''
    const mensajeNormalizado = mensaje.toLowerCase()

    if (mensajeNormalizado.includes('correo')) {
      erroresServidor.correoElectronico = 'Correo ya registrado'
    } else if (mensajeNormalizado.includes('usuario')) {
      erroresServidor.nombreUsuario = 'Usuario ya registrado'
    } else {
      errorMessage.value = mensaje || 'No se pudo completar el registro.'
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
