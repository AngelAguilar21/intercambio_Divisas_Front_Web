<template>
  <q-page class="dashboard">

    <!-- Page header -->
    <div class="dashboard__header">
      <div>
        <h1 class="dashboard__title">Buenos días, {{ greetingName }}</h1>
        <p class="dashboard__subtitle">{{ formattedDate }} · Mercado abierto</p>
      </div>
      <div class="dashboard__header-actions">
        <button class="dashboard__btn-secondary">
          <q-icon name="download" size="16px" />
          Exportar
        </button>
        <button class="dashboard__btn-primary" @click="$router.push('/exchange')">
          <q-icon name="currency_exchange" size="16px" />
          Nuevo intercambio
        </button>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="dashboard__stats">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-card__top">
          <div :class="['stat-card__icon', `stat-card__icon--${stat.color}`]">
            <q-icon :name="stat.icon" size="20px" />
          </div>
          <div :class="['stat-card__trend', stat.up ? 'stat-card__trend--up' : 'stat-card__trend--down']">
            <q-icon :name="stat.up ? 'arrow_upward' : 'arrow_downward'" size="12px" />
            {{ stat.trend }}
          </div>
        </div>
        <div class="stat-card__value">{{ stat.value }}</div>
        <div class="stat-card__label">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Main grid -->
    <div class="dashboard__grid">

      <!-- Left: Exchange rates + Quick exchange -->
      <div class="dashboard__left">

        <!-- Currency pairs -->
        <div class="xc-card dashboard__section">
          <div class="dashboard__section-header">
            <h2 class="dashboard__section-title">Pares de divisas</h2>
            <span class="dashboard__live-badge">
              <span class="dashboard__live-dot"></span>
              En vivo
            </span>
          </div>

          <div class="pairs-table">
            <div class="pairs-table__head">
              <span>Par</span>
              <span>Compra</span>
              <span>Venta</span>
              <span>Var. 24h</span>
            </div>
            <div v-if="!pairs.length" style="padding:20px;text-align:center;color:var(--xc-text-secondary);font-size:.85rem;">
              Cargando pares...
            </div>
            <div
              v-for="pair in pairs"
              :key="pair.name"
              class="pairs-table__row"
            >
              <div class="pairs-table__pair">
                <div class="pairs-table__pair-badge">{{ pair.name.split('/')[0] }}</div>
                <div>
                  <div class="pairs-table__name">{{ pair.name }}</div>
                  <div class="pairs-table__full">{{ pair.full }}</div>
                </div>
              </div>
              <span class="pairs-table__val">{{ pair.buy }}</span>
              <span class="pairs-table__val">{{ pair.sell }}</span>
              <span :class="['pairs-table__change', pair.up ? 'up' : 'down']">
                <q-icon :name="pair.up ? 'arrow_upward' : 'arrow_downward'" size="11px" />
                {{ pair.change }}
              </span>
            </div>
          </div>
        </div>

        <!-- Quick exchange -->
        <div class="xc-card dashboard__section">
          <div class="dashboard__section-header">
            <h2 class="dashboard__section-title">Intercambio rápido</h2>
          </div>

          <div class="quick-exchange">
            <div class="quick-exchange__field">
              <label class="quick-exchange__label">Envías</label>
              <div class="quick-exchange__input-row">
                <input
                  v-model="sendAmount"
                  type="number"
                  class="quick-exchange__amount"
                  placeholder="0.00"
                  min="0"
                />
                <div class="quick-exchange__currency-select">
                  <span class="quick-exchange__flag">🇺🇸</span>
                  <select v-model="sendCurrency" class="quick-exchange__select">
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                  </select>
                  <q-icon name="expand_more" size="16px" style="pointer-events:none" />
                </div>
              </div>
            </div>

            <button class="quick-exchange__swap" @click="swapCurrencies">
              <q-icon name="swap_vert" size="20px" />
            </button>

            <div class="quick-exchange__field">
              <label class="quick-exchange__label">Recibes</label>
              <div class="quick-exchange__input-row">
                <div class="quick-exchange__amount quick-exchange__amount--result">
                  {{ receiveAmount }}
                </div>
                <div class="quick-exchange__currency-select">
                  <span class="quick-exchange__flag">🇵🇪</span>
                  <select v-model="receiveCurrency" class="quick-exchange__select">
                    <option>PEN</option>
                    <option>EUR</option>
                    <option>USD</option>
                  </select>
                  <q-icon name="expand_more" size="16px" style="pointer-events:none" />
                </div>
              </div>
            </div>

            <div class="quick-exchange__rate-info">
              <q-icon name="info_outline" size="14px" />
              1 {{ sendCurrency }} = {{ quickRate.toFixed(4) }} {{ receiveCurrency }} · Sin comisión oculta
            </div>

            <button class="quick-exchange__submit">
              Confirmar intercambio
            </button>
          </div>
        </div>
      </div>

      <!-- Right: Recent transactions -->
      <div class="dashboard__right">
        <div class="xc-card dashboard__section dashboard__section--full">
          <div class="dashboard__section-header">
            <h2 class="dashboard__section-title">Transacciones recientes</h2>
            <router-link to="/history" class="dashboard__section-link">Ver todas</router-link>
          </div>

          <div class="tx-list">
            <div v-for="tx in transactions" :key="tx.id" class="tx-item">
              <div :class="['tx-item__icon', `tx-item__icon--${tx.type}`]">
                <q-icon :name="tx.icon" size="18px" />
              </div>
              <div class="tx-item__info">
                <div class="tx-item__desc">{{ tx.desc }}</div>
                <div class="tx-item__date">{{ tx.date }}</div>
              </div>
              <div class="tx-item__right">
                <div :class="['tx-item__amount', tx.positive ? 'positive' : 'negative']">
                  {{ tx.positive ? '+' : '-' }} {{ tx.amount }}
                </div>
                <div :class="['tx-item__status', `tx-item__status--${tx.status}`]">
                  {{ statusLabel(tx.status) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mini wallet card -->
        <div class="wallet-card xc-card">
          <div class="wallet-card__header">
            <div>
              <div class="wallet-card__label">Saldo total disponible</div>
              <div class="wallet-card__balance">{{ totalSaldo }}</div>
            </div>
            <div class="wallet-card__icon">
              <q-icon name="account_balance_wallet" size="22px" />
            </div>
          </div>
          <div class="wallet-card__currencies">
            <div v-for="s in billeteraSaldos" :key="s.codigoISO" class="wallet-card__currency">
              <span class="wallet-card__cur">{{ s.codigoISO }}</span>
              <span class="wallet-card__bal">{{ Number(s.saldoDisponible).toFixed(2) }}</span>
            </div>
          </div>
          <div class="wallet-card__actions">
            <button class="wallet-card__action" @click="$router.push('/wallet')">
              <q-icon name="add" size="16px" /> Depositar
            </button>
            <button class="wallet-card__action wallet-card__action--outline" @click="$router.push('/wallet')">
              <q-icon name="upload" size="16px" /> Retirar
            </button>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import api from 'src/services/api'

const authStore = useAuthStore()

const greetingName = computed(() => authStore.user?.nombreUsuario || 'Usuario')
const formattedDate = computed(() =>
  new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

// --- Billetera ---
const billeteraSaldos = ref([])
const totalSaldo = computed(() => {
  if (!billeteraSaldos.value.length) return '—'
  const pen = billeteraSaldos.value.find(s => s.codigoISO === 'PEN')
  return pen ? `S/ ${Number(pen.saldoDisponible).toFixed(2)}` : `${Number(billeteraSaldos.value[0]?.saldoDisponible ?? 0).toFixed(2)}`
})

// --- Stats ---
const stats = ref([
  { label: 'Saldo total',      value: '—',   icon: 'account_balance_wallet', color: 'blue',   trend: '—',    up: true  },
  { label: 'Órdenes activas',  value: '—',   icon: 'receipt_long',           color: 'purple', trend: '—',    up: true  },
  { label: 'Pares disponibles',value: '—',   icon: 'trending_up',            color: 'green',  trend: '—',    up: true  },
  { label: 'Tasa USD/PEN',     value: '—',   icon: 'currency_exchange',      color: 'orange', trend: '—',    up: false },
])

// --- Pairs ---
const pairs = ref([])

// --- Quick exchange ---
const sendAmount = ref('')
const sendCurrency = ref('USD')
const receiveCurrency = ref('PEN')
const quickRate = ref(3.72)

const receiveAmount = computed(() => {
  const n = parseFloat(sendAmount.value)
  if (!n || n <= 0) return '0.00'
  return (n * quickRate.value).toFixed(2)
})

function swapCurrencies() {
  const tmp = sendCurrency.value
  sendCurrency.value = receiveCurrency.value
  receiveCurrency.value = tmp
}

// --- Transactions ---
const transactions = ref([])

function txDesc(item, type) {
  if (type === 'compra') return `Compra: ${item.monedaOrigen ?? ''} → ${item.monedaDestino ?? ''}`
  if (type === 'venta') return `Venta: ${item.monedaOrigen ?? ''} → ${item.monedaDestino ?? ''}`
  if (type === 'deposito') return `Depósito en ${item.codigoISO ?? item.moneda ?? ''}`
  if (type === 'retiro') return `Retiro de ${item.codigoISO ?? item.moneda ?? ''}`
  if (type === 'orden') return `Orden #${item.ordenCompraId ?? ''}`
  if (type === 'oferta') return `Oferta #${item.ofertaVentaId ?? ''}`
  return 'Transacción'
}
function txIcon(type) {
  return { compra: 'currency_exchange', venta: 'currency_exchange', deposito: 'add_circle_outline', retiro: 'upload', orden: 'receipt_long', oferta: 'sell' }[type] ?? 'receipt'
}
function txType(type) {
  return { compra: 'exchange', venta: 'exchange', deposito: 'deposit', retiro: 'withdraw', orden: 'cancel', oferta: 'cancel' }[type] ?? 'exchange'
}
function statusLabel(s) {
  const map = { completed: 'Completado', pending: 'Pendiente', cancelled: 'Cancelado', Completada: 'Completado', Activa: 'Activo', Cancelada: 'Cancelado' }
  return map[s] ?? s
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  // Billetera + stats
  try {
    const bRes = await api.get('/api/billetera')
    billeteraSaldos.value = bRes.data.saldos ?? []
    const pen = billeteraSaldos.value.find(s => s.codigoISO === 'PEN')
    stats.value[0].value = pen ? `S/ ${Number(pen.saldoDisponible).toFixed(0)}` : '—'
  } catch { /* sin billetera */ }

  // Pares
  try {
    const pRes = await api.get('/api/preciospares')
    const raw = pRes.data ?? []
    pairs.value = raw.slice(0, 5).map(p => ({
      name: `${p.monedaEntrega}/${p.monedaObtiene}`,
      full: `${p.monedaEntrega} / ${p.monedaObtiene}`,
      flag1: '', flag2: '',
      buy: Number(p.mayorPrecioCompra ?? 0).toFixed(4),
      sell: Number(p.menorPrecioVenta ?? 0).toFixed(4),
      change: p.margen != null ? `${Number(p.margen).toFixed(2)}%` : '—',
      up: (p.margen ?? 0) >= 0,
    }))
    stats.value[2].value = raw.length.toString()
    const usdPen = raw.find(p => p.monedaEntrega === 'USD' && p.monedaObtiene === 'PEN')
    if (usdPen) {
      quickRate.value = Number(usdPen.menorPrecioVenta ?? 3.72)
      stats.value[3].value = Number(usdPen.menorPrecioVenta ?? 0).toFixed(4)
    }
  } catch { /* sin pares */ }

  // Historial (transacciones recientes)
  try {
    const hRes = await api.get('/api/historial-transacciones', { params: { pagina: 1, tamanoPagina: 5 } })
    const h = hRes.data
    const all = [
      ...(h.comprasInmediatas?.items ?? []).map(i => ({ ...i, _type: 'compra', _date: i.fechaCreacion })),
      ...(h.ventasInmediatas?.items ?? []).map(i => ({ ...i, _type: 'venta', _date: i.fechaCreacion })),
      ...(h.depositos?.items ?? []).map(i => ({ ...i, _type: 'deposito', _date: i.fechaCreacion })),
      ...(h.retiros?.items ?? []).map(i => ({ ...i, _type: 'retiro', _date: i.fechaCreacion })),
    ]
    all.sort((a, b) => new Date(b._date) - new Date(a._date))
    transactions.value = all.slice(0, 6).map((item, idx) => ({
      id: idx,
      desc: txDesc(item, item._type),
      date: formatDate(item._date),
      amount: Number(item.monto ?? item.montoDepositado ?? item.montoRetirado ?? 0).toFixed(2),
      positive: ['compra', 'deposito'].includes(item._type),
      type: txType(item._type),
      icon: txIcon(item._type),
      status: item.estado ?? 'Completada',
    }))
    stats.value[1].value = String((h.ordenesCompra?.items ?? []).filter(o => o.estado === 'Activa').length)
  } catch { /* sin historial */ }
})
</script>

<style lang="scss" scoped>
// ── Page ─────────────────────────────────────────────────
.dashboard {
  padding: 28px 32px;
  min-height: 100vh;
  background: var(--xc-bg);

  @media (max-width: 768px) { padding: 16px; }
}

// ── Header ───────────────────────────────────────────────
.dashboard__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;
}

.dashboard__title {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--xc-text);
  letter-spacing: -.03em;
  margin: 0 0 4px;
}

