<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Mi perfil</div>

    <q-card flat bordered class="q-pa-md">
      <div class="row items-center q-mb-md">
        <div class="text-subtitle1 text-weight-medium col">Información de la cuenta</div>
        <q-btn flat dense icon="refresh" label="Recargar" :loading="loading" @click="cargarPerfil" />
      </div>

      <q-banner v-if="errorMessage" dense class="xchang-banner xchang-banner--error q-mb-md" rounded>
        {{ errorMessage }}
      </q-banner>

      <q-list bordered separator>
        <q-item>
          <q-item-section>Nombre de usuario</q-item-section>
          <q-item-section side class="text-weight-medium">{{ mostrar(perfil?.nombreUsuario || authStore.user?.nombreUsuario) }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>Correo electrónico</q-item-section>
          <q-item-section side>{{ mostrar(perfil?.correoElectronico || authStore.user?.correoElectronico) }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>País de residencia</q-item-section>
          <q-item-section side>{{ mostrar(perfil?.paisResidencia || authStore.user?.paisResidencia) }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>Rol</q-item-section>
          <q-item-section side>{{ mostrar(perfil?.rol || authStore.user?.rol) }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>Estado</q-item-section>
          <q-item-section side>
            <q-badge :color="estadoCuenta === 'Activo' ? 'positive' : 'negative'">
              {{ mostrar(estadoCuenta) }}
            </q-badge>
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>Tema visual</q-item-section>
          <q-item-section side>{{ mostrar(perfil?.temaVisual || authStore.temaVisual) }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>Fecha de registro</q-item-section>
          <q-item-section side>{{ formatearFecha(perfil?.fechaRegistro || authStore.user?.fechaRegistro) }}</q-item-section>
        </q-item>
      </q-list>

      <div class="text-caption xc-text-secondary q-mt-md">
        Esta pantalla muestra los datos de la cuenta autenticada. La edición de teléfono, foto de perfil o documento no forma parte de las historias de usuario vigentes.
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getPerfil } from '@/services/perfil'

const authStore = useAuthStore()
const perfil = ref(null)
const loading = ref(false)
const errorMessage = ref('')

const estadoCuenta = computed(() => perfil.value?.estado || authStore.user?.estado || '-')

onMounted(cargarPerfil)

async function cargarPerfil() {
  loading.value = true
  errorMessage.value = ''

  try {
    const { data } = await getPerfil()
    perfil.value = data
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo cargar el perfil.'
  } finally {
    loading.value = false
  }
}

function mostrar(valor) {
  return valor === null || valor === undefined || valor === '' ? '-' : valor
}

function formatearFecha(valor) {
  if (!valor) return '-'
  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime()) ? '-' : fecha.toLocaleString()
}
</script>
