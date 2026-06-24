<template>
  <q-page class="page">
    <div class="page__header">
      <h1 class="page__title">Mi perfil</h1>
      <p class="page__subtitle">Información de tu cuenta y configuración</p>
    </div>

    <div v-if="loadingPerfil" class="loading-center"><q-spinner color="primary" size="36px" /></div>

    <div v-else class="profile-layout">
      <!-- Card izquierda: avatar + stats -->
      <div class="profile-sidebar">
        <div class="xc-card profile-card">
          <div class="profile-card__avatar-wrap">
            <div class="profile-card__avatar">
              <span>{{ avatarLetter }}</span>
            </div>
            <div :class="['profile-card__estado', perfil.estado === 'Activo' ? 'perfil-card__estado--active' : '']">
              {{ perfil.estado }}
            </div>
          </div>
          <div class="profile-card__name">{{ perfil.nombreUsuario }}</div>
          <div class="profile-card__email">{{ perfil.correoElectronico }}</div>
          <div class="profile-card__rol">{{ perfil.rol }}</div>

          <div class="profile-card__stats">
            <div class="profile-stat">
              <div class="profile-stat__value">{{ perfil.totalTransaccionesCompletadas ?? 0 }}</div>
              <div class="profile-stat__label">Transacciones</div>
            </div>
            <div class="profile-stat">
              <div class="profile-stat__value">{{ Number(perfil.calificacionPromedio ?? 0).toFixed(1) }}</div>
              <div class="profile-stat__label">Calificación</div>
            </div>
            <div class="profile-stat">
              <div class="profile-stat__value">{{ perfil.totalCalificaciones ?? 0 }}</div>
              <div class="profile-stat__label">Reseñas</div>
            </div>
          </div>

          <div class="profile-card__since">
            Miembro desde {{ formatDateShort(perfil.fechaRegistro) }}
          </div>
        </div>
      </div>

      <!-- Formulario de edición -->
      <div class="profile-main">
        <div class="xc-card edit-card">
          <div class="edit-card__header">
            <h2 class="edit-card__title">Datos personales</h2>
            <button v-if="!editing" class="btn-edit" @click="startEditing">
              <q-icon name="edit" size="16px" /> Editar
            </button>
          </div>

          <div class="edit-form">
            <div class="edit-form__row">
              <div class="edit-field">
                <label class="edit-field__label">Nombre de usuario</label>
                <input v-model="form.nombreUsuario" :disabled="!editing" class="edit-field__input" />
              </div>
              <div class="edit-field">
                <label class="edit-field__label">Correo electrónico</label>
                <input v-model="form.correoElectronico" :disabled="!editing" type="email" class="edit-field__input" />
              </div>
            </div>
            <div class="edit-form__row">
              <div class="edit-field">
                <label class="edit-field__label">Teléfono</label>
                <input v-model="form.telefono" :disabled="!editing" class="edit-field__input" />
              </div>
              <div class="edit-field">
                <label class="edit-field__label">Tipo de documento</label>
                <input v-model="form.tipoDocumento" :disabled="!editing" class="edit-field__input" />
              </div>
            </div>
            <div class="edit-form__row">
              <div class="edit-field">
                <label class="edit-field__label">Número de documento</label>
                <input v-model="form.numeroDocumento" :disabled="!editing" class="edit-field__input" />
              </div>
              <div class="edit-field">
                <label class="edit-field__label">Tema visual</label>
                <select v-model="form.temaVisual" :disabled="!editing" class="edit-field__input">
                  <option value="Claro">Claro</option>
                  <option value="Oscuro">Oscuro</option>
                </select>
              </div>
            </div>

            <transition name="fade">
              <div v-if="errorMsg" class="form-msg form-msg--error"><q-icon name="error_outline" size="14px" />{{ errorMsg }}</div>
            </transition>
            <transition name="fade">
              <div v-if="successMsg" class="form-msg form-msg--success"><q-icon name="check_circle_outline" size="14px" />{{ successMsg }}</div>
            </transition>

            <div v-if="editing" class="edit-form__actions">
              <button class="btn-cancel" @click="cancelEditing">Cancelar</button>
              <button class="btn-save" :disabled="loadingSave" @click="guardarPerfil">
                <q-spinner v-if="loadingSave" size="14px" color="white" />{{ loadingSave ? 'Guardando...' : 'Guardar cambios' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Cambiar contraseña -->
        <div class="xc-card edit-card" style="margin-top:16px;">
          <div class="edit-card__header">
            <h2 class="edit-card__title">Cambiar contraseña</h2>
          </div>
          <div class="edit-form">
            <div class="edit-form__row">
              <div class="edit-field">
                <label class="edit-field__label">Nueva contraseña</label>
                <input v-model="pwForm.password" type="password" class="edit-field__input" placeholder="Mín. 8 caracteres" />
              </div>
              <div class="edit-field">
                <label class="edit-field__label">Confirmar nueva contraseña</label>
                <input v-model="pwForm.confirmar" type="password" class="edit-field__input" placeholder="Repite la contraseña" />
              </div>
            </div>
            <transition name="fade">
              <div v-if="pwError" class="form-msg form-msg--error"><q-icon name="error_outline" size="14px" />{{ pwError }}</div>
            </transition>
            <div class="edit-form__actions">
              <button class="btn-save" :disabled="loadingPw || !pwForm.password" @click="cambiarPassword">
                <q-spinner v-if="loadingPw" size="14px" color="white" />{{ loadingPw ? 'Cambiando...' : 'Cambiar contraseña' }}
              </button>
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

const loadingPerfil = ref(true)
const loadingSave = ref(false)
const loadingPw = ref(false)
const editing = ref(false)
const perfil = ref({})
const errorMsg = ref('')
const successMsg = ref('')
const pwError = ref('')

const form = reactive({ nombreUsuario: '', correoElectronico: '', telefono: '', tipoDocumento: '', numeroDocumento: '', temaVisual: 'Claro' })
const pwForm = reactive({ password: '', confirmar: '' })

const avatarLetter = computed(() => (perfil.value.nombreUsuario || 'U').charAt(0).toUpperCase())

function formatDateShort(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
}

function fillForm() {
  Object.assign(form, {
    nombreUsuario: perfil.value.nombreUsuario || '',
    correoElectronico: perfil.value.correoElectronico || '',
    telefono: perfil.value.telefono || '',
    tipoDocumento: perfil.value.tipoDocumento || '',
    numeroDocumento: perfil.value.numeroDocumento || '',
    temaVisual: perfil.value.temaVisual || 'Claro',
  })
}

function startEditing() { editing.value = true; errorMsg.value = ''; successMsg.value = '' }
function cancelEditing() { editing.value = false; fillForm(); errorMsg.value = '' }

onMounted(async () => {
  try {
    const res = await api.get('/api/perfil')
    perfil.value = res.data
    fillForm()
  } catch { perfil.value = { nombreUsuario: 'Usuario', correoElectronico: '', rol: 'Cliente', estado: 'Activo' } }
  finally { loadingPerfil.value = false }
})

async function guardarPerfil() {
  errorMsg.value = ''; loadingSave.value = true
  try {
    const res = await api.put('/api/perfil', {
      nombreUsuario: form.nombreUsuario, correoElectronico: form.correoElectronico,
      telefono: form.telefono, tipoDocumento: form.tipoDocumento,
      numeroDocumento: form.numeroDocumento, temaVisual: form.temaVisual,
    })
    perfil.value = { ...perfil.value, ...res.data }
    editing.value = false
    successMsg.value = 'Perfil actualizado correctamente.'
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (err) { errorMsg.value = err.response?.data?.mensaje || 'Error al guardar los cambios.' }
  finally { loadingSave.value = false }
}

async function cambiarPassword() {
  pwError.value = ''
  if (pwForm.password !== pwForm.confirmar) { pwError.value = 'Las contraseñas no coinciden.'; return }
  if (pwForm.password.length < 8) { pwError.value = 'La contraseña debe tener al menos 8 caracteres.'; return }
  loadingPw.value = true
  try {
    await api.put('/api/perfil', { password: pwForm.password, confirmarPassword: pwForm.confirmar })
    pwForm.password = ''; pwForm.confirmar = ''
    successMsg.value = 'Contraseña cambiada correctamente.'
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (err) { pwError.value = err.response?.data?.mensaje || 'Error al cambiar la contraseña.' }
  finally { loadingPw.value = false }
}
</script>

<style lang="scss" scoped>
.page { padding:28px 32px; @media(max-width:768px){padding:16px;} }
.page__header { margin-bottom:24px; }
.page__title { font-size:1.6rem;font-weight:700;color:var(--xc-text);letter-spacing:-.03em;margin:0 0 4px; }
.page__subtitle { font-size:.85rem;color:var(--xc-text-secondary);margin:0; }
.loading-center { display:flex;justify-content:center;padding:60px; }
.profile-layout { display:grid;grid-template-columns:280px 1fr;gap:20px;
  @media(max-width:900px){grid-template-columns:1fr;} }
.profile-sidebar { display:flex;flex-direction:column;gap:16px; }
.profile-card { display:flex;flex-direction:column;align-items:center;text-align:center;padding:28px 20px; }
.profile-card__avatar-wrap { position:relative;margin-bottom:16px; }
.profile-card__avatar { width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#007AFF,#5856D6);
  display:flex;align-items:center;justify-content:center;
  span{color:#fff;font-size:2rem;font-weight:700;} }
.profile-card__estado { position:absolute;bottom:-2px;right:-2px;padding:2px 8px;border-radius:20px;
  font-size:.65rem;font-weight:700;background:var(--xc-bg);border:1.5px solid var(--xc-positive);color:var(--xc-positive); }
.profile-card__name { font-size:1.1rem;font-weight:700;color:var(--xc-text); }
.profile-card__email { font-size:.82rem;color:var(--xc-text-secondary);margin-top:3px; }
.profile-card__rol { display:inline-block;margin-top:8px;padding:3px 10px;background:var(--xc-primary-light);
  color:var(--xc-primary);border-radius:20px;font-size:.75rem;font-weight:600; }
.profile-card__stats { display:grid;grid-template-columns:repeat(3,1fr);gap:12px;width:100%;margin:20px 0;
  padding:16px;background:var(--xc-bg);border-radius:12px; }
.profile-stat__value { font-size:1.2rem;font-weight:700;color:var(--xc-text); }
.profile-stat__label { font-size:.7rem;color:var(--xc-text-secondary);margin-top:2px; }
.profile-card__since { font-size:.75rem;color:var(--xc-text-tertiary); }
.profile-main { display:flex;flex-direction:column; }
.edit-card { padding:24px; }
.edit-card__header { display:flex;align-items:center;justify-content:space-between;margin-bottom:20px; }
.edit-card__title { font-size:1rem;font-weight:700;color:var(--xc-text);margin:0; }
.btn-edit { display:flex;align-items:center;gap:6px;padding:7px 14px;background:var(--xc-bg);
  color:var(--xc-primary);border:1.5px solid var(--xc-primary);border-radius:8px;font-size:.82rem;
  font-weight:600;cursor:pointer;font-family:inherit;transition:background .15s;
  &:hover{background:var(--xc-primary-light);} }
.edit-form { display:flex;flex-direction:column;gap:16px; }
.edit-form__row { display:grid;grid-template-columns:1fr 1fr;gap:14px;@media(max-width:540px){grid-template-columns:1fr;} }
.edit-field { display:flex;flex-direction:column;gap:5px; }
.edit-field__label { font-size:.78rem;font-weight:600;color:var(--xc-text); }
.edit-field__input { padding:10px 12px;border:1.5px solid var(--xc-border);border-radius:9px;font-size:.9rem;
  color:var(--xc-text);background:#fff;outline:none;font-family:inherit;transition:border-color .15s;
  appearance:none;cursor:pointer;
  &:disabled{background:var(--xc-bg);cursor:default;color:var(--xc-text-secondary);}
  &:focus:not(:disabled){border-color:var(--xc-primary);box-shadow:0 0 0 3px rgba(0,122,255,.15);} }
.edit-form__actions { display:flex;gap:10px; }
.form-msg { display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:8px;font-size:.83rem;
  &--error{background:rgba(255,59,48,.08);border:1px solid rgba(255,59,48,.2);color:var(--xc-negative);}
  &--success{background:rgba(52,199,89,.08);border:1px solid rgba(52,199,89,.2);color:var(--xc-positive);} }
.btn-save { flex:1;padding:10px 20px;background:var(--xc-primary);color:#fff;border:none;border-radius:9px;
  font-size:.875rem;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;
  justify-content:center;gap:6px;transition:filter .15s;
  &:hover:not(:disabled){filter:brightness(1.08);}
  &:disabled{opacity:.45;cursor:not-allowed;} }
.btn-cancel { padding:10px 20px;background:var(--xc-bg);color:var(--xc-text);border:1.5px solid var(--xc-border);
  border-radius:9px;font-size:.875rem;font-weight:600;cursor:pointer;font-family:inherit;
  &:hover{background:var(--xc-border-light);} }
.fade-enter-active,.fade-leave-active{transition:opacity .2s;}
.fade-enter-from,.fade-leave-to{opacity:0;}
</style>
