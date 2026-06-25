<template>
  <q-layout view="lHh Lpr lFf">
    <AppHeader @toggle-drawer="leftDrawerOpen = !leftDrawerOpen" />
    <AppDrawer v-model="leftDrawerOpen" />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppDrawer from '@/components/layout/AppDrawer.vue'

const leftDrawerOpen = ref(false)
</script>
