<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Calificaciones</div>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">Pendientes de calificar</div>

      <q-list v-if="pendientes.length" bordered separator>
        <q-item v-for="p in pendientes" :key="`${p.operacionTipo}-${p.operacionReferenciaId}`">
          <q-item-section>
            <q-item-label
              >{{ p.contraparteNombre }} ({{
                p.miRol === 'Comprador' ? 'vendedor' : 'comprador'
              }})</q-item-label
            >
            <q-item-label caption
              >{{ p.par }} · {{ new Date(p.fecha).toLocaleString() }}</q-item-label
            >
          </q-item-section>
          <q-item-section side>
            <q-btn color="primary" label="Calificar" size="sm" @click="abrirDialogo(p)" />
          </q-item-section>
        </q-item>
      </q-list>
      <div v-else class="text-grey-7">No tienes operaciones pendientes de calificar.</div>
    </q-card>

    <q-card flat bordered class="q-pa-md">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">
        Calificaciones recibidas
        <q-badge v-if="resumen" color="primary" class="q-ml-sm">
          {{
            resumen.promedio != null ? resumen.promedio.toFixed(1) + ' / 5' : 'Sin calificaciones'
          }}
        </q-badge>
      </div>

      <q-list v-if="resumen?.calificaciones?.length" bordered separator>
        <q-item v-for="c in resumen.calificaciones" :key="c.calificacionId">
          <q-item-section>
            <q-item-label>
              <q-rating v-model="c.puntuacion" readonly size="1em" color="orange" />
              {{ c.calificadorNombre }}
            </q-item-label>
            <q-item-label caption v-if="c.comentario">{{ c.comentario }}</q-item-label>
            <q-item-label caption>{{
              new Date(c.fechaCalificacion).toLocaleString()
            }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              v-if="!c.reportada"
              flat
              dense
              size="sm"
              color="negative"
              label="Reportar"
              @click="onReportar(c.calificacionId)"
            />
            <q-badge v-else color="grey">Reportada</q-badge>
          </q-item-section>
        </q-item>
      </q-list>
      <div v-else class="text-grey-7">Aún no tienes calificaciones.</div>
    </q-card>

    <q-dialog v-model="dialogoAbierto">
      <q-card style="min-width: 350px">
        <q-card-section class="text-h6"
          >Calificar a {{ seleccionado?.contraparteNombre }}</q-card-section
        >
        <q-card-section>
          <q-rating v-model="form.puntuacion" size="2em" color="orange" :max="5" />
          <q-input
            v-model="form.comentario"
            type="textarea"
            label="Comentario (opcional)"
            outlined
            class="q-mt-md"
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
          <q-btn v-close-popup flat label="Cancelar" />
          <q-btn color="primary" label="Enviar" :loading="enviando" @click="onEnviar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { useAuthStore } from '@/stores/auth'
import {
  getPendientes,
  crearCalificacion,
  getCalificacionesUsuario,
  reportarCalificacion,
} from '@/services/calificaciones'

const authStore = useAuthStore()
const pendientes = ref([])
const resumen = ref(null)

const dialogoAbierto = ref(false)
const seleccionado = ref(null)
const form = reactive({ puntuacion: 5, comentario: '' })
const enviando = ref(false)
const errorMessage = ref('')

async function cargar() {
  const [{ data: pend }, { data: res }] = await Promise.all([
    getPendientes(),
    getCalificacionesUsuario(authStore.user.usuarioId),
  ])
  pendientes.value = pend
  resumen.value = res
}

onMounted(cargar)

function abrirDialogo(p) {
  seleccionado.value = p
  form.puntuacion = 5
  form.comentario = ''
  errorMessage.value = ''
  dialogoAbierto.value = true
}

async function onEnviar() {
  enviando.value = true
  errorMessage.value = ''
  try {
    await crearCalificacion({
      operacionTipo: seleccionado.value.operacionTipo,
      operacionReferenciaId: seleccionado.value.operacionReferenciaId,
      puntuacion: form.puntuacion,
      comentario: form.comentario || null,
    })
    dialogoAbierto.value = false
    Notify.create({ type: 'positive', message: 'Calificación enviada.' })
    await cargar()
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo enviar la calificación.'
  } finally {
    enviando.value = false
  }
}

async function onReportar(id) {
  await reportarCalificacion(id)
  Notify.create({ type: 'info', message: 'Comentario reportado al administrador.' })
  await cargar()
}
</script>
