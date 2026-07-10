<template>
  <q-page class="q-pa-md">
    <div class="xc-page-head">
      <span class="xc-section-kicker">
        <q-icon name="account_circle" size="14px" />
        Usuario
      </span>
      <h1 class="xc-section-title">Mi perfil</h1>
      <div class="xc-section-bar" aria-hidden="true" />
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card flat bordered class="q-pa-md">
          <div class="text-subtitle1 text-weight-medium q-mb-md">Editar datos</div>

          <div class="column items-center q-mb-md">
            <q-avatar size="96px" class="q-mb-sm">
              <img
                v-if="form.fotoUrl"
                :src="form.fotoUrl"
                :alt="form.nombreUsuario"
                style="object-fit: cover"
                @error="imgError = true"
              />
              <q-icon v-else name="account_circle" size="96px" color="grey-5" />
            </q-avatar>
            <div class="text-subtitle2 text-weight-medium">{{ form.nombreUsuario }}</div>
          </div>

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
import { onMounted, reactive, ref, watch } from 'vue'
import { getPerfil, actualizarPerfil } from '@/services/perfil'

const perfil = ref(null)
const form = reactive({ nombreUsuario: '', telefono: '', fotoUrl: '' })
const saving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const imgError = ref(false)

async function cargarPerfil() {
  try {
    const { data } = await getPerfil()
    perfil.value = data
    form.nombreUsuario = data.nombreUsuario ?? data.NombreUsuario ?? ''
    form.telefono = data.telefono ?? data.Telefono ?? ''
    form.fotoUrl = data.fotoUrl ?? data.FotoUrl ?? ''
  } catch (error) {
    const status = error.response?.status
    const msg = error.response?.data?.mensaje || error.message
    console.error(`[PerfilPage] Error al cargar perfil — HTTP ${status ?? 'sin respuesta'}:`, msg, error)
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo cargar el perfil.'
  }
}

onMounted(cargarPerfil)

watch(() => form.fotoUrl, () => { imgError.value = false })

async function onSubmit() {
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const payload = {
      ...form,
      tipoDocumento: perfil.value?.tipoDocumento ?? perfil.value?.TipoDocumento ?? null,
      numeroDocumento: perfil.value?.numeroDocumento ?? perfil.value?.NumeroDocumento ?? null,
    }
    const { data } = await actualizarPerfil(payload)
    perfil.value = data
    form.nombreUsuario = data.nombreUsuario ?? data.NombreUsuario ?? ''
    form.telefono = data.telefono ?? data.Telefono ?? ''
    form.fotoUrl = data.fotoUrl ?? data.FotoUrl ?? ''
    successMessage.value = 'Perfil actualizado correctamente.'
  } catch (error) {
    const status = error.response?.status
    const respData = error.response?.data
    console.error(
      `[PerfilPage] PUT /api/perfil falló — HTTP ${status ?? 'sin respuesta'}`,
      '\nBody enviado:', JSON.stringify(form),
      '\nRespuesta del servidor:', respData,
      '\nError completo:', error,
    )
    if (respData?.detalle) {
      console.error('[PerfilPage] Detalle del servidor:', respData.detalle)
    }
    errorMessage.value = respData?.mensaje || 'No se pudo actualizar el perfil.'
  } finally {
    saving.value = false
  }
}
</script>
