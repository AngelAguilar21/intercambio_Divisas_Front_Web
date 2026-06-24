<template>
  <q-page class="page">
    <div class="page__header">
      <h1 class="page__title">Historial de transacciones</h1>
      <p class="page__subtitle">Registro completo de toda tu actividad</p>
    </div>

    <div class="xc-card hist-card">
      <div class="tabs-bar">
        <button v-for="t in tabs" :key="t.key"
          :class="['tab-btn', activeTab === t.key && 'tab-btn--active']"
          @click="activeTab = t.key">
          {{ t.label }}
        </button>
      </div>

      <div class="tab-content">
        <div v-if="loading" class="loading-center"><q-spinner color="primary" size="32px" /></div>
        <div v-else-if="currentList.length === 0" class="empty-state">
          <q-icon name="receipt_long" size="40px" color="grey-4" />
          <p>No hay registros en esta categoría.</p>
        </div>
        <div v-else class="hist-list">
          <div v-for="item in currentList" :key="item.id || item.ordenCompraId || item.ofertaVentaId || item.compraInmediataId || item.ventaInmediataId || item.depositoId || item.retiroId"
            class="hist-item">
            <div class="hist-item__icon" :style="{ background: iconBg(activeTab) }">
              <q-icon :name="iconName(activeTab)" size="18px" :color="iconColor(activeTab)" />
            </div>
            <div class="hist-item__info">
              <div class="hist-item__title">{{ itemTitle(item, activeTab) }}</div>
              <div class="hist-item__date">{{ formatDate(item.fechaCreacion || item.fecha) }}</div>
            </div>
            <div class="hist-item__right">
              <div class="hist-item__amount">{{ itemAmount(item, activeTab) }}</div>
              <span :class="['hist-item__status', statusClass(item.estado)]">{{ item.estado }}</span>
            </div>
          </div>
        </div>

        <!-- Paginación -->
        <div v-if="pagination.totalPaginas > 1" class="pagination">
          <button class="pag-btn" :disabled="pagination.paginaActual <= 1" @click="changePage(-1)">
            <q-icon name="chevron_left" size="18px" />
          </button>
          <span class="pag-info">{{ pagination.paginaActual }} / {{ pagination.totalPaginas }}</span>
          <button class="pag-btn" :disabled="pagination.paginaActual >= pagination.totalPaginas" @click="changePage(1)">
            <q-icon name="chevron_right" size="18px" />
          </button>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import api from 'src/services/api'

const tabs = [
  { key: 'ordenesCompra', label: 'Órdenes compra' },
  { key: 'ofertasVenta', label: 'Ofertas venta' },
  { key: 'comprasInmediatas', label: 'Compras' },
  { key: 'ventasInmediatas', label: 'Ventas' },
  { key: 'depositos', label: 'Depósitos' },
  { key: 'retiros', label: 'Retiros' },
]

const activeTab = ref('ordenesCompra')
const loading = ref(false)
const historial = ref({})
const pagination = ref({ paginaActual: 1, totalPaginas: 1 })
const currentPage = ref(1)

const currentList = computed(() => {
  const data = historial.value[activeTab.value]
  return data?.items ?? data ?? []
})

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function iconName(tab) {
  const map = { ordenesCompra: 'shopping_cart', ofertasVenta: 'sell', comprasInmediatas: 'arrow_downward', ventasInmediatas: 'arrow_upward', depositos: 'add_circle', retiros: 'upload' }
  return map[tab] || 'receipt'
}
function iconBg(tab) {
  const map = { ordenesCompra: 'rgba(0,122,255,.1)', ofertasVenta: 'rgba(255,59,48,.1)', comprasInmediatas: 'rgba(52,199,89,.1)', ventasInmediatas: 'rgba(255,149,0,.1)', depositos: 'rgba(0,122,255,.1)', retiros: 'rgba(88,86,214,.1)' }
  return map[tab] || 'rgba(0,0,0,.05)'
}
function iconColor(tab) {
  const map = { ordenesCompra: 'primary', ofertasVenta: 'negative', comprasInmediatas: 'positive', ventasInmediatas: 'warning', depositos: 'primary', retiros: 'secondary' }
  return map[tab] || 'grey'
}

function itemTitle(item, tab) {
  if (tab === 'ordenesCompra') return `Orden #${item.ordenCompraId || ''} — ${item.parMoneda || ''}`
  if (tab === 'ofertasVenta') return `Oferta #${item.ofertaVentaId || ''} — ${item.parMoneda || ''}`
  if (tab === 'comprasInmediatas') return `Compra: ${item.monedaOrigen || ''} → ${item.monedaDestino || ''}`
  if (tab === 'ventasInmediatas') return `Venta: ${item.monedaOrigen || ''} → ${item.monedaDestino || ''}`
  if (tab === 'depositos') return `Depósito en ${item.codigoISO || item.moneda || ''}`
  if (tab === 'retiros') return `Retiro de ${item.codigoISO || item.moneda || ''}`
  return 'Transacción'
}

