<template>
  <q-page class="page">
    <div class="page__header">
      <h1 class="page__title">Billetera</h1>
      <p class="page__subtitle">Gestiona tus saldos, depósitos y retiros</p>
    </div>

    <!-- Saldos -->
    <div v-if="loadingBilletera" class="loading-center"><q-spinner color="primary" size="36px" /></div>
    <div v-else class="wallet-balances">
      <div v-for="saldo in billetera.saldos" :key="saldo.monedaId" class="balance-card">
        <div class="balance-card__top">
          <div class="balance-card__icon">
            <q-icon name="account_balance_wallet" size="20px" />
          </div>
          <span class="balance-card__code">{{ saldo.codigoISO }}</span>
        </div>
        <div class="balance-card__amount">{{ formatNum(saldo.saldoDisponible) }}</div>
        <div class="balance-card__label">{{ saldo.nombre }}</div>
      </div>
      <div v-if="!billetera.saldos?.length" class="balance-card balance-card--empty">
        <q-icon name="account_balance_wallet" size="28px" color="grey-4" />
        <p>Sin saldo disponible</p>
      </div>
    </div>

    <!-- Tabs operaciones -->
    <div class="xc-card wallet-ops">
      <div class="wallet-ops__tabs">
        <button :class="['wallet-ops__tab', tab === 'deposito' && 'wallet-ops__tab--active']"
          @click="tab = 'deposito'; resetOp()">
          <q-icon name="add_circle_outline" size="18px" /> Depositar
        </button>
        <button :class="['wallet-ops__tab', tab === 'retiro' && 'wallet-ops__tab--active']"
          @click="tab = 'retiro'; resetOp()">
          <q-icon name="upload" size="18px" /> Retirar
        </button>
      </div>

      <div class="wallet-ops__body">
        <!-- Depósito -->
        <div v-if="tab === 'deposito'">
          <div class="op-form">
            <div class="op-form__row">
              <div class="op-form__group">
                <label class="op-form__label">Moneda</label>
                <select v-model="opForm.monedaId" class="op-form__input" @change="resetOp(false)">
                  <option v-for="m in monedas" :key="m.monedaId" :value="m.monedaId">{{ m.codigoISO }} — {{ m.nombre }}</option>
                </select>
              </div>
              <div class="op-form__group">
                <label class="op-form__label">Método de pago</label>
                <select v-model="opForm.metodoPagoId" class="op-form__input">
                  <option v-for="mp in metodosPago" :key="mp.metodoPagoId" :value="mp.metodoPagoId">
                    {{ mp.nombre }} ({{ mp.comisionPorcentaje }}%)
                  </option>
                </select>
              </div>
            </div>
            <div class="op-form__group">
              <label class="op-form__label">Monto a depositar</label>
              <div class="op-form__amount-wrap">
                <input v-model.number="opForm.monto" type="number" class="op-form__amount"
                  placeholder="0.00" min="0" step="0.01" />
                <span class="op-form__currency">{{ monedaSeleccionada?.codigoISO }}</span>
              </div>
            </div>

            <transition name="fade">
              <div v-if="opResumen" class="op-resumen">
                <div class="op-resumen__row"><span>Monto</span><span>{{ formatNum(opResumen.montoDepositado) }} {{ opResumen.codigoISO }}</span></div>
                <div class="op-resumen__row"><span>Comisión</span><span>{{ formatNum(opResumen.comisionAplicada) }}</span></div>
                <div class="op-resumen__row op-resumen__row--total"><span>Total a pagar</span><span>{{ formatNum(opResumen.totalPagado) }}</span></div>
              </div>
            </transition>

            <transition name="fade">
              <div v-if="errorMsg" class="op-error"><q-icon name="error_outline" size="16px" />{{ errorMsg }}</div>
            </transition>
            <transition name="fade">
              <div v-if="successMsg" class="op-success"><q-icon name="check_circle_outline" size="16px" />{{ successMsg }}</div>
            </transition>

            <div class="op-form__actions">
              <button v-if="!opResumen" class="op-btn-primary" :disabled="!opForm.monto || loadingCalc" @click="calcular">
                <q-spinner v-if="loadingCalc" size="16px" color="white" />{{ loadingCalc ? 'Calculando...' : 'Calcular' }}
              </button>
              <template v-else>
                <button class="op-btn-secondary" @click="resetOp()">Cancelar</button>
                <button class="op-btn-primary" :disabled="loadingConfirm" @click="confirmarDeposito">
                  <q-spinner v-if="loadingConfirm" size="16px" color="white" />{{ loadingConfirm ? 'Procesando...' : 'Confirmar depósito' }}
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- Retiro -->
        <div v-if="tab === 'retiro'">
          <div class="op-form">
            <div class="op-form__row">
              <div class="op-form__group">
                <label class="op-form__label">Moneda</label>
                <select v-model="opForm.monedaId" class="op-form__input" @change="resetOp(false)">
                  <option v-for="m in monedas" :key="m.monedaId" :value="m.monedaId">{{ m.codigoISO }} — {{ m.nombre }}</option>
                </select>
              </div>
              <div class="op-form__group">
                <label class="op-form__label">Método de cobro</label>
                <select v-model="opForm.metodoPagoId" class="op-form__input">
                  <option v-for="mp in metodosCobro" :key="mp.metodoPagoId" :value="mp.metodoPagoId">
                    {{ mp.nombre }} ({{ mp.comisionPorcentaje }}%)
                  </option>
                </select>
              </div>
            </div>
            <div class="op-form__group">
              <label class="op-form__label">Monto a retirar</label>
              <div class="op-form__amount-wrap">
                <input v-model.number="opForm.monto" type="number" class="op-form__amount"
                  placeholder="0.00" min="0" step="0.01" />
                <span class="op-form__currency">{{ monedaSeleccionada?.codigoISO }}</span>
              </div>
            </div>

            <transition name="fade">
              <div v-if="opResumen" class="op-resumen">
                <div class="op-resumen__row"><span>Monto</span><span>{{ formatNum(opResumen.montoRetirado) }} {{ opResumen.codigoISO }}</span></div>
                <div class="op-resumen__row"><span>Comisión</span><span>{{ formatNum(opResumen.comisionAplicada) }}</span></div>
                <div class="op-resumen__row op-resumen__row--total"><span>Recibes</span><span>{{ formatNum(opResumen.montoFinalRecibido) }}</span></div>
                <div class="op-resumen__row"><span>Saldo disponible</span><span>{{ formatNum(opResumen.saldoDisponible) }}</span></div>
              </div>
            </transition>

            <transition name="fade">
              <div v-if="errorMsg" class="op-error"><q-icon name="error_outline" size="16px" />{{ errorMsg }}</div>
            </transition>
            <transition name="fade">
              <div v-if="successMsg" class="op-success"><q-icon name="check_circle_outline" size="16px" />{{ successMsg }}</div>
            </transition>

            <div class="op-form__actions">
              <button v-if="!opResumen" class="op-btn-primary" :disabled="!opForm.monto || loadingCalc" @click="calcular">
                <q-spinner v-if="loadingCalc" size="16px" color="white" />{{ loadingCalc ? 'Calculando...' : 'Calcular' }}
              </button>
              <template v-else>
                <button class="op-btn-secondary" @click="resetOp()">Cancelar</button>
                <button class="op-btn-primary" :disabled="loadingConfirm" @click="confirmarRetiro">
                  <q-spinner v-if="loadingConfirm" size="16px" color="white" />{{ loadingConfirm ? 'Procesando...' : 'Confirmar retiro' }}
                </button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from 'src/services/api'

