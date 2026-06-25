<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Retirar fondos</div>

    <q-card flat bordered class="q-pa-md">
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-select
            v-model="form.monedaId"
            label="Moneda"
            outlined
            :options="monedaOptions"
            emit-value
            map-options
            @update:model-value="touched.monedaId = true"
          />
          <div v-if="touched.monedaId && !form.monedaId" class="text-caption text-negative q-mt-xs">
            Seleccione una moneda
          </div>
        </div>

        <div class="col-12 col-md-4">
          <q-select
            v-model="form.metodoPagoId"
            label="Método de cobro"
            outlined
            :options="metodoOptions"
            emit-value
            map-options
            @update:model-value="touched.metodoPagoId = true"
          />
          <div v-if="touched.metodoPagoId && !form.metodoPagoId" class="text-caption text-negative q-mt-xs">
            Seleccione un método de cobro
          </div>
        </div>

        <div class="col-12 col-md-4">
          <q-input
            v-model.number="form.monto"
            type="number"
            label="Monto a retirar"
            outlined
            @update:model-value="touched.monto = true"
          />
          <div v-if="touched.monto && montoError" class="text-caption text-negative q-mt-xs">
            {{ montoError }}
          </div>
        </div>
      </div>

      <q-btn
        class="q-mt-md"
        color="primary"
        label="Confirmar retiro"
        :disable="!isFormValid"
        :loading="calculando"
        @click="onConfirmarRetiro"
      />

      <div v-if="errorGeneral" class="text-caption text-negative q-mt-sm">{{ errorGeneral }}</div>
    </q-card>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 380px">
        <q-card-section>
          <div class="text-h6">Resumen del retiro</div>
        </q-card-section>

        <q-card-section v-if="resumen">
          <q-list dense separator>
            <q-item>
              <q-item-section>Moneda</q-item-section>
              <q-item-section side>{{ monedaLabel }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Método de cobro</q-item-section>
              <q-item-section side>{{ metodoLabel }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Monto a retirar</q-item-section>
              <q-item-section side>{{ resumen.montoRetirado }} {{ resumen.codigoISO }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Comisión aplicada</q-item-section>
              <q-item-section side>{{ resumen.comisionAplicada }} {{ resumen.codigoISO }}</q-item-section>
            </q-item>
            <q-item>
              <q-item-section class="text-weight-bold">Monto final a recibir</q-item-section>
              <q-item-section side class="text-weight-bold text-positive">
                {{ resumen.montoFinalRecibido }} {{ resumen.codigoISO }}
              </q-item-section>
            </q-item>
          </q-list>

          <div v-if="resumen.comisionAplicada > 0" class="text-caption text-orange-9 q-mt-sm">
            * Se aplica una comisión de {{ resumen.comisionAplicada }} {{ resumen.codigoISO }} por el método de cobro seleccionado.
          </div>
        </q-card-section>

        <q-card-section v-if="errorDialog" class="text-negative">
          {{ errorDialog }}
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" :disable="confirmando" @click="showDialog = false" />
          <q-btn color="primary" label="Confirmar" :loading="confirmando" @click="onConfirmar" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { getMonedas } from '@/services/monedas'
import { getBilletera } from '@/services/billetera'
import { getMetodosCobro, calcular, registrar } from '@/services/retiro'

const router = useRouter()
const $q = useQuasar()

const monedaOptions = ref([])
const metodoOptions = ref([])
const saldos = ref([])
const form = reactive({ monedaId: null, metodoPagoId: null, monto: null })
const touched = reactive({ monedaId: false, metodoPagoId: false, monto: false })

const calculando = ref(false)
const confirmando = ref(false)
const errorGeneral = ref('')
const errorDialog = ref('')

const resumen = ref(null)
const showDialog = ref(false)

const saldoDisponible = computed(() => {
  if (!form.monedaId) return null
  const s = saldos.value.find((x) => x.monedaId === form.monedaId)
  return s ? s.saldoDisponible : null
})

const monedaLabel = computed(() => {
  const opt = monedaOptions.value.find((o) => o.value === form.monedaId)
  return opt ? opt.label : ''
})

const metodoLabel = computed(() => {
  const opt = metodoOptions.value.find((o) => o.value === form.metodoPagoId)
  return opt ? opt.label : ''
})

const montoError = computed(() => {
  const m = form.monto
  if (m === null || m === undefined || m === '' || isNaN(m)) return null
  if (m <= 0) return 'El monto debe ser mayor a 0'
  if (m > 1_000_000) return 'Monto máximo excedido'
  if (saldoDisponible.value !== null && m > saldoDisponible.value) return 'Saldo insuficiente'
  return null
})

const isFormValid = computed(() => {
  const m = form.monto
  const validMonto = m !== null && m !== undefined && m !== '' && !isNaN(m)
  return !!form.monedaId && !!form.metodoPagoId && validMonto && !montoError.value
})

onMounted(async () => {
  const [{ data: monedas }, { data: metodos }, { data: billetera }] = await Promise.all([
    getMonedas(),
    getMetodosCobro(),
    getBilletera(),
  ])
  monedaOptions.value = monedas.map((m) => ({ label: `${m.codigoISO} - ${m.nombre}`, value: m.monedaId }))
  metodoOptions.value = metodos.map((m) => ({ label: m.nombre, value: m.metodoPagoId }))
  saldos.value = billetera.saldos || []
})

async function onConfirmarRetiro() {
  touched.monedaId = true
  touched.metodoPagoId = true
  touched.monto = true
  if (!isFormValid.value) return
  errorGeneral.value = ''
  resumen.value = null
  calculando.value = true
  try {
    const { data } = await calcular(form)
    resumen.value = data
    showDialog.value = true
  } catch (error) {
    errorGeneral.value = error.response?.data?.mensaje || 'No se pudo calcular el retiro.'
  } finally {
    calculando.value = false
  }
}

async function onConfirmar() {
  confirmando.value = true
  errorDialog.value = ''
  try {
    await registrar(form)
    showDialog.value = false
    $q.notify({ type: 'positive', message: 'Retiro realizado. Se enviará el comprobante a tu correo electrónico.' })
    router.push({ name: 'billetera' })
  } catch (error) {
    errorDialog.value = error.response?.data?.mensaje || 'No se pudo registrar el retiro.'
  } finally {
    confirmando.value = false
  }
}
</script>
