<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5 col">Gestión de usuarios</div>
      <q-btn flat dense icon="fact_check" label="Ver log de auditoría" :to="{ name: 'admin-auditoria' }" />
    </div>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-md-4"><q-input v-model="filtro.nombreUsuario" label="Nombre de usuario" outlined dense /></div>
        <div class="col-12 col-md-4"><q-input v-model="filtro.correoElectronico" label="Correo electrónico" outlined dense /></div>
        <div class="col-6 col-md-2"><q-select v-model="filtro.estado" label="Estado" outlined dense :options="['Todos','Activo','Restringido']" /></div>
        <div class="col-6 col-md-2"><q-btn color="primary" label="Buscar" class="full-width" @click="cargar" /></div>
      </div>
    </q-card>

    <q-card flat bordered class="q-pa-md">
      <q-table :rows="usuarios" :columns="columnas" row-key="usuarioId" :loading="cargando" flat>
        <template #body-cell-acciones="props">
          <q-td :props="props"><q-btn flat dense size="sm" label="Ver detalle" @click="verDetalle(props.row.usuarioId)" /></q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialogoAbierto">
      <q-card style="min-width: 720px; max-width: 900px">
        <q-card-section class="row items-center">
          <div class="text-h6 col">{{ detalle?.nombreUsuario }}</div>
          <q-badge :color="detalle?.estado === 'Activo' ? 'positive' : 'negative'">{{ detalle?.estado }}</q-badge>
        </q-card-section>
        <q-card-section v-if="detalle">
          <q-list dense bordered>
            <q-item><q-item-section>Correo</q-item-section><q-item-section side>{{ detalle.correoElectronico }}</q-item-section></q-item>
            <q-item><q-item-section>País</q-item-section><q-item-section side>{{ detalle.paisResidencia || '-' }}</q-item-section></q-item>
            <q-item><q-item-section>Rol</q-item-section><q-item-section side>{{ detalle.rol }}</q-item-section></q-item>
          </q-list>

          <div class="text-subtitle2 q-mt-md q-mb-xs">Saldos</div>
          <q-list dense bordered style="max-height:140px;overflow:auto">
            <q-item v-for="s in detalle.saldos" :key="s.monedaId"><q-item-section>{{ s.codigoISO }} - {{ s.nombre }}</q-item-section><q-item-section side>{{ s.saldoDisponible }}</q-item-section></q-item>
          </q-list>

          <div class="text-subtitle2 q-mt-md q-mb-xs">Últimas 10 operaciones</div>
          <q-list dense bordered style="max-height:160px;overflow:auto">
            <q-item v-for="h in detalle.historialTransacciones" :key="h.historialId"><q-item-section>{{ h.tipoOperacion }}<q-item-label caption>{{ new Date(h.fechaHora).toLocaleString() }}</q-item-label></q-item-section><q-item-section side>{{ h.estado }}</q-item-section></q-item>
          </q-list>

          <div class="text-subtitle2 q-mt-md q-mb-xs">Historial de restricciones/habilitaciones</div>
          <q-list dense bordered style="max-height:160px;overflow:auto">
            <q-item v-for="r in detalle.historialRestricciones" :key="r.restriccionId"><q-item-section>{{ r.tipoAccion }}<q-item-label caption lines="2">{{ r.mensaje }}</q-item-label></q-item-section><q-item-section side>{{ new Date(r.fechaInicio).toLocaleString() }}</q-item-section></q-item>
            <q-item v-if="!detalle.historialRestricciones?.length"><q-item-section class="xc-text-secondary">Sin restricciones registradas</q-item-section></q-item>
          </q-list>

          <q-input v-model="mensajeAccion" :label="detalle.estado === 'Activo' ? 'Mensaje de restricción' : 'Mensaje de habilitación'" outlined dense type="textarea" counter maxlength="300" class="q-mt-md" />
          <div class="text-caption xc-text-secondary q-mt-xs">La IA no está configurada en este frontend; no se llama a Groq desde navegador.</div>
          <q-banner v-if="errorMessage" dense class="xchang-banner xchang-banner--error q-mt-sm" rounded>{{ errorMessage }}</q-banner>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat label="Cerrar" />
          <q-btn v-if="detalle?.estado === 'Activo'" color="negative" label="Restringir" :disable="detalle?.esAdministrador || !mensajeValido" :loading="procesando" @click="onCambiarEstado('restringir')" />
          <q-btn v-else color="positive" label="Habilitar" :disable="detalle?.esAdministrador || !mensajeValido" :loading="procesando" @click="onCambiarEstado('habilitar')" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { buscarUsuarios, obtenerDetalleUsuario, restringirUsuario, habilitarUsuario } from '@/services/adminUsuarios'

const filtro = reactive({ nombreUsuario: '', correoElectronico: '', estado: 'Todos' })
const usuarios = ref([])
const cargando = ref(false)
const columnas = [
  { name: 'nombreUsuario', label: 'Usuario', field: 'nombreUsuario', align: 'left' },
  { name: 'correoElectronico', label: 'Correo', field: 'correoElectronico', align: 'left' },
  { name: 'paisResidencia', label: 'País', field: 'paisResidencia', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  { name: 'rol', label: 'Rol', field: 'rol', align: 'left' },
  { name: 'acciones', label: '', field: 'acciones', align: 'right' },
]
const dialogoAbierto = ref(false)
const detalle = ref(null)
const mensajeAccion = ref('')
const procesando = ref(false)
const errorMessage = ref('')
const mensajeValido = computed(() => mensajeAccion.value.trim().length > 0 && mensajeAccion.value.trim().length <= 300)

onMounted(cargar)
async function cargar() {
  cargando.value = true
  try { usuarios.value = (await buscarUsuarios(filtro)).data } finally { cargando.value = false }
}
async function verDetalle(usuarioId) {
  detalle.value = (await obtenerDetalleUsuario(usuarioId)).data
  mensajeAccion.value = ''
  errorMessage.value = ''
  dialogoAbierto.value = true
}
async function onCambiarEstado(accion) {
  if (!mensajeValido.value) return
  procesando.value = true
  errorMessage.value = ''
  try {
    if (accion === 'restringir') await restringirUsuario(detalle.value.usuarioId, mensajeAccion.value.trim())
    else await habilitarUsuario(detalle.value.usuarioId, mensajeAccion.value.trim())
    Notify.create({ type: 'positive', message: 'Estado actualizado correctamente.' })
    dialogoAbierto.value = false
    await cargar()
  } catch (e) { errorMessage.value = e.response?.data?.mensaje || 'No se pudo actualizar el usuario.' } finally { procesando.value = false }
}
</script>