function itemAmount(item) {
  const n = item.monto ?? item.cantidad ?? item.montoDepositado ?? item.montoRetirado ?? 0
  return Number(n).toFixed(2)
}

function statusClass(estado) {
  const s = (estado || '').toLowerCase()
  if (['activa', 'activo', 'pendiente'].includes(s)) return 'status--pending'
  if (['completada', 'completado'].includes(s)) return 'status--done'
  if (['cancelada', 'cancelado', 'expirada', 'expirado'].includes(s)) return 'status--cancelled'
  return ''
}

async function fetchHistorial(page = 1) {
  loading.value = true
  try {
    const res = await api.get('/api/historial-transacciones', { params: { pagina: page, tamanoPagina: 10 } })
    historial.value = res.data
    const p = res.data[activeTab.value]
    pagination.value = { paginaActual: p?.paginaActual ?? 1, totalPaginas: p?.totalPaginas ?? 1 }
  } catch {
    historial.value = {}
  } finally { loading.value = false }
}

function changePage(dir) {
  currentPage.value += dir
  fetchHistorial(currentPage.value)
}

watch(activeTab, () => {
  const p = historial.value[activeTab.value]
  pagination.value = { paginaActual: p?.paginaActual ?? 1, totalPaginas: p?.totalPaginas ?? 1 }
})

onMounted(() => fetchHistorial())
</script>

<style lang="scss" scoped>
.page { padding:28px 32px; @media(max-width:768px){padding:16px;} }
.page__header { margin-bottom:24px; }
.page__title { font-size:1.6rem;font-weight:700;color:var(--xc-text);letter-spacing:-.03em;margin:0 0 4px; }
.page__subtitle { font-size:.85rem;color:var(--xc-text-secondary);margin:0; }
.hist-card { padding:0;overflow:hidden; }
.tabs-bar { display:flex;border-bottom:1px solid var(--xc-border-light);overflow-x:auto; }
.tab-btn { flex-shrink:0;padding:12px 16px;border:none;background:none;cursor:pointer;font-size:.82rem;
  font-weight:600;color:var(--xc-text-secondary);transition:all .15s;white-space:nowrap;
  &:hover{background:var(--xc-bg);}
  &--active{color:var(--xc-primary);border-bottom:2px solid var(--xc-primary);background:var(--xc-primary-light);} }
.tab-content { padding:20px; }
.loading-center { display:flex;justify-content:center;padding:32px; }
.empty-state { display:flex;flex-direction:column;align-items:center;gap:8px;padding:40px;
  color:var(--xc-text-secondary);font-size:.875rem; }
.hist-list { display:flex;flex-direction:column;gap:8px; }
.hist-item { display:flex;align-items:center;gap:14px;padding:14px;background:var(--xc-bg);
  border-radius:12px;border:1px solid var(--xc-border-light); }
.hist-item__icon { width:38px;height:38px;border-radius:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.hist-item__info { flex:1;min-width:0; }
.hist-item__title { font-size:.875rem;font-weight:600;color:var(--xc-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
.hist-item__date { font-size:.75rem;color:var(--xc-text-secondary);margin-top:2px; }
.hist-item__right { display:flex;flex-direction:column;align-items:flex-end;gap:4px; }
.hist-item__amount { font-size:.95rem;font-weight:700;color:var(--xc-text); }
.hist-item__status { padding:3px 8px;border-radius:6px;font-size:.7rem;font-weight:600; }
.status--pending { background:rgba(255,149,0,.12);color:var(--xc-warning); }
.status--done { background:rgba(52,199,89,.12);color:var(--xc-positive); }
.status--cancelled { background:rgba(142,142,147,.12);color:var(--xc-text-secondary); }
.pagination { display:flex;align-items:center;justify-content:center;gap:12px;margin-top:20px;padding-top:16px;border-top:1px solid var(--xc-border-light); }
.pag-btn { width:36px;height:36px;border-radius:9px;border:1.5px solid var(--xc-border);background:#fff;
  display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s;
  &:hover:not(:disabled){background:var(--xc-bg);}
  &:disabled{opacity:.4;cursor:not-allowed;} }
.pag-info { font-size:.85rem;color:var(--xc-text-secondary);font-weight:500; }
</style>
