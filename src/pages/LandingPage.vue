<template>
  <q-layout view="hHh lpr fFf" class="xc-landing">
    <LandingHeader />

    <q-page-container>
      <q-page>
        <LandingHero />
        <LandingBeneficios />
        <LandingComoFunciona />
        <LandingEstadisticas />
        <LandingTestimonios />
        <LandingFaq />
        <LandingFooter />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import LandingHeader from '@/components/landing/LandingHeader.vue'
import LandingHero from '@/components/landing/LandingHero.vue'
import LandingBeneficios from '@/components/landing/LandingBeneficios.vue'
import LandingComoFunciona from '@/components/landing/LandingComoFunciona.vue'
import LandingEstadisticas from '@/components/landing/LandingEstadisticas.vue'
import LandingTestimonios from '@/components/landing/LandingTestimonios.vue'
import LandingFaq from '@/components/landing/LandingFaq.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
</script>

<style scoped>
.xc-landing {
  background: var(--xchang-page-bg);
}
</style>
