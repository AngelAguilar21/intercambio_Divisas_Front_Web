<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">
      Hola, {{ authStore.user?.nombreUsuario }}
      <q-badge :color="authStore.isAdmin ? 'deep-orange' : 'primary'" class="q-ml-sm">
        {{ authStore.user?.rol }}
      </q-badge>
    </div>

    <q-card flat bordered class="q-pa-md">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">Datos de la cuenta</div>
      <q-list dense>
        <q-item>
          <q-item-section>Correo electrónico</q-item-section>
          <q-item-section side>{{ authStore.user?.correoElectronico }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>Estado</q-item-section>
          <q-item-section side>{{ authStore.user?.estado }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>Tema visual</q-item-section>
          <q-item-section side>{{ authStore.user?.temaVisual }}</q-item-section>
        </q-item>
      </q-list>
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.fetchProfile()
})
</script>