const tab = ref('deposito')
const loadingBilletera = ref(true)
const loadingCalc = ref(false)
const loadingConfirm = ref(false)
const billetera = ref({ saldos: [] })
const monedas = ref([])
const metodosPago = ref([])
const metodosCobro = ref([])
const opResumen = ref(null)
const errorMsg = ref('')
const successMsg = ref('')

const opForm = reactive({ monedaId: null, metodoPagoId: null, monto: null })

const monedaSeleccionada = computed(() => monedas.value.find(m => m.monedaId === opForm.monedaId))

function formatNum(n) { return Number(n ?? 0).toFixed(2) }

function resetOp(clearForm = true) {
  opResumen.value = null; errorMsg.value = ''; successMsg.value = ''
  if (clearForm) { opForm.monto = null }
}

onMounted(async () => {
  try {
    const [bRes, mRes, mpRes, mcRes] = await Promise.all([
      api.get('/api/billetera'),
      api.get('/api/moneda'),
      api.get('/api/deposito/metodos-pago'),
      api.get('/api/retiro/metodos-cobro'),
    ])
    billetera.value = bRes.data
    monedas.value = mRes.data
    metodosPago.value = mpRes.data
    metodosCobro.value = mcRes.data
    if (monedas.value.length) opForm.monedaId = monedas.value[0].monedaId
    if (metodosPago.value.length) opForm.metodoPagoId = metodosPago.value[0].metodoPagoId
  } catch {
    monedas.value = [{ monedaId: 1, codigoISO: 'USD', nombre: 'Dólar' }, { monedaId: 2, codigoISO: 'PEN', nombre: 'Sol' }]
    opForm.monedaId = 1
    metodosPago.value = [{ metodoPagoId: 1, nombre: 'Transferencia bancaria', comisionPorcentaje: 0.5 }]
    metodosCobro.value = [{ metodoPagoId: 1, nombre: 'Cuenta bancaria', comisionPorcentaje: 1.0 }]
    opForm.metodoPagoId = 1
  } finally { loadingBilletera.value = false }
})

