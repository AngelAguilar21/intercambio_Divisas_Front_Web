<template>
  <q-page class="q-pa-md">
    <!-- ── Usuario NO autenticado ── -->
    <template v-if="!authStore.isAuthenticated">
      <div class="text-h5 q-mb-xs">Menú principal</div>
      <div class="text-body2 text-grey-7 q-mb-md">
        Bienvenido a X-Chang — Intercambio de divisas P2P
      </div>

      <q-card flat bordered class="q-pa-md q-mb-md">
        <div class="text-subtitle1 text-weight-medium q-mb-xs">
          {{ par1.origen }} / {{ par1.destino }} — Gráfico histórico
        </div>
        <GraficoPar :origen="par1.origen" :destino="par1.destino" rango="UltimoMes" />
      </q-card>

      <div class="row q-col-gutter-md q-mt-sm">
        <div class="col-12 col-sm-6">
          <q-btn
            color="primary"
            label="Iniciar sesión"
            class="full-width"
            size="lg"
            :to="{ name: 'login' }"
          />
        </div>
        <div class="col-12 col-sm-6">
          <q-btn
            outline
            color="primary"
            label="Registrarse"
            class="full-width"
            size="lg"
            :to="{ name: 'register' }"
          />
        </div>
      </div>
    </template>

    <!-- ── Usuario AUTENTICADO ── -->
    <template v-else>
      <div class="text-h5 q-mb-xs">
        Menú principal
        <q-badge :color="authStore.isAdmin ? 'deep-orange' : 'primary'" class="q-ml-sm">
          {{ authStore.user?.rol }}
        </q-badge>
      </div>
      <div class="text-body2 text-grey-7 q-mb-md">
        Hola, {{ authStore.user?.nombreUsuario }}
      </div>

      <div v-if="cargandoPares" class="flex flex-center q-py-xl">
        <q-spinner size="lg" color="primary" />
      </div>

      <div v-else class="row q-col-gutter-md">
        <!-- Primer gráfico -->
        <div class="col-12 col-lg-6">
          <q-card flat bordered class="q-pa-md">
            <div class="text-subtitle1 text-weight-medium q-mb-xs">
              {{ par1.origen }} / {{ par1.destino }} — Gráfico histórico
            </div>
            <GraficoPar :origen="par1.origen" :destino="par1.destino" rango="UltimoDia" />
          </q-card>
        </div>

        <!-- Segundo gráfico -->
        <div class="col-12 col-lg-6">
          <q-card flat bordered class="q-pa-md">
            <div class="text-subtitle1 text-weight-medium q-mb-xs">
              {{ par2.origen }} / {{ par2.destino }} — Gráfico histórico
            </div>
            <GraficoPar :origen="par2.origen" :destino="par2.destino" rango="UltimoDia" />
          </q-card>
        </div>
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getMenuPrincipal } from '@/services/preciosPares'
import GraficoPar from '@/components/graficos/GraficoPar.vue'

const authStore = useAuthStore()

const cargandoPares = ref(false)
const par1 = ref({ origen: 'USD', destino: 'EUR' })
const par2 = ref({ origen: 'EUR', destino: 'USD' })

onMounted(async () => {
  cargandoPares.value = true
  try {
    // El backend calcula los pares según el país del usuario registrado (PaisId)
    // y su operación más reciente activa — no hay lógica client-side de mapeo
    const { data } = await getMenuPrincipal()

    par1.value = {
      origen: data.graficoPrincipal?.monedaOrigen ?? 'USD',
      destino: data.graficoPrincipal?.monedaDestino ?? 'EUR',
    }

    if (data.graficoSecundario) {
      par2.value = {
        origen: data.graficoSecundario.monedaOrigen,
        destino: data.graficoSecundario.monedaDestino,
      }
    } else {
      par2.value = { origen: par1.value.destino, destino: par1.value.origen }
    }
  } catch {
    par1.value = { origen: 'USD', destino: 'EUR' }
    par2.value = { origen: 'EUR', destino: 'USD' }
  } finally {
    cargandoPares.value = false
  }
})
</script>