.dashboard__subtitle {
  font-size: .85rem;
  color: var(--xc-text-secondary);
  margin: 0;
  text-transform: capitalize;
}

.dashboard__header-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.dashboard__btn-primary,
.dashboard__btn-secondary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  border-radius: 10px;
  font-size: .85rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: filter .15s, transform .1s;

  &:hover  { filter: brightness(1.05); }
  &:active { transform: scale(.97); }
}

.dashboard__btn-primary {
  background: var(--xc-primary);
  color: #fff;
}

.dashboard__btn-secondary {
  background: var(--xc-surface);
  color: var(--xc-text);
  border: 1px solid var(--xc-border);
}

// ── Stat cards ───────────────────────────────────────────
.dashboard__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1100px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 560px)  { grid-template-columns: 1fr; }
}

.stat-card {
  background: var(--xc-surface);
  border-radius: var(--xc-radius-lg);
  border: 1px solid var(--xc-border-light);
  padding: 20px;
  box-shadow: var(--xc-shadow-sm);
}

.stat-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stat-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;

  &--blue   { background: rgba(0,122,255,.1);  color: #007AFF; }
  &--purple { background: rgba(88,86,214,.1);  color: #5856D6; }
  &--green  { background: rgba(52,199,89,.1);  color: #34C759; }
  &--orange { background: rgba(255,149,0,.1);  color: #FF9500; }
}

.stat-card__trend {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: .72rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 100px;

  &--up   { background: rgba(52,199,89,.1);  color: #34C759; }
  &--down { background: rgba(255,59,48,.1);  color: #FF3B30; }
}

.stat-card__value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--xc-text);
  letter-spacing: -.03em;
  margin-bottom: 4px;
}

.stat-card__label {
  font-size: .78rem;
  color: var(--xc-text-secondary);
  font-weight: 500;
}

// ── Main grid ────────────────────────────────────────────
.dashboard__grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  align-items: start;

  @media (max-width: 1100px) { grid-template-columns: 1fr; }
}

.dashboard__left,
.dashboard__right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

// ── Section card ─────────────────────────────────────────
.dashboard__section {
  padding: 20px;
}

.dashboard__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.dashboard__section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--xc-text);
  margin: 0;
  letter-spacing: -.01em;
}