async function calcular() {
  loadingCalc.value = true; errorMsg.value = ''
  const endpoint = tab.value === 'deposito' ? '/api/deposito/calcular' : '/api/retiro/calcular'
  try {
    const res = await api.post(endpoint, { monedaId: opForm.monedaId, metodoPagoId: opForm.metodoPagoId, monto: opForm.monto })
    opResumen.value = res.data
  } catch (err) {
    errorMsg.value = err.response?.data?.mensaje || 'Error al calcular.'
  } finally { loadingCalc.value = false }
}

async function confirmarDeposito() {
  loadingConfirm.value = true; errorMsg.value = ''
  try {
    await api.post('/api/deposito', { monedaId: opForm.monedaId, metodoPagoId: opForm.metodoPagoId, monto: opForm.monto })
    successMsg.value = '¡Depósito registrado correctamente! Se actualizará tu saldo en breve.'
    resetOp(); const res = await api.get('/api/billetera'); billetera.value = res.data
  } catch (err) {
    errorMsg.value = err.response?.data?.mensaje || 'Error al procesar el depósito.'
  } finally { loadingConfirm.value = false }
}

async function confirmarRetiro() {
  loadingConfirm.value = true; errorMsg.value = ''
  try {
    await api.post('/api/retiro', { monedaId: opForm.monedaId, metodoPagoId: opForm.metodoPagoId, monto: opForm.monto })
    successMsg.value = '¡Retiro solicitado correctamente! Se procesará en breve.'
    resetOp(); const res = await api.get('/api/billetera'); billetera.value = res.data
  } catch (err) {
    errorMsg.value = err.response?.data?.mensaje || 'Error al procesar el retiro.'
  } finally { loadingConfirm.value = false }
}
</script>

<style lang="scss" scoped>
.page { padding:28px 32px; @media(max-width:768px){padding:16px;} }
.page__header { margin-bottom:24px; }
.page__title { font-size:1.6rem;font-weight:700;color:var(--xc-text);letter-spacing:-.03em;margin:0 0 4px; }
.page__subtitle { font-size:.85rem;color:var(--xc-text-secondary);margin:0; }
.loading-center { display:flex;justify-content:center;padding:40px; }

.wallet-balances { display:flex;gap:16px;flex-wrap:wrap;margin-bottom:24px; }
.balance-card { background:#fff;border-radius:var(--xc-radius-lg);border:1px solid var(--xc-border-light);
  padding:20px;min-width:160px;box-shadow:var(--xc-shadow-sm);
  &--empty{display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--xc-text-secondary);
    font-size:.875rem;padding:28px 20px;} }
.balance-card__top { display:flex;align-items:center;gap:8px;margin-bottom:12px; }
.balance-card__icon { width:36px;height:36px;background:var(--xc-primary-light);border-radius:10px;
  display:flex;align-items:center;justify-content:center;color:var(--xc-primary); }
