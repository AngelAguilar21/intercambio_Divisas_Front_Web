<template>
  <q-page class="page">
    <div class="page__header">
      <h1 class="page__title">Órdenes y Ofertas</h1>
      <p class="page__subtitle">Crea y gestiona tus órdenes de compra y ofertas de venta</p>
    </div>

    <!-- Tabs principales -->
    <div class="xc-card tab-card">
      <div class="tabs-bar">
        <button :class="['tab-btn', mainTab === 'ordenes' && 'tab-btn--active']" @click="mainTab = 'ordenes'">
          <q-icon name="shopping_cart" size="16px" /> Órdenes de compra
        </button>
        <button :class="['tab-btn', mainTab === 'ofertas' && 'tab-btn--active']" @click="mainTab = 'ofertas'">
          <q-icon name="sell" size="16px" /> Ofertas de venta
        </button>
      </div>

      <!-- ÓRDENES -->
      <div v-if="mainTab === 'ordenes'" class="tab-content">
        <div class="section-header">
          <span class="section-title">Mis órdenes activas</span>
          <button class="btn-create" @click="showCreateOrden = !showCreateOrden">
            <q-icon name="add" size="16px" /> Nueva orden
          </button>
        </div>

        <!-- Formulario crear orden -->
        <transition name="slide">
          <div v-if="showCreateOrden" class="create-form">
            <h3 class="create-form__title">Nueva orden de compra</h3>
            <div class="create-form__grid">
              <div class="form-group">
                <label class="form-label">Par de monedas</label>
                <select v-model="ordenForm.parMonedaId" class="form-input">
                  <option value="" disabled>Seleccionar par</option>
                  <option v-for="p in pares" :key="p.parMonedaId" :value="p.parMonedaId">
                    {{ p.monedaEntrega }}/{{ p.monedaObtiene }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Cantidad</label>
                <input v-model.number="ordenForm.cantidad" type="number" class="form-input" placeholder="0.00" min="0" step="0.01" />
              </div>
              <div class="form-group">
                <label class="form-label">Precio unitario</label>
                <input v-model.number="ordenForm.precioUnitario" type="number" class="form-input" placeholder="0.00" min="0" step="0.0001" />
              </div>
              <div class="form-group">
                <label class="form-label">Vigencia (horas)</label>
                <select v-model.number="ordenForm.vigenciaHoras" class="form-input">
                  <option :value="1">1 hora</option>
                  <option :value="6">6 horas</option>
                  <option :value="12">12 horas</option>
                  <option :value="24">24 horas</option>
                  <option :value="48">48 horas</option>
                  <option :value="72">72 horas</option>
                </select>
              </div>
            </div>
            <transition name="fade">
              <div v-if="ordenError" class="form-error"><q-icon name="error_outline" size="14px" />{{ ordenError }}</div>
            </transition>
            <div class="create-form__actions">
              <button class="btn-cancel" @click="showCreateOrden = false; ordenError = ''">Cancelar</button>
              <button class="btn-submit" :disabled="loadingOrden || !ordenForm.parMonedaId" @click="crearOrden">
                <q-spinner v-if="loadingOrden" size="14px" color="white" /> {{ loadingOrden ? 'Creando...' : 'Crear orden' }}
              </button>
            </div>
          </div>
        </transition>

        <!-- Lista órdenes -->
        <div v-if="loadingOrdenes" class="loading-center"><q-spinner color="primary" size="32px" /></div>
        <div v-else-if="ordenes.length === 0" class="empty-state">
          <q-icon name="shopping_cart" size="40px" color="grey-4" />
          <p>No tienes órdenes de compra activas.</p>
        </div>
        <div v-else class="orders-list">
          <div v-for="o in ordenes" :key="o.ordenCompraId" class="order-item">
            <div class="order-item__left">
              <span class="order-item__badge order-item__badge--buy">COMPRA</span>
              <div>
                <div class="order-item__pair">{{ o.parMoneda || 'Par desconocido' }}</div>
                <div class="order-item__date">{{ formatDate(o.fechaCreacion) }}</div>
              </div>
            </div>
            <div class="order-item__right">
              <div class="order-item__qty">{{ o.cantidad }} uds.</div>
              <div class="order-item__price">@ {{ o.precioUnitario }}</div>
              <span :class="['order-item__status', `order-item__status--${(o.estado || '').toLowerCase()}`]">{{ o.estado }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- OFERTAS -->
      <div v-if="mainTab === 'ofertas'" class="tab-content">
        <div class="section-header">
          <span class="section-title">Mis ofertas de venta</span>
          <button class="btn-create" @click="showCreateOferta = !showCreateOferta">
            <q-icon name="add" size="16px" /> Nueva oferta
          </button>
        </div>

        <!-- Formulario crear oferta -->
        <transition name="slide">
          <div v-if="showCreateOferta" class="create-form">
            <h3 class="create-form__title">Nueva oferta de venta</h3>
            <div class="create-form__grid">
              <div class="form-group">
                <label class="form-label">Par de monedas</label>
                <select v-model="ofertaForm.parMonedaId" class="form-input">
                  <option value="" disabled>Seleccionar par</option>
                  <option v-for="p in pares" :key="p.parMonedaId" :value="p.parMonedaId">
                    {{ p.monedaEntrega }}/{{ p.monedaObtiene }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Cantidad a vender</label>
                <input v-model.number="ofertaForm.cantidad" type="number" class="form-input" placeholder="0.00" min="0" step="0.01" />
              </div>
              <div class="form-group">
                <label class="form-label">Precio por unidad</label>
                <input v-model.number="ofertaForm.precioUnitario" type="number" class="form-input" placeholder="0.00" min="0" step="0.0001" />
              </div>
              <div class="form-group">
                <label class="form-label">Vigencia (horas)</label>
                <select v-model.number="ofertaForm.vigenciaHoras" class="form-input">
                  <option :value="1">1 hora</option>
                  <option :value="6">6 horas</option>
                  <option :value="12">12 horas</option>
                  <option :value="24">24 horas</option>
                  <option :value="48">48 horas</option>
                  <option :value="72">72 horas</option>
                </select>
              </div>
            </div>
            <transition name="fade">
              <div v-if="ofertaError" class="form-error"><q-icon name="error_outline" size="14px" />{{ ofertaError }}</div>
            </transition>
            <div class="create-form__actions">
              <button class="btn-cancel" @click="showCreateOferta = false; ofertaError = ''">Cancelar</button>
              <button class="btn-submit" :disabled="loadingOferta || !ofertaForm.parMonedaId" @click="crearOferta">
                <q-spinner v-if="loadingOferta" size="14px" color="white" /> {{ loadingOferta ? 'Creando...' : 'Crear oferta' }}
              </button>
            </div>
          </div>
        </transition>

        <!-- Lista ofertas -->
        <div v-if="loadingOfertas" class="loading-center"><q-spinner color="primary" size="32px" /></div>
        <div v-else-if="ofertas.length === 0" class="empty-state">
          <q-icon name="sell" size="40px" color="grey-4" />
          <p>No tienes ofertas de venta activas.</p>
        </div>
        <div v-else class="orders-list">
          <div v-for="o in ofertas" :key="o.ofertaVentaId" class="order-item">
            <div class="order-item__left">
              <span class="order-item__badge order-item__badge--sell">VENTA</span>
              <div>
                <div class="order-item__pair">{{ o.parMoneda || 'Par desconocido' }}</div>
                <div class="order-item__date">{{ formatDate(o.fechaCreacion) }}</div>
              </div>
            </div>
            <div class="order-item__right">
              <div class="order-item__qty">{{ o.cantidad }} uds.</div>
              <div class="order-item__price">@ {{ o.precioUnitario }}</div>
              <span :class="['order-item__status', `order-item__status--${(o.estado || '').toLowerCase()}`]">{{ o.estado }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from 'src/services/api'

const mainTab = ref('ordenes')
const loadingOrdenes = ref(true)
const loadingOfertas = ref(true)
const loadingOrden = ref(false)
const loadingOferta = ref(false)
const ordenes = ref([])
const ofertas = ref([])
const pares = ref([])
const showCreateOrden = ref(false)
const showCreateOferta = ref(false)
const ordenError = ref('')
const ofertaError = ref('')

const ordenForm = reactive({ parMonedaId: '', cantidad: null, precioUnitario: null, vigenciaHoras: 24 })
const ofertaForm = reactive({ parMonedaId: '', cantidad: null, precioUnitario: null, vigenciaHoras: 24 })

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  try {
    const paresRes = await api.get('/api/preciospares')
    pares.value = paresRes.data
  } catch { /* sin pares */ }
  try {
    const res = await api.get('/api/ordenes')
    ordenes.value = res.data?.items ?? res.data ?? []
  } catch { ordenes.value = [] } finally { loadingOrdenes.value = false }
  try {
    const res = await api.get('/api/ofertas')
    ofertas.value = res.data?.items ?? res.data ?? []
  } catch { ofertas.value = [] } finally { loadingOfertas.value = false }
})

async function crearOrden() {
  ordenError.value = ''; loadingOrden.value = true
  try {
    const res = await api.post('/api/ordenes', {
      parMonedaId: ordenForm.parMonedaId,
      cantidad: ordenForm.cantidad,
      precioUnitario: ordenForm.precioUnitario,
      vigenciaHoras: ordenForm.vigenciaHoras,
    })
    ordenes.value.unshift(res.data)
    showCreateOrden.value = false
    Object.assign(ordenForm, { parMonedaId: '', cantidad: null, precioUnitario: null, vigenciaHoras: 24 })
  } catch (err) { ordenError.value = err.response?.data?.mensaje || 'Error al crear la orden.' }
  finally { loadingOrden.value = false }
}

async function crearOferta() {
  ofertaError.value = ''; loadingOferta.value = true
  try {
    const res = await api.post('/api/ofertas', {
      parMonedaId: ofertaForm.parMonedaId,
      cantidad: ofertaForm.cantidad,
      precioUnitario: ofertaForm.precioUnitario,
      vigenciaHoras: ofertaForm.vigenciaHoras,
    })
    ofertas.value.unshift(res.data)
    showCreateOferta.value = false
    Object.assign(ofertaForm, { parMonedaId: '', cantidad: null, precioUnitario: null, vigenciaHoras: 24 })
  } catch (err) { ofertaError.value = err.response?.data?.mensaje || 'Error al crear la oferta.' }
  finally { loadingOferta.value = false }
}
</script>

<style lang="scss" scoped>
.page { padding:28px 32px; @media(max-width:768px){padding:16px;} }
.page__header { margin-bottom:24px; }
.page__title { font-size:1.6rem;font-weight:700;color:var(--xc-text);letter-spacing:-.03em;margin:0 0 4px; }
.page__subtitle { font-size:.85rem;color:var(--xc-text-secondary);margin:0; }
.tab-card { padding:0;overflow:hidden; }
.tabs-bar { display:flex;border-bottom:1px solid var(--xc-border-light); }
.tab-btn { flex:1;padding:14px;border:none;background:none;cursor:pointer;font-size:.875rem;
  font-weight:600;color:var(--xc-text-secondary);display:flex;align-items:center;justify-content:center;
  gap:8px;transition:all .15s;
  &:hover{background:var(--xc-bg);}
  &--active{color:var(--xc-primary);border-bottom:2px solid var(--xc-primary);background:var(--xc-primary-light);} }
.tab-content { padding:20px; }
.section-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:16px; }
.section-title { font-size:1rem;font-weight:700;color:var(--xc-text); }
.btn-create { display:flex;align-items:center;gap:6px;padding:8px 16px;background:var(--xc-primary);
  color:#fff;border:none;border-radius:9px;font-size:.85rem;font-weight:600;cursor:pointer;font-family:inherit;
  transition:filter .15s;&:hover{filter:brightness(1.08);} }
.create-form { background:var(--xc-bg);border-radius:14px;padding:20px;margin-bottom:20px;border:1px solid var(--xc-border-light); }
.create-form__title { font-size:.95rem;font-weight:700;color:var(--xc-text);margin:0 0 16px; }
.create-form__grid { display:grid;grid-template-columns:1fr 1fr;gap:14px;@media(max-width:520px){grid-template-columns:1fr;} }
.create-form__actions { display:flex;gap:10px;margin-top:16px; }
.form-group { display:flex;flex-direction:column;gap:5px; }
.form-label { font-size:.78rem;font-weight:600;color:var(--xc-text);letter-spacing:.01em; }
.form-input { padding:10px 12px;border:1.5px solid var(--xc-border);border-radius:9px;font-size:.9rem;
  color:var(--xc-text);background:#fff;outline:none;font-family:inherit;appearance:none;
  transition:border-color .15s;&:focus{border-color:var(--xc-primary);box-shadow:0 0 0 3px rgba(0,122,255,.15);} }
.form-error { display:flex;align-items:center;gap:6px;padding:8px 12px;background:rgba(255,59,48,.08);
  border:1px solid rgba(255,59,48,.2);border-radius:8px;color:var(--xc-negative);font-size:.82rem;margin-top:8px; }
.btn-submit { flex:1;padding:10px 20px;background:var(--xc-primary);color:#fff;border:none;border-radius:9px;
  font-size:.875rem;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;
  justify-content:center;gap:6px;transition:filter .15s;
  &:hover:not(:disabled){filter:brightness(1.08);}
  &:disabled{opacity:.45;cursor:not-allowed;} }
.btn-cancel { padding:10px 20px;background:var(--xc-bg);color:var(--xc-text);border:1.5px solid var(--xc-border);
  border-radius:9px;font-size:.875rem;font-weight:600;cursor:pointer;font-family:inherit;
  &:hover{background:var(--xc-border-light);} }
.loading-center { display:flex;justify-content:center;padding:32px; }
.empty-state { display:flex;flex-direction:column;align-items:center;gap:8px;padding:40px;
  color:var(--xc-text-secondary);font-size:.875rem; }
.orders-list { display:flex;flex-direction:column;gap:10px; }
.order-item { display:flex;align-items:center;justify-content:space-between;padding:14px 16px;
  background:var(--xc-bg);border-radius:12px;border:1px solid var(--xc-border-light); }
.order-item__left { display:flex;align-items:center;gap:12px; }
.order-item__badge { padding:3px 8px;border-radius:6px;font-size:.7rem;font-weight:700;letter-spacing:.04em;
  &--buy{background:rgba(0,122,255,.12);color:var(--xc-primary);}
  &--sell{background:rgba(255,59,48,.1);color:var(--xc-negative);} }
.order-item__pair { font-size:.9rem;font-weight:600;color:var(--xc-text); }
.order-item__date { font-size:.75rem;color:var(--xc-text-secondary); }
.order-item__right { display:flex;align-items:center;gap:12px; }
.order-item__qty { font-size:.875rem;font-weight:600;color:var(--xc-text); }
.order-item__price { font-size:.8rem;color:var(--xc-text-secondary); }
.order-item__status { padding:3px 8px;border-radius:6px;font-size:.72rem;font-weight:600;
  &--activa,&--activo,&--pendiente{background:rgba(255,149,0,.12);color:var(--xc-warning);}
  &--completada,&--completado{background:rgba(52,199,89,.12);color:var(--xc-positive);}
  &--cancelada,&--cancelado,&--expirada,&--expirado{background:rgba(142,142,147,.12);color:var(--xc-text-secondary);} }
.fade-enter-active,.fade-leave-active{transition:opacity .2s;}
.fade-enter-from,.fade-leave-to{opacity:0;}
.slide-enter-active,.slide-leave-active{transition:all .25s;}
.slide-enter-from,.slide-leave-to{opacity:0;transform:translateY(-10px);}
</style>
