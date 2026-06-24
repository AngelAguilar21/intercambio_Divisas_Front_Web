<template>
  <div class="auth-page">
    <div class="auth-page__brand">
      <div class="auth-page__brand-content">
        <div class="auth-page__logo"><span>X</span></div>
        <h1 class="auth-page__brand-name">X-Chang</h1>
        <p class="auth-page__tagline">Crea tu cuenta y empieza a intercambiar divisas al mejor precio.</p>
        <div class="auth-page__features">
          <div v-for="f in features" :key="f.text" class="auth-page__feature">
            <div class="auth-page__feature-icon"><q-icon :name="f.icon" size="18px" /></div>
            <span>{{ f.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="auth-page__form-panel">
      <div class="auth-page__form-wrap">
        <div class="auth-page__form-header">
          <h2 class="auth-page__form-title">Crear cuenta</h2>
          <p class="auth-page__form-subtitle">Completa el formulario para registrarte</p>
        </div>

        <form @submit.prevent="submitRegister" class="auth-form">
          <div class="auth-form__row">
            <div class="auth-form__group">
              <label class="auth-form__label">Nombre de usuario</label>
              <div class="auth-form__input-wrap">
                <q-icon name="person_outline" size="18px" class="auth-form__icon" />
                <input v-model="form.nombreUsuario" type="text" class="auth-form__input"
                  placeholder="miusuario" required minlength="2" maxlength="30" />
              </div>
            </div>
            <div class="auth-form__group">
              <label class="auth-form__label">Correo electrónico</label>
              <div class="auth-form__input-wrap">
                <q-icon name="mail_outline" size="18px" class="auth-form__icon" />
                <input v-model="form.correoElectronico" type="email" class="auth-form__input"
                  placeholder="tu@correo.com" required />
              </div>
            </div>
          </div>

          <div class="auth-form__row">
            <div class="auth-form__group">
              <label class="auth-form__label">Contraseña</label>
              <div class="auth-form__input-wrap">
                <q-icon name="lock_outline" size="18px" class="auth-form__icon" />
                <input v-model="form.password" :type="showPw ? 'text' : 'password'"
                  class="auth-form__input auth-form__input--padded-right"
                  placeholder="Mín. 8 caracteres" required minlength="8" />
                <button type="button" class="auth-form__toggle-pw" @click="showPw = !showPw">
                  <q-icon :name="showPw ? 'visibility_off' : 'visibility'" size="18px" />
                </button>
              </div>
              <p class="auth-form__hint">Mayúscula, número y carácter especial</p>
            </div>
            <div class="auth-form__group">
              <label class="auth-form__label">Confirmar contraseña</label>
              <div class="auth-form__input-wrap">
                <q-icon name="lock_outline" size="18px" class="auth-form__icon" />
                <input v-model="form.confirmarPassword" :type="showPw ? 'text' : 'password'"
                  class="auth-form__input" placeholder="Repite tu contraseña" required />
              </div>
            </div>
          </div>

          <div class="auth-form__row">
            <div class="auth-form__group">
              <label class="auth-form__label">País</label>
              <div class="auth-form__input-wrap">
                <q-icon name="public" size="18px" class="auth-form__icon" />
                <select v-model="form.paisId" class="auth-form__input auth-form__select" required>
                  <option value="" disabled>Selecciona tu país</option>
                  <option v-for="p in paises" :key="p.paisId" :value="p.paisId">{{ p.nombre }}</option>
                </select>
              </div>
            </div>
            <div class="auth-form__group">
              <label class="auth-form__label">Teléfono</label>
              <div class="auth-form__input-wrap">
                <q-icon name="phone" size="18px" class="auth-form__icon" />
                <input v-model="form.telefono" type="tel" class="auth-form__input"
                  placeholder="+51 999 999 999" required minlength="6" maxlength="20" />
              </div>
            </div>
          </div>

          <div class="auth-form__row">
            <div class="auth-form__group">
              <label class="auth-form__label">Tipo de documento</label>
              <div class="auth-form__input-wrap">
                <q-icon name="badge" size="18px" class="auth-form__icon" />
                <select v-model="form.tipoDocumento" class="auth-form__input auth-form__select" required>
                  <option value="" disabled>Selecciona tipo</option>
                  <option value="DNI">DNI</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="CE">Carné de extranjería</option>
                  <option value="RUC">RUC</option>
                </select>
              </div>
            </div>
            <div class="auth-form__group">
              <label class="auth-form__label">Número de documento</label>
              <div class="auth-form__input-wrap">
                <q-icon name="numbers" size="18px" class="auth-form__icon" />
                <input v-model="form.numeroDocumento" type="text" class="auth-form__input"
                  placeholder="12345678" required minlength="5" maxlength="20" />
              </div>
            </div>
          </div>

          <transition name="fade">
            <div v-if="errorMsg" class="auth-form__error">
              <q-icon name="error_outline" size="16px" />{{ errorMsg }}
            </div>
          </transition>
          <transition name="fade">
            <div v-if="successMsg" class="auth-form__success">
              <q-icon name="check_circle_outline" size="16px" />{{ successMsg }}
            </div>
          </transition>

          <button type="submit" class="auth-form__submit" :disabled="loading">
            <q-spinner v-if="loading" size="18px" color="white" class="q-mr-sm" />
            {{ loading ? 'Registrando...' : 'Crear cuenta' }}
          </button>
        </form>

        <p class="auth-page__register">
          ¿Ya tienes cuenta?
          <router-link to="/login" class="auth-page__register-link">Iniciar sesión</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import api from 'src/services/api'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const showPw = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const paises = ref([])

const form = reactive({
  nombreUsuario: '', correoElectronico: '', password: '', confirmarPassword: '',
  paisId: '', telefono: '', tipoDocumento: '', numeroDocumento: '',
})

const features = [
  { icon: 'verified_user', text: 'Registro seguro y verificado' },
  { icon: 'currency_exchange', text: 'Acceso a todos los pares de divisas' },
  { icon: 'support_agent', text: 'Soporte 24/7 en español' },
]

onMounted(async () => {
  try {
    const res = await api.get('/api/pais')
    paises.value = res.data
  } catch {
    paises.value = [
      { paisId: 1, nombre: 'Perú' }, { paisId: 2, nombre: 'Chile' },
      { paisId: 3, nombre: 'Colombia' }, { paisId: 4, nombre: 'Ecuador' },
    ]
  }
})

async function submitRegister() {
  errorMsg.value = ''
  successMsg.value = ''
  if (form.password !== form.confirmarPassword) { errorMsg.value = 'Las contraseñas no coinciden.'; return }
  loading.value = true
  try {
    await authStore.register({
      nombreUsuario: form.nombreUsuario, correoElectronico: form.correoElectronico,
      password: form.password, confirmarPassword: form.confirmarPassword,
      paisId: Number(form.paisId), telefono: form.telefono,
      tipoDocumento: form.tipoDocumento, numeroDocumento: form.numeroDocumento,
    })
    successMsg.value = 'Cuenta creada. Revisa tu correo para verificarla y luego inicia sesión.'
    setTimeout(() => router.push('/login'), 3000)
  } catch (err) {
    errorMsg.value = err.response?.data?.mensaje || 'Error al registrar. Intenta de nuevo.'
  } finally { loading.value = false }
}
</script>

<style lang="scss" scoped>
.auth-page { display:flex;min-height:100vh;background:var(--xc-bg); }
.auth-page__brand { flex:1;background:linear-gradient(145deg,#0055D4,#007AFF 60%,#5856D6);
  display:flex;flex-direction:column;padding:48px 52px;position:relative;overflow:hidden;
  &::before{content:'';position:absolute;width:500px;height:500px;border-radius:50%;
    background:rgba(255,255,255,.06);bottom:-120px;right:-160px;pointer-events:none;}
  @media(max-width:768px){display:none;} }
.auth-page__brand-content { position:relative;z-index:1; }
.auth-page__logo { width:52px;height:52px;background:rgba(255,255,255,.18);backdrop-filter:blur(10px);
  border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:28px;
  border:1px solid rgba(255,255,255,.3); span{color:#fff;font-size:1.6rem;font-weight:800;font-style:italic;} }
.auth-page__brand-name { color:#fff;font-size:2.2rem;font-weight:800;letter-spacing:-.04em;margin:0 0 14px; }
.auth-page__tagline { color:rgba(255,255,255,.8);font-size:1rem;line-height:1.6;margin:0 0 36px; }
.auth-page__features { display:flex;flex-direction:column;gap:14px; }
.auth-page__feature { display:flex;align-items:center;gap:12px;color:rgba(255,255,255,.9);font-size:.875rem; }
.auth-page__feature-icon { width:32px;height:32px;background:rgba(255,255,255,.15);border-radius:8px;
  display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff; }
.auth-page__form-panel { width:100%;max-width:620px;display:flex;align-items:center;
  justify-content:center;padding:40px;background:var(--xc-bg);overflow-y:auto;
  @media(max-width:768px){max-width:100%;padding:24px;} }
.auth-page__form-wrap { width:100%; }
.auth-page__form-header { margin-bottom:28px; }
.auth-page__form-title { font-size:1.6rem;font-weight:700;color:var(--xc-text);letter-spacing:-.03em;margin:0 0 6px; }
.auth-page__form-subtitle { color:var(--xc-text-secondary);font-size:.9rem;margin:0; }
.auth-form { display:flex;flex-direction:column;gap:16px; }
.auth-form__row { display:grid;grid-template-columns:1fr 1fr;gap:16px;
  @media(max-width:520px){grid-template-columns:1fr;} }
.auth-form__group { display:flex;flex-direction:column;gap:5px; }
.auth-form__label { font-size:.78rem;font-weight:600;color:var(--xc-text);letter-spacing:.01em; }
.auth-form__input-wrap { position:relative;display:flex;align-items:center; }
.auth-form__icon { position:absolute;left:12px;color:var(--xc-text-tertiary);pointer-events:none; }
.auth-form__input { width:100%;padding:11px 12px 11px 38px;border:1.5px solid var(--xc-border);
  border-radius:9px;font-size:.9rem;color:var(--xc-text);background:#fff;outline:none;
  transition:border-color .15s,box-shadow .15s;font-family:inherit;
  &::placeholder{color:var(--xc-text-tertiary);}
  &:focus{border-color:var(--xc-primary);box-shadow:0 0 0 3px rgba(0,122,255,.15);}
  &--padded-right{padding-right:40px;} }
.auth-form__select { appearance:none;cursor:pointer; }
.auth-form__toggle-pw { position:absolute;right:10px;background:none;border:none;cursor:pointer;
  color:var(--xc-text-tertiary);padding:4px;display:flex;align-items:center; }
.auth-form__hint { font-size:.7rem;color:var(--xc-text-tertiary);margin:2px 0 0; }
.auth-form__error { display:flex;align-items:center;gap:6px;padding:10px 14px;
  background:rgba(255,59,48,.08);border:1px solid rgba(255,59,48,.2);border-radius:10px;
  color:var(--xc-negative);font-size:.85rem; }
.auth-form__success { display:flex;align-items:center;gap:6px;padding:10px 14px;
  background:rgba(52,199,89,.08);border:1px solid rgba(52,199,89,.2);border-radius:10px;
  color:var(--xc-positive);font-size:.85rem; }
.auth-form__submit { display:flex;align-items:center;justify-content:center;gap:8px;width:100%;
  padding:13px;background:var(--xc-primary);color:#fff;border:none;border-radius:12px;
  font-size:.95rem;font-weight:600;cursor:pointer;font-family:inherit;
  transition:filter .15s,transform .1s;margin-top:4px;
  &:hover:not(:disabled){filter:brightness(1.08);}
  &:active:not(:disabled){transform:scale(.98);}
  &:disabled{opacity:.45;cursor:not-allowed;} }
.auth-page__register { text-align:center;margin-top:20px;font-size:.875rem;color:var(--xc-text-secondary); }
.auth-page__register-link { color:var(--xc-primary);font-weight:600;text-decoration:none;
  &:hover{text-decoration:underline;} }
.fade-enter-active,.fade-leave-active{transition:opacity .2s;}
.fade-enter-from,.fade-leave-to{opacity:0;}
</style>