.dashboard__section-link {
  font-size: .8rem;
  color: var(--xc-primary);
  text-decoration: none;
  font-weight: 500;
  &:hover { text-decoration: underline; }
}

.dashboard__live-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: .75rem;
  font-weight: 600;
  color: var(--xc-positive);
  background: rgba(52,199,89,.1);
  padding: 3px 10px;
  border-radius: 100px;
}

.dashboard__live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--xc-positive);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: .4; }
}

// ── Pairs table ──────────────────────────────────────────
.pairs-table {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.pairs-table__head {
  display: grid;
  grid-template-columns: 1fr 80px 80px 70px;
  padding: 6px 8px 10px;
  font-size: .7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--xc-text-tertiary);
  border-bottom: 1px solid var(--xc-border-light);
  margin-bottom: 4px;
}

.pairs-table__row {
  display: grid;
  grid-template-columns: 1fr 80px 80px 70px;
  align-items: center;
  padding: 11px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background .12s ease;

  &:hover { background: var(--xc-bg); }
}

.pairs-table__pair {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pairs-table__pair-badge {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--xc-primary-light);
  color: var(--xc-primary);
  font-size: .65rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.pairs-table__name {
  font-size: .875rem;
  font-weight: 600;
  color: var(--xc-text);
}

.pairs-table__full {
  font-size: .72rem;
  color: var(--xc-text-tertiary);
}

.pairs-table__val {
  font-size: .875rem;
  font-weight: 500;
  color: var(--xc-text);
}

.pairs-table__change {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: .78rem;
  font-weight: 600;

  &.up   { color: var(--xc-positive); }
  &.down { color: var(--xc-negative); }
}

// ── Quick exchange ────────────────────────────────────────
.quick-exchange {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-exchange__field { display: flex; flex-direction: column; gap: 6px; }

.quick-exchange__label {
  font-size: .78rem;
  font-weight: 600;
  color: var(--xc-text-secondary);
}

.quick-exchange__input-row {
  display: flex;
  align-items: center;
  background: var(--xc-bg);
  border: 1.5px solid var(--xc-border);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color .15s;

  &:focus-within { border-color: var(--xc-primary); }
}

.quick-exchange__amount {
  flex: 1;
  padding: 12px 14px;
  border: none;
  background: transparent;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--xc-text);
  outline: none;
  font-family: inherit;
  min-width: 0;

  &--result {
    display: flex;
    align-items: center;
    color: var(--xc-positive);
  }

  &::placeholder { color: var(--xc-text-tertiary); font-weight: 400; }
}

.quick-exchange__currency-select {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 12px 0 8px;
  border-left: 1px solid var(--xc-border-light);
  background: transparent;
  height: 100%;
  white-space: nowrap;
}

.quick-exchange__flag { font-size: 18px; }

.quick-exchange__select {
  border: none;
  background: transparent;
  font-size: .875rem;
  font-weight: 600;
  color: var(--xc-text);
  outline: none;
  cursor: pointer;
  appearance: none;
  font-family: inherit;
}

.quick-exchange__swap {
  align-self: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--xc-bg);
  border: 1.5px solid var(--xc-border);
  color: var(--xc-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s, transform .2s;

  &:hover { background: var(--xc-primary-light); color: var(--xc-primary); transform: rotate(180deg); }
}

.quick-exchange__rate-info {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: .78rem;
  color: var(--xc-text-tertiary);
  padding: 0 2px;
}

.quick-exchange__submit {
  width: 100%;
  padding: 13px;
  background: var(--xc-primary);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: .95rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: filter .15s, transform .1s;

  &:hover  { filter: brightness(1.08); }
  &:active { transform: scale(.98); }
}

// ── Transaction list ──────────────────────────────────────
.tx-list { display: flex; flex-direction: column; gap: 2px; }

.tx-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: background .12s;

  &:hover { background: var(--xc-bg); }
}

