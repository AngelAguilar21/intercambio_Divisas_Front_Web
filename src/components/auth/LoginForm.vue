<template>
  <div class="auth-page">
    <!-- Left panel -->
    <div class="auth-page__brand">
      <div class="auth-page__brand-content">
        <div class="auth-page__logo"><span>X</span></div>
        <h1 class="auth-page__brand-name">X-Chang</h1>
        <p class="auth-page__tagline">Intercambia divisas de forma rápida,<br />segura y transparente.</p>
        <div class="auth-page__features">
          <div v-for="f in features" :key="f.text" class="auth-page__feature">
            <div class="auth-page__feature-icon"><q-icon :name="f.icon" size="18px" /></div>
            <span>{{ f.text }}</span>
          </div>
        </div>
      </div>
      <div class="auth-page__rates">
        <div v-for="rate in rates" :key="rate.pair" class="auth-page__rate-card">
          <div class="auth-page__rate-pair">{{ rate.pair }}</div>
          <div class="auth-page__rate-value">{{ rate.value }}</div>
          <div :class="['auth-page__rate-change', rate.up ? 'up' : 'down']">
            <q-icon :name="rate.up ? 'arrow_upward' : 'arrow_downward'" size="12px" />{{ rate.change }}
          </div>
        </div>
      </div>
    </div>

    <!-- Right panel -->
    <div class="auth-page__form-panel">
      <div class="auth-page__form-wrap">
        <div class="auth-page__form-header">
          <h2 class="auth-page__form-title">Bienvenido de vuelta</h2>
          <p class="auth-page__form-subtitle">Ingresa tu usuario/correo y contraseña</p>
        </div>

        <form @submit.prevent="submitLogin" class="auth-form">
          <div class="auth-form__group">
            <label class="auth-form__label">Usuario o correo electrónico</label>
            <div class="auth-form__input-wrap">
              <q-icon name="person_outline" size="18px" class="auth-form__icon" />
              <input v-model="form.identificadorAcceso" type="text" class="auth-form__input"
                placeholder="tu@correo.com o usuario" autocomplete="username" required />
            </div>
          </div>

          <div class="auth-form__group">
            <div class="auth-form__label-row">
              <label class="auth-form__label">Contraseña</label>
              <a href="#" class="auth-form__forgot">¿Olvidaste tu contraseña?</a>
            </div>
            <div class="auth-form__input-wrap">
              <q-icon name="lock_outline" size="18px" class="auth-form__icon" />
              <input v-model="form.password" :type="showPw ? 'text' : 'password'"
                class="auth-form__input auth-form__input--padded-right"
                placeholder="••••••••" autocomplete="current-password" required />
              <button type="button" class="auth-form__toggle-pw" @click="showPw = !showPw">
                <q-icon :name="showPw ? 'visibility_off' : 'visibility'" size="18px" />
              </button>
            </div>
          </div>

          <transition name="fade">
            <div v-if="errorMsg" class="auth-form__error">
              <q-icon name="error_outline" size="16px" />{{ errorMsg }}
            </div>
          </transition>

          <button type="submit" class="auth-form__submit" :disabled="loading">
            <q-spinner v-if="loading" size="18px" color="white" class="q-mr-sm" />
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>

        <p class="auth-page__register">
          ¿No tienes cuenta?
          <router-link to="/register" class="auth-page__register-link">Crear cuenta</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ identificadorAcceso: '', password: '' })
const errorMsg = ref('')
const loading = ref(false)
const showPw = ref(false)

const features = [
  { icon: 'security', text: 'Transacciones cifradas con TLS' },
  { icon: 'speed', text: 'Matching instantáneo de órdenes' },
  { icon: 'account_balance_wallet', text: 'Billetera multi-moneda integrada' },
]
const rates = [
  { pair: 'USD/PEN', value: '3.72', change: '+0.8%', up: true },
  { pair: 'EUR/PEN', value: '4.01', change: '-0.3%', up: false },
  { pair: 'USD/EUR', value: '0.92', change: '+0.2%', up: true },
]

