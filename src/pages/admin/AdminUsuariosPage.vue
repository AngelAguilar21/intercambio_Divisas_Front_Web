<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5 col">Gestión de usuarios</div>
      <q-btn
        flat
        dense
        icon="fact_check"
        label="Ver log de auditoría"
        :to="{ name: 'admin-auditoria' }"
      />
    </div>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-md-4">
          <q-input
            v-model="filtro.nombreUsuario"
            label="Nombre de usuario"
            outlined
            dense
            :error="!!errorNombreUsuario"
            :error-message="errorNombreUsuario"
          />
        </div>
        <div class="col-12 col-md-4">
          <q-input
            v-model="filtro.correoElectronico"
            label="Correo electrónico"
            outlined
            dense
            :error="!!errorCorreo"
            :error-message="errorCorreo"
          />
        </div>
        <div class="col-6 col-md-2">
          <q-select
            v-model="filtro.estado"
            label="Estado"
            outlined
            dense
            :options="['Todos', 'Activo', 'Restringido']"
          />
        </div>
        <div class="col-6 col-md-2">
          <q-btn color="primary" label="Buscar" class="full-width" :disable="!filtroValido" @click="cargar" />
        </div>
      </div>
    </q-card>

    <q-card flat bordered class="q-pa-md">
      <q-table :rows="usuarios" :columns="columnas" row-key="usuarioId" :loading="cargando" flat>
        <template #body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              flat
              dense
              size="sm"
              label="Ver detalle"
              @click="verDetalle(props.row.usuarioId)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialogoAbierto">
      <q-card style="min-width: 500px; max-width: 700px">
        <q-card-section class="text-h6">{{ detalle?.nombreUsuario }}</q-card-section>
        <q-card-section v-if="detalle">
          <q-list dense>
            <q-item>
              <q-item-section>Correo</q-item-section>
              <q-item-section side>{{ detalle.correoElectronico }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>País</q-item-section>
              <q-item-section side>{{ detalle.paisResidencia }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Estado</q-item-section>
              <q-item-section side>
                <q-badge :color="detalle.estado === 'Activo' ? 'positive' : 'negative'">{{
                  detalle.estado
                }}</q-badge>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="text-subtitle2 q-mt-md q-mb-xs">Saldos</div>
          <q-list dense bordered>
            <q-item v-for="s in detalle.saldos" :key="s.monedaId">
              <q-item-section>{{ s.codigoMoneda }} - {{ s.nombreMoneda }}</q-item-section>
              <q-item-section side>{{ s.saldoDisponible }}</q-item-section>
            </q-item>
          </q-list>

          <div class="text-subtitle2 q-mt-md q-mb-xs">Historial reciente</div>
          <q-list dense bordered style="max-height: 200px; overflow-y: auto">
            <q-item v-for="h in detalle.historialTransacciones" :key="h.historialId">
              <q-item-section>
                {{ h.tipoOperacion }} {{ h.parMoneda || h.moneda }}
                <q-item-label caption>{{ new Date(h.fechaHora).toLocaleString() }}</q-item-label>
              </q-item-section>
              <q-item-section side>{{ h.estado }}</q-item-section>
            </q-item>
          </q-list>

          <q-input
            v-model="mensajeAccion"
            :label="detalle?.estado === 'Activo' ? 'Mensaje de restricción' : 'Mensaje de habilitación'"
            outlined
            dense
            class="q-mt-md"
            :error="mensajeTocado && !!errorMensaje"
            :error-message="errorMensaje"
            @update:model-value="mensajeTocado = true"
          />
          <q-banner
            v-if="errorMessage"
            dense
            class="xchang-banner xchang-banner--error q-mt-sm"
            rounded
            >{{ errorMessage }}</q-banner
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat label="Cerrar" />
          <q-btn
            v-if="detalle?.estado === 'Activo'"
            color="negative"
            label="Restringir"
            :disable="!!errorMensaje"
            :loading="procesando"
            @click="onCambiarEstado('restringir')"
          />
          <q-btn
            v-else
            color="positive"
            label="Habilitar"
            :disable="!!errorMensaje"
            :loading="procesando"
            @click="onCambiarEstado('habilitar')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import {
  buscarUsuarios,
  obtenerDetalleUsuario,
  restringirUsuario,
  habilitarUsuario,
} from '@/services/adminUsuarios'

const filtro = reactive({ nombreUsuario: '', correoElectronico: '', estado: 'Todos' })
const usuarios = ref([])
const cargando = ref(false)

const errorNombreUsuario = computed(() =>
  filtro.nombreUsuario.length > 30 ? 'Máximo 30 caracteres' : '',
)
const errorCorreo = computed(() =>
  filtro.correoElectronico.length > 100 ? 'Máximo 100 caracteres' : '',
)
const filtroValido = computed(() => !errorNombreUsuario.value && !errorCorreo.value)

const columnas = [
  { name: 'nombreUsuario', label: 'Usuario', field: 'nombreUsuario', align: 'left' },
  { name: 'correoElectronico', label: 'Correo', field: 'correoElectronico', align: 'left' },
  { name: 'paisResidencia', label: 'País', field: 'paisResidencia', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  { name: 'acciones', label: '', field: 'acciones', align: 'right' },
]

const dialogoAbierto = ref(false)
const detalle = ref(null)
const mensajeAccion = ref('')
const mensajeTocado = ref(false)
const procesando = ref(false)
const errorMessage = ref('')

const errorMensaje = computed(() => {
  if (!mensajeAccion.value) return 'Ingrese un mensaje'
  if (mensajeAccion.value.length > 300) return 'Máximo 300 caracteres'
  return ''
})

async function cargar() {
  if (!filtroValido.value) return
  cargando.value = true
  try {
    const { data } = await buscarUsuarios(filtro)
    usuarios.value = data
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)

async function verDetalle(usuarioId) {
  const { data } = await obtenerDetalleUsuario(usuarioId)
  detalle.value = data
  mensajeAccion.value = ''
  mensajeTocado.value = false
  errorMessage.value = ''
  dialogoAbierto.value = true
}

async function onCambiarEstado(accion) {
  mensajeTocado.value = true
  if (errorMensaje.value) return
  procesando.value = true
  errorMessage.value = ''
  try {
    const fn = accion === 'restringir' ? restringirUsuario : habilitarUsuario
    await fn(detalle.value.usuarioId, mensajeAccion.value)
    Notify.create({
      type: 'positive',
      message: `Usuario ${accion === 'restringir' ? 'restringido' : 'habilitado'}.`,
    })
    dialogoAbierto.value = false
    await cargar()
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo completar la acción.'
  } finally {
    procesando.value = false
  }
}
</script>
