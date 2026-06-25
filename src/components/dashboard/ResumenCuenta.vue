<template>
  <div class="row q-col-gutter-md">
    <div class="col-12 col-md-5">
      <q-card flat bordered class="xc-res-card xc-card-accent-hover xc-enter">
        <div class="xc-res-label">Saldo disponible</div>

        <div v-if="cargandoSaldo" class="q-mt-sm">
          <q-skeleton type="text" width="70%" />
          <q-skeleton type="text" width="40%" class="q-mt-sm" />
        </div>

        <template v-else-if="saldos.length">
          <div class="xc-res-saldo-principal xc-figure">
            {{ formatearMonto(saldos[0].saldoDisponible) }}
            <span class="xc-res-saldo-moneda">{{ saldos[0].codigoISO }}</span>
          </div>

          <div v-if="saldos.length > 1" class="xc-res-otros">
            <span v-for="s in saldos.slice(1, 4)" :key="s.monedaId" class="xc-res-chip">
              {{ s.codigoISO }} {{ formatearMonto(s.saldoDisponible) }}
            </span>
          </div>
        </template>

        <q-banner v-else dense class="xchang-banner xchang-banner--empty q-mt-sm">
          Aún no tienes saldos registrados.
        </q-banner>

        <q-btn
          flat
          dense
          no-caps
          color="primary"
          label="Ver billetera completa"
          class="q-mt-md q-px-none"
          :to="{ name: 'billetera' }"
        />
      </q-card>
    </div>

    <div class="col-12 col-md-7">
      <q-card flat bordered class="xc-res-card xc-card-accent-hover xc-enter" style="--xc-delay: 70ms">
        <div class="row items-center justify-between">
          <div class="xc-res-label">Tipo de cambio actual</div>
          <ParMonedaChip origen="USD" destino="PEN" />
        </div>

        <div v-if="cargandoTasa" class="q-mt-sm">
          <q-skeleton type="text" width="50%" />
        </div>

        <template v-else>
          <div class="xc-res-tasa-row">
            <div class="xc-res-tasa xc-figure">
              {{ tasaActual ? formatearMonto(tasaActual, 4) : 'Sin datos' }}
            </div>
            <div
              v-if="variacion !== null"
              class="xc-res-variacion"
              :class="variacion >= 0 ? 'xc-res-variacion--up' : 'xc-res-variacion--down'"
            >
              <q-icon :name="variacion >= 0 ? 'arrow_upward' : 'arrow_downward'" size="14px" />
              {{ formatearPorcentaje(variacion) }}
            </div>
            <div v-else class="xc-res-variacion xc-res-variacion--neutro">Variación no disponible</div>
          </div>
          <div class="xc-res-tasa-caption">Variación respecto al día anterior</div>
        </template>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getBilletera } from '@/services/billetera'
import { getListadoPares, getSerieHistorica } from '@/services/preciosPares'
import ParMonedaChip from '@/components/common/ParMonedaChip.vue'
import { formatearMonto, formatearPorcentaje } from '@/utils/formato'

const saldos = ref([])
const cargandoSaldo = ref(false)

const tasaActual = ref(null)
const variacion = ref(null)
const cargandoTasa = ref(false)

onMounted(async () => {
  await Promise.all([cargarSaldo(), cargarTasa()])
})

async function cargarSaldo() {
  cargandoSaldo.value = true
  try {
    const { data } = await getBilletera()
    saldos.value = [...(data.saldos || [])].sort(
      (a, b) => Number(b.saldoDisponible) - Number(a.saldoDisponible),
    )
  } catch {
    saldos.value = []
  } finally {
    cargandoSaldo.value = false
  }
}

async function cargarTasa() {
  cargandoTasa.value = true
  try {
    const { data } = await getListadoPares({
      monedaEntrega: 'USD',
      monedaObtiene: 'PEN',
      criterio: 'MayorPrecioCompra',
      direccion: 'desc',
      pagina: 1,
      registrosPorPagina: '1',
    })

    tasaActual.value = data.registros?.[0] ? Number(data.registros[0].mayorPrecioCompra) : null
  } catch {
    tasaActual.value = null
  }

  try {
    const { data } = await getSerieHistorica('USD', 'PEN', 'UltimoDia')
    const puntos = data?.serie || data?.puntos || data?.registros || (Array.isArray(data) ? data : [])

    if (puntos.length >= 2) {
      const valorPunto = (p) => Number(p.valor ?? p.precio ?? p.precioCierre ?? p.mayorPrecioCompra)
      const primero = valorPunto(puntos[0])
      const ultimo = valorPunto(puntos[puntos.length - 1])

      variacion.value = primero ? ((ultimo - primero) / primero) * 100 : null
    } else {
      variacion.value = null
    }
  } catch {
    variacion.value = null
  } finally {
    cargandoTasa.value = false
  }
}
</script>

<style scoped>
.xc-res-card {
  padding: 22px;
  height: 100%;
}

.xc-res-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--xchang-text-secondary);
}

.xc-res-saldo-principal {
  font-size: 2rem;
  font-weight: 800;
  color: var(--xchang-page-text);
  margin-top: 10px;
}

.xc-res-saldo-moneda {
  font-size: 1rem;
  font-weight: 700;
  color: var(--xchang-text-secondary);
  margin-left: 6px;
}

.xc-res-otros {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.xc-res-chip {
  font-size: 0.78rem;
  font-weight: 600;
  background: var(--xchang-page-bg);
  border: 1px solid var(--xchang-border-light);
  border-radius: 100px;
  padding: 4px 12px;
  color: var(--xchang-text-secondary);
}

.xc-res-tasa-row {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-top: 10px;
}

.xc-res-tasa {
  font-size: 2rem;
  font-weight: 800;
  color: var(--xchang-page-text);
}

.xc-res-variacion {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 100px;
}

.xc-res-variacion--up {
  color: #15803d;
  background: rgba(22, 163, 74, 0.12);
}

.xc-res-variacion--down {
  color: #b91c1c;
  background: rgba(220, 38, 38, 0.1);
}

.xc-res-variacion--neutro {
  color: var(--xchang-text-secondary);
  font-weight: 600;
  font-size: 0.78rem;
}

.xc-res-tasa-caption {
  font-size: 0.78rem;
  color: var(--xchang-text-secondary);
  margin-top: 6px;
}
</style>