async function submitLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    await authStore.login(form.identificadorAcceso, form.password)
    router.push('/')
  } catch (err) {
    errorMsg.value = err.response?.data?.mensaje || 'Error al iniciar sesión. Verifica tus credenciales.'
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.auth-page { display: flex; min-height: 100vh; background: var(--xc-bg); }

.auth-page__brand {
  flex: 1; background: linear-gradient(145deg,#0055D4,#007AFF 60%,#5856D6);
  display: flex; flex-direction: column; align-items: flex-start;
  justify-content: space-between; padding: 48px 52px; position: relative; overflow: hidden;
  &::before { content:''; position:absolute; width:500px; height:500px; border-radius:50%;
    background:rgba(255,255,255,.06); bottom:-120px; right:-160px; pointer-events:none; }
  @media(max-width:768px){ display:none; }
}
.auth-page__brand-content { position: relative; z-index: 1; }
.auth-page__logo { width:52px;height:52px;background:rgba(255,255,255,.18);backdrop-filter:blur(10px);
  border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:28px;
  border:1px solid rgba(255,255,255,.3); span{color:#fff;font-size:1.6rem;font-weight:800;font-style:italic;} }
.auth-page__brand-name { color:#fff;font-size:2.2rem;font-weight:800;letter-spacing:-.04em;margin:0 0 14px; }
.auth-page__tagline { color:rgba(255,255,255,.8);font-size:1rem;line-height:1.6;margin:0 0 36px; }
.auth-page__features { display:flex;flex-direction:column;gap:14px; }
.auth-page__feature { display:flex;align-items:center;gap:12px;color:rgba(255,255,255,.9);font-size:.875rem; }
.auth-page__feature-icon { width:32px;height:32px;background:rgba(255,255,255,.15);border-radius:8px;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff; }
.auth-page__rates { display:flex;gap:12px;position:relative;z-index:1; }
.auth-page__rate-card { background:rgba(255,255,255,.12);backdrop-filter:blur(12px);
  border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:14px 18px;min-width:110px; }
.auth-page__rate-pair { font-size:.72rem;font-weight:600;color:rgba(255,255,255,.7);
  letter-spacing:.05em;text-transform:uppercase;margin-bottom:4px; }
.auth-page__rate-value { font-size:1.2rem;font-weight:700;color:#fff;margin-bottom:4px; }
.auth-page__rate-change { display:flex;align-items:center;gap:2px;font-size:.75rem;font-weight:600;
  &.up{color:#4ADE80;} &.down{color:#F87171;} }

.auth-page__form-panel { width:100%;max-width:460px;display:flex;align-items:center;
  justify-content:center;padding:48px 40px;background:var(--xc-bg);
  @media(max-width:768px){max-width:100%;padding:32px 24px;} }
.auth-page__form-wrap { width:100%; }
.auth-page__form-header { margin-bottom:32px; }
.auth-page__form-title { font-size:1.6rem;font-weight:700;color:var(--xc-text);
  letter-spacing:-.03em;margin:0 0 6px; }
.auth-page__form-subtitle { color:var(--xc-text-secondary);font-size:.9rem;margin:0; }

.auth-form { display:flex;flex-direction:column;gap:20px; }
.auth-form__group { display:flex;flex-direction:column;gap:6px; }
.auth-form__label { font-size:.8rem;font-weight:600;color:var(--xc-text);letter-spacing:.01em; }
.auth-form__label-row { display:flex;align-items:center;justify-content:space-between; }
.auth-form__forgot { font-size:.78rem;color:var(--xc-primary);text-decoration:none;font-weight:500;
  &:hover{text-decoration:underline;} }
.auth-form__input-wrap { position:relative;display:flex;align-items:center; }
.auth-form__icon { position:absolute;left:14px;color:var(--xc-text-tertiary);pointer-events:none; }
.auth-form__input { width:100%;padding:13px 14px 13px 42px;border:1.5px solid var(--xc-border);
  border-radius:10px;font-size:.95rem;color:var(--xc-text);background:#fff;outline:none;
  transition:border-color .15s,box-shadow .15s;font-family:inherit;
  &::placeholder{color:var(--xc-text-tertiary);}
  &:focus{border-color:var(--xc-primary);box-shadow:0 0 0 3px rgba(0,122,255,.15);}
  &--padded-right{padding-right:44px;} }
.auth-form__toggle-pw { position:absolute;right:12px;background:none;border:none;cursor:pointer;
  color:var(--xc-text-tertiary);padding:4px;display:flex;align-items:center;
  &:hover{color:var(--xc-text-secondary);} }
.auth-form__error { display:flex;align-items:center;gap:6px;padding:10px 14px;
  background:rgba(255,59,48,.08);border:1px solid rgba(255,59,48,.2);border-radius:10px;
  color:var(--xc-negative);font-size:.85rem; }
.auth-form__submit { display:flex;align-items:center;justify-content:center;gap:8px;width:100%;
  padding:14px;background:var(--xc-primary);color:#fff;border:none;border-radius:12px;
  font-size:.95rem;font-weight:600;cursor:pointer;font-family:inherit;
  transition:filter .15s,transform .1s;margin-top:4px;
  &:hover:not(:disabled){filter:brightness(1.08);}
  &:active:not(:disabled){transform:scale(.98);}
  &:disabled{opacity:.45;cursor:not-allowed;} }
.auth-page__register { text-align:center;margin-top:24px;font-size:.875rem;color:var(--xc-text-secondary); }
.auth-page__register-link { color:var(--xc-primary);font-weight:600;text-decoration:none;
  &:hover{text-decoration:underline;} }
.fade-enter-active,.fade-leave-active{transition:opacity .2s;}
.fade-enter-from,.fade-leave-to{opacity:0;}
</style>
