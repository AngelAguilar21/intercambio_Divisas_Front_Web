<template>
  <div class="xc-wallet-bar">
    <div v-if="conSaldo.length === 0" class="xc-wallet-bar-empty">No existen fondos disponibles</div>

    <div v-else class="xc-wallet-bar-row">
      <q-chip
        v-for="saldo in conSaldo"
        :key="saldo.monedaId"
        clickable
        dense
        square
        class="xc-wallet-chip"
        @click="(e) => abrirAccion(saldo, e)"
      >
        <span class="xc-wallet-chip-code">{{ saldo.codigoISO }}</span>
        <span class="xc-wallet-chip-saldo">{{ formatear(saldo.saldoDisponible) }}</span>
      </q-chip>
    </div>

    <q-btn flat dense round icon="expand_more" size="sm" class="xc-wallet-toggle">
      <q-menu anchor="bottom right" self="top right">
        <q-list style="min-width: 260px; max-height: 360px" class="scroll">
          <q-item-label header>Mis monedas</q-item-label>
          <q-item
            v-for="saldo in todos"
            :key="saldo.monedaId"
            clickable
            @click="(e) => abrirAccion(saldo, e)"
          >
            <q-item-section>{{ saldo.codigoISO }} - {{ saldo.nombre }}</q-item-section>
            <q-item-section side class="xc-figure">{{ formatear(saldo.saldoDisponible) }}</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>

    <q-menu v-model="menuAbierto" :target="menuTarget" anchor="bottom middle" self="top middle">
      <q-list>
        <q-item clickable v-close-popup @click="irA('deposito')">
          <q-item-section avatar><q-icon name="south_west" /></q-item-section>
          <q-item-section>Depositar</q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="irA('retiro')">
          <q-item-section avatar><q-icon name="north_east" /></q-item-section>
          <q-item-section>Retirar</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBilleteraStore } from '@/stores/billetera'

const router = useRouter()
const billeteraStore = useBilleteraStore()

const menuAbierto = ref(false)
const menuTarget = ref(null)
const monedaSeleccionada = ref(null)

const todos = computed(() => [...billeteraStore.saldos].sort((a, b) => b.saldoDisponible - a.saldoDisponible))
const conSaldo = computed(() => todos.value.filter((s) => s.saldoDisponible > 0))

function formatear(valor) {
  return Number(valor).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function abrirAccion(saldo, evento) {
  monedaSeleccionada.value = saldo.monedaId
  menuTarget.value = evento.currentTarget
  menuAbierto.value = true
}

function irA(nombreRuta) {
  router.push({ name: nombreRuta, query: { monedaId: monedaSeleccionada.value } })
}

onMounted(() => {
  if (!billeteraStore.cargado) billeteraStore.cargar()
})
</script>

<style scoped>
.xc-wallet-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  max-width: 420px;
  overflow: hidden;
}

.xc-wallet-bar-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  overflow: hidden;
}

.xc-wallet-bar-empty {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
  padding: 0 8px;
}

.xc-wallet-chip {
  flex-shrink: 0;
  font-size: 0.76rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.18) !important;
  border-radius: 8px !important;
  transition: background 0.15s;
}

.xc-wallet-chip:hover {
  background: rgba(255, 255, 255, 0.18) !important;
}

.xc-wallet-chip-code {
  margin-right: 5px;
  opacity: 0.65;
  font-size: 0.70rem;
}

.xc-wallet-toggle {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.7) !important;
}
</style>
