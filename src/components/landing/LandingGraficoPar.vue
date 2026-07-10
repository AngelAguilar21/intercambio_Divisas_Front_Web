<template>
  <section class="xc-landing-grafico">
    <div class="xc-landing-grafico__inner">
      <div class="text-h5 text-weight-bold q-mb-xs">Precios en tiempo real</div>
      <div class="text-body2 xc-landing-grafico__sub q-mb-md">
        Mayor precio de compra y menor precio de venta del par USD / EUR
      </div>

      <q-card flat bordered class="q-pa-md q-mb-lg">
        <div class="row items-center justify-between q-mb-sm q-col-gutter-sm">
          <div class="text-subtitle1 text-weight-medium">USD / EUR</div>
          <q-select
            v-model="rango"
            dense
            outlined
            style="width: 180px"
            :options="RANGO_OPTIONS"
            label="Rango"
            emit-value
            map-options
          />
        </div>
        <GraficoPar origen="USD" destino="EUR" :rango="rango" :auto-refresh="true" @rango-fallback="rango = $event" />
      </q-card>

      <div class="row justify-center q-col-gutter-md">
        <div class="col-auto">
          <q-btn color="primary" label="Iniciar sesión" size="lg" unelevated :to="{ name: 'login' }" />
        </div>
        <div class="col-auto">
          <q-btn outline color="primary" label="Registrarse" size="lg" :to="{ name: 'register' }" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import GraficoPar from '@/components/graficos/GraficoPar.vue'
import { RANGO_OPTIONS } from '@/utils/validaciones'

const rango = ref('UltimoDia')
</script>

<style scoped>
.xc-landing-grafico {
  padding: 64px 24px;
  background: var(--xchang-page-bg);
}

.xc-landing-grafico__inner {
  max-width: 860px;
  margin: 0 auto;
}

.xc-landing-grafico__sub {
  color: var(--xchang-text-secondary);
}
</style>
