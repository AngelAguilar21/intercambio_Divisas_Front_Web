<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Depositar fondos</div>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-md-3">
          <q-select v-model="form.monedaId" label="Moneda" outlined :options="monedaOptions" emit-value map-options />
        </div>
        <div class="col-12 col-md-3">
          <q-select v-model="form.metodoPagoId" label="Método de pago" outlined :options="metodoOptions" emit-value map-options />
        </div>
        <div class="col-12 col-md-3">
          <q-input v-model.number="form.monto" type="number" label="Monto a depositar" outlined />
        </div>
        <div class="col-12 col-md-3">
          <q-btn color="primary" label="Calcular" class="full-width" :loading="calculando" @click="onCalcular" />
        </div>
      </div>
      <q-banner v-if="errorMessage" dense class="bg-red-1 text-red-9 q-mt-md" rounded>{{ errorMessage }}</q-banner>
    </q-card>

    <q-card v-if="resumen" flat bordered class="q-pa-md q-mb-md">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">Resumen</div>
      <q-list dense>
        <q-item>
          <q-item-section>Monto a depositar</q-item-section>
          <q-item-section side>{{ resumen.montoDepositado }} {{ resumen.codigoISO }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>Comisión</q-item-section>
          <q-item-section side>{{ resumen.comisionAplicada }} {{ resumen.codigoISO }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>Total a pagar</q-item-section>
          <q-item-section side class="text-weight-bold">{{ resumen.totalPagado }} {{ resumen.codigoISO }}</q-item-section>
        </q-item>
      </q-list>
      <q-btn color="primary" class="q-mt-md" label="Confirmar depósito" :loading="confirmando" @click="onConfirmar" />
    </q-card>

    <q-card v-if="resultado" flat bordered class="q-pa-md bg-green-1">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">Depósito registrado</div>
      <q-list dense>
        <q-item>
          <q-item-section>Nuevo saldo</q-item-section>
          <q-item-section side>{{ resultado.nuevoSaldo }} {{ resultado.codigoISO }}</q-item-section>
        </q-item>
      </q-list>
      <q-banner dense class="bg-blue-1 text-blue-9 q-mt-sm" rounded>
        Se enviará un correo de confirmación con el voucher a tu correo electrónico registrado.
      </q-banner>

      <div class="q-mt-md">
        <div class="text-caption text-grey-8 q-mb-xs">Comprobante de pago (JPG, PNG o PDF, máx. 5 MB)</div>
        <q-file v-model="archivoVoucher" outlined dense accept=".jpg,.jpeg,.png,.pdf" style="max-width: 400px">
          <template #append>
            <q-icon name="attach_file" />
          </template>
        </q-file>
        <q-btn
          class="q-mt-sm"
          color="secondary"
          label="Subir comprobante"
          :loading="subiendoVoucher"
          :disable="!archivoVoucher"
          @click="onSubirVoucher"
        />
        <q-banner v-if="voucherUrl" dense class="bg-blue-1 text-blue-9 q-mt-sm" rounded>
          Comprobante subido:
          <a :href="assetUrl(voucherUrl)" target="_blank" rel="noopener">ver archivo</a>
        </q-banner>
      </div>

      <q-btn flat color="primary" class="q-mt-md" label="Nuevo depósito" @click="reiniciar" />
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { getMonedas } from '@/services/monedas'
import { getMetodosPago, calcular, registrar, subirVoucher } from '@/services/deposito'

const monedaOptions = ref([])
const metodoOptions = ref([])
const form = reactive({ monedaId: null, metodoPagoId: null, monto: null })

const calculando = ref(false)
const confirmando = ref(false)
const subiendoVoucher = ref(false)
const errorMessage = ref('')

const resumen = ref(null)
const resultado = ref(null)
const archivoVoucher = ref(null)
const voucherUrl = ref('')

function assetUrl(path) {
  return `${import.meta.env.ASSET_BASE_URL}${path}`
}

onMounted(async () => {
  const [{ data: monedas }, { data: metodos }] = await Promise.all([getMonedas(), getMetodosPago()])
  monedaOptions.value = monedas.map((m) => ({ label: `${m.codigoISO} - ${m.nombre}`, value: m.monedaId }))
  metodoOptions.value = metodos.map((m) => ({ label: m.nombre, value: m.metodoPagoId }))
})

async function onCalcular() {
  errorMessage.value = ''
  resumen.value = null
  resultado.value = null
  calculando.value = true
  try {
    const { data } = await calcular(form)
    resumen.value = data
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo calcular el depósito.'
  } finally {
    calculando.value = false
  }
}

async function onConfirmar() {
  confirmando.value = true
  errorMessage.value = ''
  try {
    const { data } = await registrar(form)
    resultado.value = data
    voucherUrl.value = ''
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo registrar el depósito.'
  } finally {
    confirmando.value = false
  }
}

async function onSubirVoucher() {
  subiendoVoucher.value = true
  try {
    const { data } = await subirVoucher(resultado.value.depositoId, archivoVoucher.value)
    voucherUrl.value = data.voucherUrl
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo subir el comprobante.'
  } finally {
    subiendoVoucher.value = false
  }
}

function reiniciar() {
  resumen.value = null
  resultado.value = null
  archivoVoucher.value = null
  voucherUrl.value = ''
  form.monto = null
}
</script>
