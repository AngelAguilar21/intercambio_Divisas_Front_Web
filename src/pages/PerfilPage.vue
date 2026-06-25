<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Mi perfil</div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 text-weight-medium q-mb-md">Editar datos</div>

          <q-form class="q-gutter-md" @submit.prevent="onSubmit">
            <q-input
              v-model="form.nombreUsuario"
              name="nombreUsuario"
              label="Nombre de usuario"
              outlined
            />
            <q-input v-model="form.telefono" name="telefono" label="Teléfono" outlined />
            <q-input
              v-model="form.fotoUrl"
              name="fotoUrl"
              label="URL de foto de perfil"
              outlined
              hint="Opcional"
            />

            <q-banner v-if="errorMessage" dense class="xchang-banner xchang-banner--error" rounded>
              {{ errorMessage }}
            </q-banner>
            <q-banner
              v-if="successMessage"
              dense
              class="xchang-banner xchang-banner--success"
              rounded
            >
              {{ successMessage }}
            </q-banner>

            <q-btn type="submit" color="primary" label="Guardar cambios" :loading="saving" />
          </q-form>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 text-weight-medium q-mb-md">Información de la cuenta</div>
          <q-list dense>
            <q-item>
              <q-item-section>Correo electrónico</q-item-section>
              <q-item-section side>{{ perfil?.correoElectronico }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Documento</q-item-section>
              <q-item-section side
                >{{ perfil?.tipoDocumento }} {{ perfil?.numeroDocumento }}</q-item-section
              >
            </q-item>
            <q-item>
              <q-item-section>Calificación promedio</q-item-section>
              <q-item-section side>
                <div
                  v-if="perfil?.calificacionPromedio != null"
                  class="row items-center q-gutter-xs"
                >
                  <q-icon
                    v-for="n in 5"
                    :key="n"
                    :name="n <= Math.round(perfil.calificacionPromedio) ? 'star' : 'star_outline'"
                    color="warning"
                    size="16px"
                  />
                  <span class="xc-figure q-ml-xs">{{
                    perfil.calificacionPromedio.toFixed(1)
                  }}</span>
                </div>
                <span v-else>Sin calificaciones</span>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Transacciones completadas</q-item-section>
              <q-item-section side class="xc-figure">{{
                perfil?.totalTransaccionesCompletadas
              }}</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { getPerfil, actualizarPerfil } from '@/services/perfil'

const perfil = ref(null)
const form = reactive({ nombreUsuario: '', telefono: '', fotoUrl: '' })
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

async function cargarPerfil() {
  const { data } = await getPerfil()
  perfil.value = data
  form.nombreUsuario = data.nombreUsuario
  form.telefono = data.telefono || ''
  form.fotoUrl = data.fotoUrl || ''
}

onMounted(cargarPerfil)

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const { data } = await actualizarPerfil(form)
    perfil.value = data
    successMessage.value = 'Perfil actualizado correctamente.'
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo actualizar el perfil.'
  } finally {
    saving.value = false
  }
}
</script>
