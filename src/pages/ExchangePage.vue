<template>
  <q-page class="page">
    <div class="page__header">
      <div>
        <h1 class="page__title">Intercambio</h1>
        <p class="page__subtitle">Compra o vende divisas al instante</p>
      </div>
    </div>

    <div class="exchange-grid">
      <!-- Panel izquierdo: formulario -->
      <div class="xc-card exchange-form">
        <!-- Tabs -->
        <div class="exchange-form__tabs">
          <button :class="['exchange-form__tab', mode === 'compra' && 'exchange-form__tab--active']"
            @click="mode = 'compra'; resetForm()">
            <q-icon name="arrow_downward" size="16px" /> Comprar
          </button>
          <button :class="['exchange-form__tab', mode === 'venta' && 'exchange-form__tab--active']"
            @click="mode = 'venta'; resetForm()">
            <q-icon name="arrow_upward" size="16px" /> Vender
          </button>
        </div>

        <div class="exchange-form__body">
          <!-- Moneda origen -->
          <div class="exf-field">
            <label class="exf-label">{{ mode === 'compra' ? 'Pagas con' : 'Vendes' }}</label>
            <div class="exf-amount-row">
              <input v-model.number="monto" type="number" class="exf-amount" placeholder="0.00"
                min="0" step="0.01" @input="calcularResumen" />
              <div class="exf-currency-pick">
                <select v-model="monedaOrigen" class="exf-select" @change="calcularResumen">
                  <option v-for="m in monedas" :key="m.monedaId" :value="m.monedaId">
                    {{ m.codigoISO }}
                  </option>
                </select>
                <q-icon name="expand_more" size="16px" class="exf-chevron" />
              </div>
            </div>
          </div>

          <!-- Swap -->
          <div class="exf-swap-row">
            <hr class="exf-line" />
            <button class="exf-swap" @click="swapMonedas">
              <q-icon name="swap_vert" size="20px" />
            </button>
            <hr class="exf-line" />
          </div>

          <!-- Moneda destino -->
          <div class="exf-field">
            <label class="exf-label">{{ mode === 'compra' ? 'Recibes' : 'Recibes (PEN)' }}</label>
            <div class="exf-amount-row">
              <div class="exf-amount exf-amount--result">
                {{ resumen ? formatNum(resumen.montoObtenido ?? resumen.montoRecibido) : '0.00' }}
              </div>
              <div class="exf-currency-pick">
                <select v-model="monedaDestino" class="exf-select" @change="calcularResumen">
                  <option v-for="m in monedas" :key="m.monedaId" :value="m.monedaId">
                    {{ m.codigoISO }}
                  </option>
                </select>
                <q-icon name="expand_more" size="16px" class="exf-chevron" />
              </div>
            </div>
          </div>

          <!-- Resumen -->
          <transition name="fade">
            <div v-if="resumen" class="exf-summary">
              <div class="exf-summary__row">
                <span>Tasa aplicada</span>
                <span class="exf-summary__val">{{ resumen.tasaAplicada ?? resumen.tipoCambio }}</span>
              </div>
              <div class="exf-summary__row">
                <span>Comisión</span>
                <span class="exf-summary__val">{{ formatNum(resumen.comision ?? 0) }}</span>
              </div>
              <div class="exf-summary__row exf-summary__row--total">
                <span>Total</span>
                <span>{{ formatNum(resumen.totalPagado ?? resumen.montoTotal) }}</span>
              </div>
            </div>
          </transition>

          <!-- Error -->
          <transition name="fade">
            <div v-if="errorMsg" class="exf-error">
              <q-icon name="error_outline" size="16px" />{{ errorMsg }}
            </div>
          </transition>

          <!-- Botones -->
          <button v-if="!resumen" class="exf-btn-primary" :disabled="!monto || loadingCalc"
            @click="calcularResumen">
            <q-spinner v-if="loadingCalc" size="16px" color="white" />
            {{ loadingCalc ? 'Calculando...' : 'Calcular' }}
          </button>
          <div v-else class="exf-confirm-row">
            <button class="exf-btn-secondary" @click="resetForm">Cancelar</button>
            <button class="exf-btn-primary" :disabled="loadingConfirm" @click="confirmar">
              <q-spinner v-if="loadingConfirm" size="16px" color="white" />
              {{ loadingConfirm ? 'Confirmando...' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Panel derecho: pares y libro -->
      <div class="exchange-right">
        <!-- Pares de divisas -->
        <div class="xc-card exchange-pairs">
          <div class="section-header">
            <h2 class="section-title">Pares disponibles</h2>
            <span class="live-badge"><span class="live-dot"></span>En vivo</span>
          </div>
          <div v-if="loadingPares" class="exchange-pairs__loading">
            <q-spinner color="primary" size="28px" />
          </div>
          <div v-else class="pairs-list">
            <div v-for="par in pares" :key="par.parMonedaId" class="pair-row"
              @click="seleccionarPar(par)">
              <div class="pair-row__names">
                <span class="pair-row__code">{{ par.monedaEntrega }}/{{ par.monedaObtiene }}</span>
              </div>
              <div class="pair-row__prices">
                <div class="pair-row__price">
                  <span class="pair-row__price-label">Compra</span>
                  <span class="pair-row__price-val">{{ par.mayorPrecioCompra?.toFixed(4) ?? '—' }}</span>
                </div>
                <div class="pair-row__price">
                  <span class="pair-row__price-label">Venta</span>
                  <span class="pair-row__price-val">{{ par.menorPrecioVenta?.toFixed(4) ?? '—' }}</span>
                </div>
              </div>
            </div>
            <div v-if="!pares.length" class="exchange-pairs__empty">
              No hay pares disponibles en este momento
            </div>
          </div>
        </div>

        <!-- Resultado exitoso -->
        <transition name="fade">
          <div v-if="exitoso" class="xc-card exchange-success">
            <div class="exchange-success__icon"><q-icon name="check_circle" size="36px" /></div>
            <div class="exchange-success__title">¡Operación exitosa!</div>
            <div class="exchange-success__desc">Tu intercambio fue procesado correctamente.</div>
            <button class="exf-btn-primary" @click="exitoso = false; resetForm()">Nueva operación</button>
          </div>
        </transition>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from 'src/services/api'

const mode = ref('compra')
const monto = ref(null)
const monedaOrigen = ref(null)
const monedaDestino = ref(null)
const monedas = ref([])
const pares = ref([])
const resumen = ref(null)
const errorMsg = ref('')
const exitoso = ref(false)
const loadingCalc = ref(false)
const loadingConfirm = ref(false)
const loadingPares = ref(true)

function formatNum(n) { return Number(n ?? 0).toFixed(2) }

function resetForm() {
  monto.value = null; resumen.value = null; errorMsg.value = ''; exitoso.value = false
}

function swapMonedas() {
  const tmp = monedaOrigen.value; monedaOrigen.value = monedaDestino.value; monedaDestino.value = tmp
  resetForm()
}

function seleccionarPar(par) {
  const orig = monedas.value.find(m => m.codigoISO === par.monedaEntrega)
  const dest = monedas.value.find(m => m.codigoISO === par.monedaObtiene)
  if (orig) monedaOrigen.value = orig.monedaId
  if (dest) monedaDestino.value = dest.monedaId
  resetForm()
}

onMounted(async () => {
  try {
    const [mRes, pRes] = await Promise.all([
      api.get('/api/moneda'),
      api.get('/api/preciospares'),
    ])
    monedas.value = mRes.data
    pares.value = pRes.data
    if (monedas.value.length >= 2) {
      monedaOrigen.value = monedas.value[0].monedaId
      monedaDestino.value = monedas.value[1].monedaId
    }
  } catch {
    monedas.value = [
      { monedaId: 1, codigoISO: 'USD' }, { monedaId: 2, codigoISO: 'PEN' }, { monedaId: 3, codigoISO: 'EUR' },
    ]
    monedaOrigen.value = 1; monedaDestino.value = 2
  } finally { loadingPares.value = false }
})

async function calcularResumen() {
  if (!monto.value || monto.value <= 0) return
  loadingCalc.value = true; errorMsg.value = ''
  const endpoint = mode.value === 'compra' ? '/api/comprainmediata/resumen' : '/api/ventainmediata/resumen'
  try {
    const res = await api.post(endpoint, {
      monedaOrigenId: monedaOrigen.value,
      monedaDestinoId: monedaDestino.value,
      monto: monto.value,
    })
    resumen.value = res.data
  } catch (err) {
    errorMsg.value = err.response?.data?.mensaje || 'No se pudo calcular. Intenta de nuevo.'
    resumen.value = null
  } finally { loadingCalc.value = false }
}

async function confirmar() {
  loadingConfirm.value = true; errorMsg.value = ''
  const endpoint = mode.value === 'compra' ? '/api/comprainmediata/confirmar' : '/api/ventainmediata/confirmar'
  try {
    await api.post(endpoint, {
      monedaOrigenId: monedaOrigen.value,
      monedaDestinoId: monedaDestino.value,
      monto: monto.value,
    })
    exitoso.value = true; resumen.value = null
  } catch (err) {
    errorMsg.value = err.response?.data?.mensaje || 'Error al confirmar la operación.'
  } finally { loadingConfirm.value = false }
}
</script>

<style lang="scss" scoped>
.page { padding: 28px 32px; @media(max-width:768px){ padding: 16px; } }
.page__header { margin-bottom: 24px; }
.page__title { font-size:1.6rem;font-weight:700;color:var(--xc-text);letter-spacing:-.03em;margin:0 0 4px; }
.page__subtitle { font-size:.85rem;color:var(--xc-text-secondary);margin:0; }

.exchange-grid { display:grid;grid-template-columns:420px 1fr;gap:20px;align-items:start;
  @media(max-width:1000px){grid-template-columns:1fr;} }

// ── Form card ─────────────────────────────────────────────
.exchange-form { padding:0;overflow:hidden; }

.exchange-form__tabs { display:flex;border-bottom:1px solid var(--xc-border-light); }
.exchange-form__tab { flex:1;padding:14px;border:none;background:none;cursor:pointer;
  font-size:.875rem;font-weight:600;color:var(--xc-text-secondary);display:flex;
  align-items:center;justify-content:center;gap:6px;transition:color .15s,background .15s;
  &:hover{background:var(--xc-bg);color:var(--xc-text);}
  &--active{color:var(--xc-primary);border-bottom:2px solid var(--xc-primary);background:var(--xc-primary-light);} }

.exchange-form__body { padding:20px; display:flex;flex-direction:column;gap:16px; }

.exf-field { display:flex;flex-direction:column;gap:6px; }
.exf-label { font-size:.78rem;font-weight:600;color:var(--xc-text-secondary);letter-spacing:.04em;text-transform:uppercase; }
.exf-amount-row { display:flex;align-items:stretch;background:#fff;border:1.5px solid var(--xc-border);
  border-radius:12px;overflow:hidden;transition:border-color .15s;
  &:focus-within{border-color:var(--xc-primary);} }
.exf-amount { flex:1;padding:14px 16px;border:none;background:transparent;font-size:1.4rem;
  font-weight:700;color:var(--xc-text);outline:none;font-family:inherit;min-width:0;
  &::placeholder{color:var(--xc-text-tertiary);font-weight:400;font-size:1rem;}
  &--result{display:flex;align-items:center;color:var(--xc-positive);} }
.exf-currency-pick { display:flex;align-items:center;gap:4px;padding:0 14px;
  border-left:1px solid var(--xc-border-light);background:var(--xc-bg);position:relative; }
.exf-select { border:none;background:transparent;font-size:.9rem;font-weight:700;
  color:var(--xc-text);outline:none;cursor:pointer;appearance:none;
  padding-right:20px;font-family:inherit; }
.exf-chevron { position:absolute;right:10px;pointer-events:none;color:var(--xc-text-secondary); }

.exf-swap-row { display:flex;align-items:center;gap:12px; }
.exf-line { flex:1;border:none;border-top:1px dashed var(--xc-border-light); }
.exf-swap { width:36px;height:36px;border-radius:50%;background:var(--xc-bg);border:1.5px solid var(--xc-border);
  color:var(--xc-text-secondary);cursor:pointer;display:flex;align-items:center;justify-content:center;
  transition:all .2s;
  &:hover{background:var(--xc-primary-light);color:var(--xc-primary);transform:rotate(180deg);} }

.exf-summary { background:var(--xc-bg);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:8px; }
.exf-summary__row { display:flex;justify-content:space-between;font-size:.85rem;color:var(--xc-text-secondary);
  &--total{font-weight:700;color:var(--xc-text);font-size:.95rem;padding-top:8px;
    border-top:1px solid var(--xc-border-light);margin-top:4px;} }
.exf-summary__val { color:var(--xc-text); }

.exf-error { display:flex;align-items:center;gap:6px;padding:10px 14px;
  background:rgba(255,59,48,.08);border:1px solid rgba(255,59,48,.2);border-radius:10px;
  color:var(--xc-negative);font-size:.85rem; }

.exf-btn-primary { width:100%;padding:13px;background:var(--xc-primary);color:#fff;border:none;
  border-radius:12px;font-size:.95rem;font-weight:600;cursor:pointer;font-family:inherit;
  display:flex;align-items:center;justify-content:center;gap:8px;
  transition:filter .15s,transform .1s;
  &:hover:not(:disabled){filter:brightness(1.08);}
  &:active:not(:disabled){transform:scale(.98);}
  &:disabled{opacity:.45;cursor:not-allowed;} }
.exf-btn-secondary { flex:1;padding:13px;background:var(--xc-bg);color:var(--xc-text);
  border:1.5px solid var(--xc-border);border-radius:12px;font-size:.95rem;font-weight:600;
  cursor:pointer;font-family:inherit;transition:background .15s;
  &:hover{background:var(--xc-border-light);} }
.exf-confirm-row { display:flex;gap:10px; .exf-btn-primary{flex:1;} }

// ── Right panel ───────────────────────────────────────────
.exchange-right { display:flex;flex-direction:column;gap:20px; }
.exchange-pairs { padding:20px; }
.section-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:16px; }
.section-title { font-size:1rem;font-weight:600;color:var(--xc-text);margin:0; }
.live-badge { display:flex;align-items:center;gap:6px;font-size:.75rem;font-weight:600;
  color:var(--xc-positive);background:rgba(52,199,89,.1);padding:3px 10px;border-radius:100px; }
.live-dot { width:6px;height:6px;border-radius:50%;background:var(--xc-positive);
  animation:pulse 1.5s ease-in-out infinite; }
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
.exchange-pairs__loading { display:flex;justify-content:center;padding:24px; }
.exchange-pairs__empty { text-align:center;color:var(--xc-text-secondary);padding:20px;font-size:.875rem; }

.pairs-list { display:flex;flex-direction:column;gap:2px; }
.pair-row { display:flex;align-items:center;justify-content:space-between;padding:10px 8px;
  border-radius:10px;cursor:pointer;transition:background .12s;
  &:hover{background:var(--xc-bg);} }
.pair-row__code { font-size:.875rem;font-weight:700;color:var(--xc-text); }
.pair-row__prices { display:flex;gap:20px; }
.pair-row__price { display:flex;flex-direction:column;align-items:flex-end;gap:2px; }
.pair-row__price-label { font-size:.68rem;color:var(--xc-text-tertiary);text-transform:uppercase;letter-spacing:.04em; }
.pair-row__price-val { font-size:.85rem;font-weight:600;color:var(--xc-text); }

.exchange-success { padding:32px;display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center; }
.exchange-success__icon { color:var(--xc-positive);margin-bottom:4px; }
.exchange-success__title { font-size:1.1rem;font-weight:700;color:var(--xc-text); }
.exchange-success__desc { font-size:.875rem;color:var(--xc-text-secondary); }

.fade-enter-active,.fade-leave-active{transition:opacity .2s;}
.fade-enter-from,.fade-leave-to{opacity:0;}
</style>
