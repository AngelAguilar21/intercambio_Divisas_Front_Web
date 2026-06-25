<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Disputas (administración)</div>

    <q-card flat bordered class="q-pa-md">
      <q-list v-if="disputas.length" bordered separator>
        <q-item v-for="d in disputas" :key="d.disputaId">
          <q-item-section>
            <q-item-label>
              {{ d.usuarioNombre }} vs {{ d.contraparteNombre || '—' }}
              <q-badge :color="d.estado === 'Resuelta' ? 'positive' : 'orange'" class="q-ml-sm">{{
                d.estado
              }}</q-badge>
            </q-item-label>
            <q-item-label caption>{{ d.motivo }}</q-item-label>
            <q-item-label caption
              >Abierta: {{ new Date(d.fechaApertura).toLocaleString() }}</q-item-label
            >
            <q-item-label v-if="d.resolucion" caption class="text-positive">
              Resolución ({{ d.criterioResolucion }}): {{ d.resolucion }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn
              v-if="d.estado !== 'Resuelta'"
              color="primary"
              size="sm"
              label="Resolver"
              @click="abrirResolver(d)"
            />
          </q-item-section>
        </q-item>
      </q-list>
      <div v-else class="text-grey-7">No hay disputas registradas.</div>
    </q-card>

    <q-dialog v-model="dialogoAbierto">
      <q-card style="min-width: 420px">
        <q-card-section class="text-h6">Resolver disputa</q-card-section>
        <q-card-section>
          <q-select
            v-model="form.criterioResolucion"
            label="Criterio"
            outlined
            :options="['A favor del comprador', 'A favor del vendedor', 'Transacción nula']"
          />
          <q-input
            v-model="form.resolucion"
            type="textarea"
            label="Detalle de la resolución"
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
          <q-btn
            color="primary"
            label="Confirmar resolución"
            :loading="enviando"
            @click="onResolver"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { getTodasLasDisputas, resolverDisputa } from '@/services/disputas'

const disputas = ref([])
const dialogoAbierto = ref(false)
const seleccionada = ref(null)
const form = reactive({ criterioResolucion: 'A favor del comprador', resolucion: '' })
const enviando = ref(false)
const errorMessage = ref('')

async function cargar() {
  const { data } = await getTodasLasDisputas()
  disputas.value = data
}

onMounted(cargar)

function abrirResolver(d) {
  seleccionada.value = d
  form.criterioResolucion = 'A favor del comprador'
  form.resolucion = ''
  errorMessage.value = ''
  dialogoAbierto.value = true
}

async function onResolver() {
  if (!form.resolucion) {
    errorMessage.value = 'Debes indicar el detalle de la resolución.'
    return
  }
  enviando.value = true
  errorMessage.value = ''
  try {
    await resolverDisputa(seleccionada.value.disputaId, form)
    dialogoAbierto.value = false
    Notify.create({ type: 'positive', message: 'Disputa resuelta.' })
    await cargar()
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo resolver la disputa.'
  } finally {
    enviando.value = false
  }
}
</script>
