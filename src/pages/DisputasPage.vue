<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Disputas</div>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">Operaciones recientes</div>
      <div class="text-caption text-grey-7 q-mb-sm">
        Si tienes un problema con la contraparte de una de tus operaciones, puedes abrir una disputa.
      </div>

      <q-list v-if="operaciones.length" bordered separator>
        <q-item v-for="op in operaciones" :key="`${op.operacionTipo}-${op.operacionReferenciaId}`">
          <q-item-section>
            <q-item-label>{{ op.contraparteNombre }} ({{ op.miRol === 'Comprador' ? 'vendedor' : 'comprador' }})</q-item-label>
            <q-item-label caption>{{ op.par }} · {{ new Date(op.fecha).toLocaleString() }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat color="negative" label="Abrir disputa" size="sm" @click="abrirDialogo(op)" />
          </q-item-section>
        </q-item>
      </q-list>
      <div v-else class="text-grey-7">No hay operaciones recientes disponibles.</div>
    </q-card>

    <q-card flat bordered class="q-pa-md">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">Mis disputas</div>

      <q-list v-if="misDisputas.length" bordered separator>
        <q-item v-for="d in misDisputas" :key="d.disputaId">
          <q-item-section>
            <q-item-label>{{ d.motivo }}</q-item-label>
            <q-item-label caption>
              Contraparte: {{ d.contraparteNombre }} · Admin: {{ d.administradorNombre || 'sin asignar' }}
            </q-item-label>
            <q-item-label v-if="d.resolucion" caption class="text-positive">
              Resolución ({{ d.criterioResolucion }}): {{ d.resolucion }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-badge :color="d.estado === 'Resuelta' ? 'positive' : 'orange'">{{ d.estado }}</q-badge>
          </q-item-section>
        </q-item>
      </q-list>
      <div v-else class="text-grey-7">No tienes disputas registradas.</div>
    </q-card>

    <q-dialog v-model="dialogoAbierto">
      <q-card style="min-width: 400px">
        <q-card-section class="text-h6">Abrir disputa contra {{ seleccionado?.contraparteNombre }}</q-card-section>
        <q-card-section>
          <q-input v-model="form.motivo" type="textarea" label="Motivo" outlined />
          <q-input v-model="form.evidenciaUrl" label="URL de evidencia (opcional)" outlined class="q-mt-md" />
          <q-banner v-if="errorMessage" dense class="bg-red-1 text-red-9 q-mt-sm" rounded>{{ errorMessage }}</q-banner>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup flat label="Cancelar" />
          <q-btn color="negative" label="Abrir disputa" :loading="enviando" @click="onEnviar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { getPendientes } from '@/services/calificaciones'
import { abrirDisputa, getMisDisputas } from '@/services/disputas'

const operaciones = ref([])
const misDisputas = ref([])

const dialogoAbierto = ref(false)
const seleccionado = ref(null)
const form = reactive({ motivo: '', evidenciaUrl: '' })
const enviando = ref(false)
const errorMessage = ref('')

async function cargar() {
  const [{ data: ops }, { data: disputas }] = await Promise.all([getPendientes(), getMisDisputas()])
  operaciones.value = ops
  misDisputas.value = disputas
}

onMounted(cargar)

function abrirDialogo(op) {
  seleccionado.value = op
  form.motivo = ''
  form.evidenciaUrl = ''
  errorMessage.value = ''
  dialogoAbierto.value = true
}

async function onEnviar() {
  enviando.value = true
  errorMessage.value = ''
  try {
    await abrirDisputa({
      operacionReferenciaId: seleccionado.value.operacionReferenciaId,
      motivo: form.motivo,
      evidenciaUrl: form.evidenciaUrl || null,
    })
    dialogoAbierto.value = false
    Notify.create({ type: 'positive', message: 'Disputa abierta. Un administrador la revisará.' })
    await cargar()
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo abrir la disputa.'
  } finally {
    enviando.value = false
  }
}
</script>
