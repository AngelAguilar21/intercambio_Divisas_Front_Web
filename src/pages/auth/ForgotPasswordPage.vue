<template>
  <div>
    <div class="text-h6 q-mb-md">Recuperar contraseña</div>
    <p class="text-body2 text-grey-7">
      Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
    </p>

    <q-form class="q-gutter-md" @submit.prevent="onSubmit">
      <q-input
        v-model="correoElectronico"
        name="correoElectronico"
        label="Correo electrónico"
        type="email"
        outlined
        :rules="[(val) => /.+@.+\..+/.test(val) || 'Correo inválido']"
      />

      <q-banner v-if="mensaje" dense class="bg-green-1 text-green-9" rounded>
        {{ mensaje }}
      </q-banner>

      <q-btn type="submit" color="primary" label="Enviar enlace" class="full-width" :loading="loading" />
    </q-form>

    <div class="text-center q-mt-md">
      <router-link :to="{ name: 'login' }" class="text-primary">Volver a iniciar sesión</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { forgotPassword } from '@/services/auth'

const correoElectronico = ref('')
const loading = ref(false)
const mensaje = ref('')

async function onSubmit() {
  loading.value = true
  mensaje.value = ''
  try {
    const { data } = await forgotPassword(correoElectronico.value)
    mensaje.value = data.mensaje
  } finally {
    loading.value = false
  }
}
</script>
