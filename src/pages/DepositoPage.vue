<template>
  <q-page class="q-pa-md">
    <div class="xc-page-head">
      <span class="xc-section-kicker"><q-icon name="south_west" size="14px" /> Depósito</span>
      <h1 class="xc-section-title">Depositar fondos</h1>
      <div class="xc-section-bar" aria-hidden="true" />
    </div>

    <q-card flat bordered class="q-pa-md q-mb-md xc-card-accent">
      <q-form ref="formRef" @submit.prevent="onCalcular">
        <div class="row q-col-gutter-md items-start">
          <div class="col-12 col-md-3">
            <q-select
              v-model="form.monedaId"
              label="Moneda"
              outlined
              :options="monedaOptions"
              emit-value
              map-options
              :rules="[(val) => validarRequerido(val, 'Seleccione una moneda')]"
              @update:model-value="limpiarResumen"
            />
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="form.metodoPagoId"
              label="Método de pago"
              outlined
              :options="metodoOptions"
              emit-value
              map-options
              :rules="[(val) => validarRequerido(val, 'Seleccione un método de pago')]"
              @update:model-value="limpiarResumen"
            />
          </div>

          <div class="col-12 col-md-3">
            <q-input
              v-model.number="form.monto"
              type="number"
              min="0"
              label="Monto a depositar"
              outlined
              :rules="[validarMonto]"
              @update:model-value="limpiarResumen"
            />
          </div>

          <div class="col-12 col-md-3">
            <q-btn
              type="submit"
              color="primary"
              label="Calcular"
              class="full-width q-mt-sm"
              :disable="!isFormValid"
              :loading="calculando"
            />
          </div>
        </div>
      </q-form>

      <q-banner v-if="errorMessage" dense class="xchang-banner xchang-banner--error q-mt-md" rounded>
        {{ errorMessage }}
      </q-banner>
    </q-card>

    <q-card v-if="resumen" flat bordered class="q-pa-md q-mb-md xc-card-accent">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">Resumen del depósito</div>

      <q-list dense separator>
        <q-item>
          <q-item-section>Moneda</q-item-section>
          <q-item-section side>{{ monedaLabel }}</q-item-section>
        </q-item>

        <q-item>
          <q-item-section>Método de pago</q-item-section>
          <q-item-section side>{{ metodoLabel }}</q-item-section>
        </q-item>

        <q-item>
          <q-item-section>Monto a depositar</q-item-section>
          <q-item-section side>{{ formatearMontoValor(resumen.montoDepositado) }} {{ codigoResumen }}</q-item-section>
        </q-item>

        <q-item>
          <q-item-section>Comisión aplicada</q-item-section>
          <q-item-section side>{{ formatearMontoValor(resumen.comisionAplicada) }} {{ codigoResumen }}</q-item-section>
        </q-item>

        <q-item>
          <q-item-section class="text-weight-bold">Total a pagar</q-item-section>
          <q-item-section side class="text-weight-bold text-positive">
            {{ formatearMontoValor(resumen.totalPagado) }} {{ codigoResumen }}
          </q-item-section>
        </q-item>
      </q-list>

      <q-banner
        v-if="comisionAplicada > 0"
        dense
        rounded
        class="xchang-banner xchang-banner--warning q-mt-sm"
      >
        Se aplica una comisión de {{ formatearMontoValor(comisionAplicada) }} {{ codigoResumen }}
        por el método de pago seleccionado.
      </q-banner>

      <q-btn
        color="primary"
        class="q-mt-md"
        label="Confirmar depósito"
        :loading="confirmando"
        @click="onConfirmar"
      />
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { getMonedas } from '@/services/monedas'
import { getMetodosPago, calcular, registrar } from '@/services/deposito'
import { useBilleteraStore } from '@/stores/billetera'
import { formatearMonto } from '@/utils/formato'
import { normalizarMensajeError, validarMonto, validarRequerido } from '@/utils/validaciones'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const billeteraStore = useBilleteraStore()

const formRef = ref(null)
const monedaOptions = ref([])
const metodoOptions = ref([])
const form = reactive({ monedaId: null, metodoPagoId: null, monto: null })

const calculando = ref(false)
const confirmando = ref(false)
const errorMessage = ref('')
const resumen = ref(null)

const monedaLabel = computed(() => monedaOptions.value.find((o) => o.value === form.monedaId)?.label || '')
const metodoLabel = computed(() => metodoOptions.value.find((o) => o.value === form.metodoPagoId)?.label || '')
const codigoResumen = computed(() => resumen.value?.codigoISO || resumen.value?.codigoIso || monedaLabel.value.split(' - ')[0] || '')
const comisionAplicada = computed(() => numero(resumen.value?.comisionAplicada))

const isFormValid = computed(
  () =>
    validarRequerido(form.monedaId, 'Seleccione una moneda') === true &&
    validarRequerido(form.metodoPagoId, 'Seleccione un método de pago') === true &&
    validarMonto(form.monto) === true,
)

onMounted(async () => {
  const [{ data: monedas }, { data: metodos }] = await Promise.all([getMonedas(), getMetodosPago()])
  monedaOptions.value = (Array.isArray(monedas) ? monedas : monedas?.registros || monedas?.monedas || []).map((m) => ({
    label: `${m.codigoISO || m.codigoIso} - ${m.nombre}`,
    value: m.monedaId ?? m.monedaID,
  }))
  metodoOptions.value = (Array.isArray(metodos) ? metodos : metodos?.registros || []).map((m) => ({
    label: m.nombre,
    value: m.metodoPagoId ?? m.metodoPagoID,
  }))

  const monedaQuery = Number(route.query.monedaId)
  if (monedaQuery && monedaOptions.value.some((o) => o.value === monedaQuery)) {
    form.monedaId = monedaQuery
  }
})

function numero(valor) {
  const n = Number(valor)
  return Number.isFinite(n) ? n : 0
}

function formatearMontoValor(valor) {
  return formatearMonto(numero(valor))
}

function limpiarResumen() {
  resumen.value = null
  errorMessage.value = ''
}

async function onCalcular() {
  const valido = await formRef.value?.validate()
  if (!valido || !isFormValid.value) return

  errorMessage.value = ''
  resumen.value = null
  calculando.value = true

  try {
    const { data } = await calcular({ ...form })
    resumen.value = data
  } catch (error) {
    errorMessage.value = normalizarMensajeError(error, 'Monto inválido')
  } finally {
    calculando.value = false
  }
}

async function onConfirmar() {
  confirmando.value = true
  errorMessage.value = ''

  try {
    await registrar({ ...form })
    await billeteraStore.refrescar()
    $q.notify({ type: 'positive', message: 'Depósito realizado. Se enviará el voucher a tu correo electrónico.' })
    router.push({ name: 'billetera' })
  } catch (error) {
    errorMessage.value = normalizarMensajeError(error, 'No se pudo registrar el depósito.')
  } finally {
    confirmando.value = false
  }
}
</script>
