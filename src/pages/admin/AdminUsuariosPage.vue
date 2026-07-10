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
            :error="filtro.nombreUsuario.length > 30"
            error-message="Máximo 30 caracteres"
          />
        </div>
        <div class="col-12 col-md-4">
          <q-input
            v-model="filtro.correoElectronico"
            label="Correo electrónico"
            outlined
            dense
            :error="filtro.correoElectronico.length > 100"
            error-message="Máximo 100 caracteres"
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
          <q-btn
            color="primary"
            label="Buscar"
            class="full-width"
            :disable="!filtroValido"
            @click="cargar"
          />
        </div>
      </div>
    </q-card>

    <q-card flat bordered class="q-pa-md">
      <q-table
        :rows="usuarios"
        :columns="columnas"
        row-key="usuarioId"
        :loading="cargando"
        flat
      >
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
      <q-card style="min-width: 720px; max-width: 900px">
        <q-card-section class="row items-center">
          <div class="text-h6 col">{{ detalle?.nombreUsuario }}</div>
          <q-badge :color="detalle?.estado === 'Activo' ? 'positive' : 'negative'">
            {{ detalle?.estado }}
          </q-badge>
        </q-card-section>

        <q-card-section v-if="detalle">
          <q-list dense bordered>
            <q-item>
              <q-item-section>Correo</q-item-section>
              <q-item-section side>{{ detalle.correoElectronico }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>País</q-item-section>
              <q-item-section side>{{ detalle.paisResidencia || '-' }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Rol</q-item-section>
              <q-item-section side>{{ detalle.rol || '-' }}</q-item-section>
            </q-item>
          </q-list>

          <q-banner
            v-if="detalle.esAdministrador"
            dense
            rounded
            class="xchang-banner xchang-banner--info q-mt-md"
          >
            Las cuentas administradoras no pueden ser restringidas ni habilitadas desde esta opción.
          </q-banner>

          <div class="text-subtitle2 q-mt-md q-mb-xs">Saldos</div>
          <q-list dense bordered style="max-height: 140px; overflow: auto">
            <q-item v-for="s in detalle.saldos" :key="s.monedaId">
              <q-item-section>{{ s.codigoMoneda }} - {{ s.nombreMoneda }}</q-item-section>
              <q-item-section side>{{ formatearDecimal(s.saldoDisponible) }}</q-item-section>
            </q-item>
            <q-item v-if="!detalle.saldos?.length">
              <q-item-section class="xc-text-secondary">Sin saldos registrados</q-item-section>
            </q-item>
          </q-list>

          <div class="text-subtitle2 q-mt-md q-mb-xs">Últimas 10 operaciones</div>
          <q-list dense bordered style="max-height: 160px; overflow: auto">
            <q-item v-for="h in operacionesRecientes" :key="h.historialId">
              <q-item-section>
                {{ h.tipoOperacion }}
                <q-item-label caption>
                  {{ h.parMoneda || h.moneda || 'N/A' }} · {{ new Date(h.fechaHora).toLocaleString() }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>{{ h.estado }}</q-item-section>
            </q-item>
            <q-item v-if="!operacionesRecientes.length">
              <q-item-section class="xc-text-secondary">Sin operaciones registradas</q-item-section>
            </q-item>
          </q-list>

          <div class="text-subtitle2 q-mt-md q-mb-xs">Historial de restricciones/habilitaciones</div>
          <q-list dense bordered style="max-height: 160px; overflow: auto">
            <q-item v-for="r in detalle.historialRestricciones" :key="r.restriccionId">
              <q-item-section>
                {{ r.tipoAccion }}
                <q-item-label caption lines="2">{{ r.mensaje }}</q-item-label>
                <q-item-label caption>
                  Admin: {{ r.administrador || '-' }} · {{ r.estadoRestriccion }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>{{ new Date(r.fechaInicio).toLocaleString() }}</q-item-section>
            </q-item>
            <q-item v-if="!detalle.historialRestricciones?.length">
              <q-item-section class="xc-text-secondary">Sin restricciones registradas</q-item-section>
            </q-item>
          </q-list>

          <div class="row items-center q-col-gutter-sm q-mt-md">
            <div class="col">
              <q-input
                v-model="mensajeAccion"
                :label="detalle.estado === 'Activo' ? 'Mensaje de restricción' : 'Mensaje de habilitación'"
                outlined
                dense
                type="textarea"
                counter
                maxlength="300"
                :error="mensajeError !== ''"
                :error-message="mensajeError"
                @update:model-value="errorMessage = ''"
              />
            </div>
            <div class="col-12 col-sm-auto">
              <q-btn
                outline
                color="primary"
                icon="auto_awesome"
                :label="mensajeAccion.trim() ? 'Mejorar con IA' : 'Generar con IA'"
                :loading="generandoIa"
                :disable="detalle.esAdministrador"
                @click="onGenerarMensajeIa"
              />
            </div>
          </div>

          <div class="text-caption xc-text-secondary q-mt-xs">
            La IA usa el historial visible del usuario como contexto y no debe inventar acusaciones.
          </div>

          <q-banner
            v-if="errorMessage"
            dense
            class="xchang-banner xchang-banner--error q-mt-sm"
            rounded
          >
            {{ errorMessage }}
          </q-banner>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat label="Cerrar" />
          <q-btn
            v-if="detalle?.estado === 'Activo'"
            color="negative"
            label="Restringir"
            :disable="detalle?.esAdministrador || !mensajeValido"
            :loading="procesando"
            @click="onCambiarEstado('restringir')"
          />
          <q-btn
            v-else
            color="positive"
            label="Habilitar"
            :disable="detalle?.esAdministrador || !mensajeValido"
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
  generarMensajeIa,
} from '@/services/adminUsuarios'

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
const generandoIa = ref(false)
const errorMessage = ref('')

const filtroValido = computed(
  () => filtro.nombreUsuario.length <= 30 && filtro.correoElectronico.length <= 100,
)

const mensajeError = computed(() => {
  if (!mensajeAccion.value.trim()) return 'Ingrese un mensaje'
  if (mensajeAccion.value.trim().length > 300) return 'Máximo 300 caracteres'
  return ''
})

const mensajeValido = computed(() => mensajeError.value === '')

const operacionesRecientes = computed(() =>
  [...(detalle.value?.historialTransacciones || [])]
    .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))
    .slice(0, 10),
)

onMounted(cargar)

async function cargar() {
  cargando.value = true
  try {
    usuarios.value = (await buscarUsuarios(filtro)).data
  } finally {
    cargando.value = false
  }
}

async function verDetalle(usuarioId) {
  detalle.value = (await obtenerDetalleUsuario(usuarioId)).data
  mensajeAccion.value = ''
  errorMessage.value = ''
  dialogoAbierto.value = true
}

async function onGenerarMensajeIa() {
  if (!detalle.value) return

  generandoIa.value = true
  errorMessage.value = ''

  try {
    const tipoAccion = detalle.value.estado === 'Activo' ? 'Restricción' : 'Habilitación'
    const { data } = await generarMensajeIa(detalle.value.usuarioId, {
      tipoAccion,
      mensajeActual: mensajeAccion.value.trim(),
    })

    mensajeAccion.value = data.mensaje || ''
  } catch (e) {
    errorMessage.value = e.response?.data?.mensaje || 'No se pudo generar el mensaje con IA.'
  } finally {
    generandoIa.value = false
  }
}

async function onCambiarEstado(accion) {
  if (!mensajeValido.value) {
    errorMessage.value = mensajeError.value || 'Ingrese un mensaje'
    return
  }

  procesando.value = true
  errorMessage.value = ''

  try {
    if (accion === 'restringir') {
      await restringirUsuario(detalle.value.usuarioId, mensajeAccion.value.trim())
    } else {
      await habilitarUsuario(detalle.value.usuarioId, mensajeAccion.value.trim())
    }

    Notify.create({ type: 'positive', message: 'Estado actualizado correctamente.' })
    dialogoAbierto.value = false
    await cargar()
  } catch (e) {
    errorMessage.value = e.response?.data?.mensaje || 'No se pudo actualizar el usuario.'
  } finally {
    procesando.value = false
  }
}

function formatearDecimal(valor) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return '-'

  return Number(valor).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })
}
</script>
