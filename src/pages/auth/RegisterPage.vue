<template>
  <div>
    <div class="text-h6 q-mb-md">Crear cuenta</div>

    <q-form class="q-gutter-md" @submit.prevent="onSubmit">
      <q-input
        v-model="form.nombreUsuario"
        name="nombreUsuario"
        label="Nombre de usuario"
        outlined
        :rules="[(val) => (val && val.length >= 2) || 'Mínimo 2 caracteres']"
      />

      <q-input
        v-model="form.correoElectronico"
        name="correoElectronico"
        label="Correo electrónico"
        type="email"
        outlined
        :rules="[(val) => /.+@.+\..+/.test(val) || 'Correo inválido']"
      />

      <q-input
        v-model="form.telefono"
        name="telefono"
        label="Teléfono"
        outlined
        :rules="[(val) => (val && val.length >= 6) || 'Teléfono inválido']"
      />

      <div class="row q-col-gutter-sm">
        <div class="col-5">
          <q-select
            v-model="form.tipoDocumento"
            name="tipoDocumento"
            label="Tipo de documento"
            outlined
            :options="['DNI', 'Pasaporte', 'Carné de Extranjería']"
            :rules="[(val) => !!val || 'Requerido']"
          />
        </div>
        <div class="col-7">
          <q-input
            v-model="form.numeroDocumento"
            name="numeroDocumento"
            label="Número de documento"
            outlined
            :rules="[(val) => (val && val.length >= 5) || 'Mínimo 5 caracteres']"
          />
        </div>
      </div>

      <q-select
        v-model="form.paisId"
        name="paisId"
        label="País"
        outlined
        :options="paisOptions"
        emit-value
        map-options
        :rules="[(val) => !!val || 'Selecciona un país']"
      />

      <q-input
        v-model="form.password"
        name="password"
        label="Contraseña"
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
        label="Confirmar contraseña"
        outlined
        :type="showPassword ? 'text' : 'password'"
        :rules="[(val) => val === form.password || 'Las contraseñas no coinciden']"
      />

      <q-banner v-if="errorMessage" dense class="bg-red-1 text-red-9" rounded>
        {{ errorMessage }}
      </q-banner>

      <q-banner v-if="successMessage" dense class="bg-green-1 text-green-9" rounded>
        {{ successMessage }}
      </q-banner>

      <q-btn type="submit" color="primary" label="Registrarme" class="full-width" :loading="loading" />
    </q-form>

    <div class="text-center q-mt-md">
      <router-link :to="{ name: 'login' }" class="text-primary">¿Ya tienes cuenta? Inicia sesión</router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getPaises } from '@/services/paises'

const router = useRouter()
const authStore = useAuthStore()

const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,50}$/

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

const paisOptions = ref([])
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

onMounted(async () => {
  const { data } = await getPaises()
  paisOptions.value = data.map((pais) => ({ label: pais.nombre, value: pais.paisId }))
})

async function onSubmit() {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await authStore.register(form)
    successMessage.value = data.mensaje
    setTimeout(() => router.push({ name: 'login' }), 2500)
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo completar el registro.'
  } finally {
    loading.value = false
  }
}
</script>
