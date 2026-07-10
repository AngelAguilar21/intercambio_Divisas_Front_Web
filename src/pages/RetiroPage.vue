<template>
  <q-page class="q-pa-md">
    <div class="xc-page-head">
      <span class="xc-section-kicker"><q-icon name="north_east" size="14px" /> Retiro</span>
      <h1 class="xc-section-title">Retirar fondos</h1>
      <div class="xc-section-bar" aria-hidden="true" />
    </div>

    <q-card flat bordered class="q-pa-md xc-card-accent">
      <q-form ref="formRef" @submit.prevent="onConfirmarRetiro">
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-select
              v-model="form.monedaId"
              label="Moneda"
              outlined
              :options="monedaOptions"
              emit-value
              map-options
              :rules="[(val) => validarRequerido(val, 'Seleccione una moneda')]"
              @update:model-value="resumen = null"
            />
          </div>

          <div class="col-12 col-md-4">
            <q-select
              v-model="form.metodoPagoId"
              label="Método de cobro"
              outlined
              :options="metodoOptions"
              emit-value
              map-options
              :rules="[(val) => validarRequerido(val, 'Seleccione un método de cobro')]"
              @update:model-value="resumen = null"
            />
          </div>

          <div class="col-12 col-md-4">
            <q-input
              v-model.number="form.monto"
              type="number"
              label="Monto a retirar"
              outlined
              :rules="[validarMontoRetiro]"
              @update:model-value="resumen = null"
            />
          </div>
        </div>

        <q-btn
          type="submit"
          class="q-mt-md"
          color="primary"
          label="Confirmar retiro"
          :disable="!isFormValid"
          :loading="calculando"
        />
      </q-form>

      <q-banner v-if="errorGeneral" dense rounded class="xchang-banner xchang-banner--error q-mt-sm">
        {{ errorGeneral }}
      </q-banner>
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

          <q-banner v-if="resumen.comisionAplicada > 0" dense rounded class="xchang-banner xchang-banner--warning q-mt-sm">
            Se aplica una comisión de {{ resumen.comisionAplicada }} {{ resumen.codigoISO }} por el método de cobro seleccionado.
          </q-banner>
        </q-card-section>

        <q-card-section v-if="errorDialog" class="text-negative">{{ errorDialog }}</q-card-section>

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
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { getMonedas } from '@/services/monedas'
import { getBilletera } from '@/services/billetera'
import { getMetodosCobro, calcular, registrar } from '@/services/retiro'
import { useBilleteraStore } from '@/stores/billetera'
import { normalizarMensajeError, validarMonto, validarRequerido } from '@/utils/validaciones'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const billeteraStore = useBilleteraStore()

const formRef = ref(null)
const monedaOptions = ref([])
const metodoOptions = ref([])
const saldos = ref([])
const form = reactive({ monedaId: null, metodoPagoId: null, monto: null })

const calculando = ref(false)
const confirmando = ref(false)
const errorGeneral = ref('')
const errorDialog = ref('')
const resumen = ref(null)
const showDialog = ref(false)

const saldoDisponible = computed(() => {
  if (!form.monedaId) return null
  const s = saldos.value.find((x) => x.monedaId === form.monedaId)
  return s ? Number(s.saldoDisponible) : 0
})

const monedaLabel = computed(() => monedaOptions.value.find((o) => o.value === form.monedaId)?.label || '')
const metodoLabel = computed(() => metodoOptions.value.find((o) => o.value === form.metodoPagoId)?.label || '')

function validarMontoRetiro(valor) {
  const base = validarMonto(valor)
  if (base !== true) return base
  if (saldoDisponible.value !== null && Number(valor) > saldoDisponible.value) return 'Saldo insuficiente'
  return true
}

const isFormValid = computed(
  () =>
    validarRequerido(form.monedaId, 'Seleccione una moneda') === true &&
    validarRequerido(form.metodoPagoId, 'Seleccione un método de cobro') === true &&
    validarMontoRetiro(form.monto) === true,
)

onMounted(async () => {
  const [{ data: monedas }, { data: metodos }, { data: billetera }] = await Promise.all([
    getMonedas(),
    getMetodosCobro(),
    getBilletera(),
  ])
  monedaOptions.value = monedas.map((m) => ({ label: `${m.codigoISO} - ${m.nombre}`, value: m.monedaId }))
  metodoOptions.value = metodos.map((m) => ({ label: m.nombre, value: m.metodoPagoId }))
  saldos.value = billetera.saldos || []

  const monedaQuery = Number(route.query.monedaId)
  if (monedaQuery && monedaOptions.value.some((o) => o.value === monedaQuery)) {
    form.monedaId = monedaQuery
  }
})

async function onConfirmarRetiro() {
  const valido = await formRef.value?.validate()
  if (!valido || !isFormValid.value) return

  errorGeneral.value = ''
  resumen.value = null
  calculando.value = true
  try {
    const { data } = await calcular({ ...form })
    resumen.value = data
    showDialog.value = true
  } catch (error) {
    errorGeneral.value = normalizarMensajeError(error, 'Monto inválido')
  } finally {
    calculando.value = false
  }
}

async function onConfirmar() {
  confirmando.value = true
  errorDialog.value = ''
  try {
    await registrar({ ...form })
    await billeteraStore.refrescar()
    showDialog.value = false
    $q.notify({ type: 'positive', message: 'Retiro realizado. Se enviará el comprobante a tu correo electrónico.' })
    router.push({ name: 'billetera' })
  } catch (error) {
    errorDialog.value = normalizarMensajeError(error, 'No se pudo registrar el retiro.')
  } finally {
    confirmando.value = false
  }
}
</script>
