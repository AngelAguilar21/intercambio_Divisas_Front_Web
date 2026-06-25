<template>
  <q-page class="q-pa-md xc-home">
    <template v-if="!authStore.isAuthenticated">
      <PrecioParChart
        moneda-origen="USD"
        moneda-destino="EUR"
        titulo="Mercado de divisas"
        class="xc-enter"
      />

      <div class="row justify-center q-gutter-md q-mt-lg">
        <q-btn
          outline
          color="primary"
          label="Iniciar sesión"
          class="xc-home-btn"
          :to="{ name: 'login' }"
        />
        <q-btn
          unelevated
          color="primary"
          label="Registrarse"
          class="xc-home-btn"
          :to="{ name: 'register' }"
        />
      </div>
    </template>

    <template v-else>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-lg-6">
          <PrecioParChart
            :moneda-origen="parPrincipal.origen"
            :moneda-destino="parPrincipal.destino"
            titulo="Tu moneda principal"
            class="xc-enter"
          />
        </div>
        <div class="col-12 col-lg-6">
          <PrecioParChart
            :moneda-origen="parReciente.origen"
            :moneda-destino="parReciente.destino"
            titulo="Tu operación activa más reciente"
            class="xc-enter"
            style="--xc-delay: 80ms"
          />
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getPerfil } from '@/services/perfil'
import { getOrdenes } from '@/services/ordenes'
import { getOfertas } from '@/services/ofertas'
import { monedaPorNombrePais } from '@/utils/monedaPrincipal'
import PrecioParChart from '@/components/home/PrecioParChart.vue'

const authStore = useAuthStore()

const monedaPrincipal = ref('USD')
const parReciente = ref({ origen: 'EUR', destino: 'USD' })

const parPrincipal = computed(() =>
  monedaPrincipal.value === 'USD'
    ? { origen: 'USD', destino: 'EUR' }
    : { origen: monedaPrincipal.value, destino: 'USD' },
)

onMounted(async () => {
  if (!authStore.isAuthenticated) return

  await cargarMonedaPrincipal()
  await cargarParReciente()
})

async function cargarMonedaPrincipal() {
  try {
    const { data } = await getPerfil()
    const nombrePais = data?.paisResidencia || data?.pais?.nombre || data?.paisNombre || ''
    monedaPrincipal.value = monedaPorNombrePais(nombrePais) || 'USD'
  } catch {
    monedaPrincipal.value = 'USD'
  }
}

async function cargarParReciente() {
  try {
    const [{ data: datosOrdenes }, { data: datosOfertas }] = await Promise.all([
      getOrdenes({ tamanoPagina: 5, pagina: 1 }),
      getOfertas({ tamanoPagina: 5, pagina: 1 }),
    ])

    const activos = [...(datosOrdenes.ordenes || []), ...(datosOfertas.ofertas || [])].sort(
      (a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion),
    )

    if (activos.length) {
      parReciente.value = { origen: activos[0].monedaOrigen, destino: activos[0].monedaDestino }
    } else {
      parReciente.value = { origen: parPrincipal.value.destino, destino: parPrincipal.value.origen }
    }
  } catch {
    parReciente.value = { origen: parPrincipal.value.destino, destino: parPrincipal.value.origen }
  }
}
</script>

<style scoped>
.xc-home {
  max-width: 760px;
  margin: 0 auto;
}

.xc-home-btn {
  min-width: 160px;
}
</style>