.balance-card__code { font-size:.8rem;font-weight:700;color:var(--xc-text-secondary);letter-spacing:.04em; }
.balance-card__amount { font-size:1.4rem;font-weight:700;color:var(--xc-text);letter-spacing:-.02em; }
.balance-card__label { font-size:.75rem;color:var(--xc-text-secondary);margin-top:2px; }

.wallet-ops { padding:0;overflow:hidden; }
.wallet-ops__tabs { display:flex;border-bottom:1px solid var(--xc-border-light); }
.wallet-ops__tab { flex:1;padding:14px;border:none;background:none;cursor:pointer;font-size:.875rem;
  font-weight:600;color:var(--xc-text-secondary);display:flex;align-items:center;justify-content:center;
  gap:8px;transition:all .15s;
  &:hover{background:var(--xc-bg);}
  &--active{color:var(--xc-primary);border-bottom:2px solid var(--xc-primary);background:var(--xc-primary-light);} }
.wallet-ops__body { padding:24px; }

.op-form { display:flex;flex-direction:column;gap:18px;max-width:560px; }
.op-form__row { display:grid;grid-template-columns:1fr 1fr;gap:16px;
  @media(max-width:520px){grid-template-columns:1fr;} }
.op-form__group { display:flex;flex-direction:column;gap:6px; }
.op-form__label { font-size:.78rem;font-weight:600;color:var(--xc-text);letter-spacing:.01em; }
.op-form__input { padding:11px 14px;border:1.5px solid var(--xc-border);border-radius:9px;
  font-size:.9rem;color:var(--xc-text);background:#fff;outline:none;font-family:inherit;
  transition:border-color .15s,box-shadow .15s;appearance:none;cursor:pointer;
  &:focus{border-color:var(--xc-primary);box-shadow:0 0 0 3px rgba(0,122,255,.15);} }
.op-form__amount-wrap { position:relative;display:flex;align-items:center; }
.op-form__amount { width:100%;padding:13px 60px 13px 14px;border:1.5px solid var(--xc-border);
  border-radius:9px;font-size:1.1rem;font-weight:600;color:var(--xc-text);background:#fff;outline:none;
  font-family:inherit;transition:border-color .15s,box-shadow .15s;
  &:focus{border-color:var(--xc-primary);box-shadow:0 0 0 3px rgba(0,122,255,.15);} }
.op-form__currency { position:absolute;right:14px;font-size:.8rem;font-weight:700;
  color:var(--xc-text-secondary); }
.op-form__actions { display:flex;gap:10px; }

.op-resumen { background:var(--xc-bg);border-radius:12px;padding:16px;display:flex;flex-direction:column;gap:10px; }
.op-resumen__row { display:flex;justify-content:space-between;font-size:.875rem;color:var(--xc-text-secondary);
  &--total{font-weight:700;color:var(--xc-text);padding-top:10px;border-top:1px solid var(--xc-border-light);margin-top:4px;} }
.op-error { display:flex;align-items:center;gap:6px;padding:10px 14px;background:rgba(255,59,48,.08);
  border:1px solid rgba(255,59,48,.2);border-radius:10px;color:var(--xc-negative);font-size:.85rem; }
.op-success { display:flex;align-items:center;gap:6px;padding:10px 14px;background:rgba(52,199,89,.08);
  border:1px solid rgba(52,199,89,.2);border-radius:10px;color:var(--xc-positive);font-size:.85rem; }
.op-btn-primary { flex:1;padding:12px 20px;background:var(--xc-primary);color:#fff;border:none;border-radius:10px;
  font-size:.9rem;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;
  justify-content:center;gap:6px;transition:filter .15s;
  &:hover:not(:disabled){filter:brightness(1.08);}
  &:disabled{opacity:.45;cursor:not-allowed;} }
.op-btn-secondary { padding:12px 20px;background:var(--xc-bg);color:var(--xc-text);border:1.5px solid var(--xc-border);
  border-radius:10px;font-size:.9rem;font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s;
  &:hover{background:var(--xc-border-light);} }
.fade-enter-active,.fade-leave-active{transition:opacity .2s;}
.fade-enter-from,.fade-leave-to{opacity:0;}
</style>