.tx-item__icon {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &--exchange { background: rgba(0,122,255,.1);  color: #007AFF; }
  &--deposit  { background: rgba(52,199,89,.1);  color: #34C759; }
  &--withdraw { background: rgba(255,149,0,.1);  color: #FF9500; }
  &--cancel   { background: rgba(255,59,48,.1);  color: #FF3B30; }
}

.tx-item__info { flex: 1; min-width: 0; }

.tx-item__desc {
  font-size: .875rem;
  font-weight: 500;
  color: var(--xc-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tx-item__date {
  font-size: .72rem;
  color: var(--xc-text-tertiary);
  margin-top: 2px;
}

.tx-item__right { text-align: right; flex-shrink: 0; }

.tx-item__amount {
  font-size: .875rem;
  font-weight: 600;
  &.positive { color: var(--xc-positive); }
  &.negative { color: var(--xc-negative); }
}

.tx-item__status {
  font-size: .68rem;
  font-weight: 600;
  margin-top: 2px;

  &--completed { color: var(--xc-positive); }
  &--pending   { color: var(--xc-warning); }
  &--cancelled { color: var(--xc-text-tertiary); }
}

// ── Wallet card ───────────────────────────────────────────
.wallet-card {
  padding: 20px;
  background: linear-gradient(135deg, #0055D4, #007AFF);
  border: none !important;
  color: #fff;
}

.wallet-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.wallet-card__label {
  font-size: .75rem;
  opacity: .8;
  margin-bottom: 4px;
}

.wallet-card__balance {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -.03em;
}

.wallet-card__icon {
  width: 44px;
  height: 44px;
  background: rgba(255,255,255,.18);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.wallet-card__currencies {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.wallet-card__currency {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(255,255,255,.15);
  border-radius: 8px;
  padding: 5px 10px;
}

.wallet-card__flag { font-size: 14px; }
.wallet-card__cur  { font-size: .72rem; font-weight: 700; opacity: .9; }
.wallet-card__bal  { font-size: .78rem; font-weight: 500; }

.wallet-card__actions {
  display: flex;
  gap: 10px;
}

.wallet-card__action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 9px;
  border-radius: 10px;
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  background: rgba(255,255,255,.22);
  color: #fff;
  border: none;
  transition: background .15s;

  &:hover { background: rgba(255,255,255,.3); }

  &--outline {
    background: transparent;
    border: 1.5px solid rgba(255,255,255,.4);
    &:hover { background: rgba(255,255,255,.12); }
  }
}
</style>
