<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Mis órdenes de compra</div>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="text-subtitle1 text-weight-medium q-mb-md">Publicar nueva orden</div>

      <q-form class="row q-col-gutter-md" @submit.prevent="onCrear">
        <div class="col-12 col-md-3">
          <q-select
            v-model="form.monedaDestinoId"
            label="Moneda que quiero comprar"
            outlined
            :options="monedaOptions"
            emit-value
            map-options
            :rules="[(val) => !!val || 'Requerido']"
          />
        </div>
        <div class="col-12 col-md-3">
          <q-select
            v-model="form.monedaOrigenId"
            label="Moneda con la que pago"
            outlined
            :options="monedaOptions"
            emit-value
            map-options
            :rules="[(val) => !!val || 'Requerido']"
          />
        </div>
        <div class="col-6 col-md-2">
          <q-input
            v-model.number="form.cantidad"
            type="number"
            label="Cantidad a comprar"
            outlined
            :rules="[(val) => val > 0 || 'Debe ser mayor a 0']"
          />
        </div>
        <div class="col-6 col-md-2">
          <q-input
            v-model.number="form.precioUnitario"
            type="number"
            step="0.0001"
            label="Tipo de cambio"
            outlined
            :rules="[(val) => val > 0 || 'Debe ser mayor a 0']"
          />
        </div>
        <div class="col-12 col-md-2">
          <q-select
            v-model="form.vigenciaHoras"
            label="Vigencia"
            outlined
            :options="vigenciaOptions"
            emit-value
            map-options
            :rules="[(val) => !!val || 'Requerido']"
          />
        </div>

        <div class="col-12" v-if="form.cantidad && form.precioUnitario">
          <q-banner dense class="bg-blue-1 text-blue-9" rounded>
            Pagarás aproximadamente {{ (form.cantidad * form.precioUnitario).toFixed(4) }} en la moneda de pago.
          </q-banner>
        </div>

        <div class="col-12">
          <q-banner v-if="errorMessage" dense class="bg-red-1 text-red-9" rounded>{{ errorMessage }}</q-banner>
          <q-banner v-if="successMessage" dense class="bg-green-1 text-green-9 q-mt-sm" rounded>
            {{ successMessage }}
          </q-banner>
        </div>

        <div class="col-12">
          <q-btn type="submit" color="primary" label="Publicar orden" :loading="creando" />
        </div>
      </q-form>
    </q-card>

    <q-card flat bordered class="q-pa-md">
      <div class="row items-center q-mb-md">
        <div class="text-subtitle1 text-weight-medium col">Historial de órdenes</div>
      </div>

      <q-table :rows="ordenes" :columns="columnas" row-key="ordenCompraId" :loading="cargando" flat>
        <template #body-cell-acciones="props">
          <q-td :props="props">
            <q-btn
              v-if="props.row.estado === 'Activa' || props.row.estado === 'Parcialmente ejecutada'"
              size="sm"
              color="negative"
              flat
              label="Cancelar"
              @click="abrirCancelacion(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <CancelarDialog
      v-if="ordenSeleccionada"
      v-model="dialogAbierto"
      tipo-operacion="Orden de compra"
      :referencia-id="ordenSeleccionada.ordenCompraId"
      @cancelado="onCancelado"
    />
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { getMonedas } from '@/services/monedas'
import { resolveParMonedaId } from '@/services/preciosPares'
import { getOrdenes, crearOrden } from '@/services/ordenes'
import CancelarDialog from '@/components/mercado/CancelarDialog.vue'

const monedaOptions = ref([])
const vigenciaOptions = [
  { label: '1 hora', value: 1 },
  { label: '6 horas', value: 6 },
  { label: '12 horas', value: 12 },
  { label: '24 horas', value: 24 },
]

const form = reactive({ monedaOrigenId: null, monedaDestinoId: null, cantidad: null, precioUnitario: null, vigenciaHoras: 24 })
const creando = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const ordenes = ref([])
const cargando = ref(false)

const columnas = [
  { name: 'par', label: 'Par', field: (row) => `${row.monedaOrigen}/${row.monedaDestino}`, align: 'left' },
  { name: 'cantidadOriginal', label: 'Cantidad', field: 'cantidadOriginal', align: 'right' },
  { name: 'cantidadPendiente', label: 'Pendiente', field: 'cantidadPendiente', align: 'right' },
  { name: 'precioUnitario', label: 'Precio', field: 'precioUnitario', align: 'right' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  {
    name: 'fechaExpiracion',
    label: 'Vigencia',
    field: (row) => (row.fechaExpiracion ? new Date(row.fechaExpiracion).toLocaleString() : '-'),
    align: 'left',
  },
  { name: 'acciones', label: '', field: 'acciones', align: 'right' },
]

const ordenSeleccionada = ref(null)
const dialogAbierto = ref(false)

onMounted(async () => {
  const { data } = await getMonedas()
  monedaOptions.value = data.map((m) => ({ label: `${m.codigoISO} - ${m.nombre}`, value: m.monedaId, iso: m.codigoISO }))
  await cargarOrdenes()
})

async function cargarOrdenes() {
  cargando.value = true
  try {
    const { data } = await getOrdenes()
    ordenes.value = data.ordenes
  } finally {
    cargando.value = false
  }
}

async function onCrear() {
  errorMessage.value = ''
  successMessage.value = ''

  if (form.monedaOrigenId === form.monedaDestinoId) {
    errorMessage.value = 'La moneda de pago y la moneda a comprar deben ser distintas.'
    return
  }

  creando.value = true
  try {
    const origen = monedaOptions.value.find((m) => m.value === form.monedaOrigenId)
    const destino = monedaOptions.value.find((m) => m.value === form.monedaDestinoId)
    const parMonedaId = await resolveParMonedaId(origen.iso, destino.iso)
    if (!parMonedaId) {
      errorMessage.value = 'No existe un par de monedas para esa combinación.'
      return
    }

    await crearOrden({
      parMonedaId,
      cantidad: form.cantidad,
      precioUnitario: form.precioUnitario,
      vigenciaHoras: form.vigenciaHoras,
    })
    successMessage.value = 'Orden publicada correctamente.'
    form.cantidad = null
    form.precioUnitario = null
    await cargarOrdenes()
  } catch (error) {
    errorMessage.value = error.response?.data?.error || error.response?.data?.mensaje || 'No se pudo publicar la orden.'
  } finally {
    creando.value = false
  }
}

function abrirCancelacion(row) {
  ordenSeleccionada.value = row
  dialogAbierto.value = true
}

function onCancelado(resultado) {
  Notify.create({ type: 'positive', message: `Orden cancelada. Reembolso: ${resultado.montoReembolsado} ${resultado.monedaReembolso}` })
  cargarOrdenes()
}
</script>
