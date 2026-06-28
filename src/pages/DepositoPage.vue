<template>
  <q-page class="q-pa-md">
    <div class="xc-page-head">
      <span class="xc-section-kicker">
        <q-icon name="south_west" size="14px" />
        Depósito
      </span>
      <h1 class="xc-section-title">Depositar fondos</h1>
      <div class="xc-section-bar" aria-hidden="true" />
    </div>

    <q-card flat bordered class="q-pa-md q-mb-md xc-card-accent">
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-md-3">
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
        <div class="col-12 col-md-3">
          <q-select
            v-model="form.metodoPagoId"
            label="Método de pago"
            outlined
            :options="metodoOptions"
            emit-value
            map-options
            @update:model-value="touched.metodoPagoId = true"
          />
          <div v-if="touched.metodoPagoId && !form.metodoPagoId" class="text-caption text-negative q-mt-xs">
            Seleccione un método de pago
          </div>
        </div>
        <div class="col-12 col-md-3">
          <q-input
            v-model.number="form.monto"
            type="number"
            label="Monto a depositar"
            outlined
            @update:model-value="touched.monto = true"
          />
          <div v-if="touched.monto && montoError" class="text-caption text-negative q-mt-xs">
            {{ montoError }}
          </div>
        </div>
        <div class="col-12 col-md-3">
          <q-btn
            color="primary"
            label="Calcular"
            class="full-width"
            :disable="!isFormValid"
            :loading="calculando"
            @click="onCalcular"
          />
        </div>
      </div>
      <q-banner
        v-if="errorMessage"
        dense
        class="xchang-banner xchang-banner--error q-mt-md"
        rounded
        >{{ errorMessage }}</q-banner
      >
    </q-card>

    <q-card v-if="resumen" flat bordered class="q-pa-md q-mb-md xc-card-accent">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">Resumen</div>
      <q-list dense>
        <q-item>
          <q-item-section>Monto a depositar</q-item-section>
          <q-item-section side
            >{{ resumen.montoDepositado }} {{ resumen.codigoISO }}</q-item-section
          >
        </q-item>
        <q-item>
          <q-item-section>Comisión</q-item-section>
          <q-item-section side
            >{{ resumen.comisionAplicada }} {{ resumen.codigoISO }}</q-item-section
          >
        </q-item>
        <q-item>
          <q-item-section>Total a pagar</q-item-section>
          <q-item-section side class="text-weight-bold"
            >{{ resumen.totalPagado }} {{ resumen.codigoISO }}</q-item-section
          >
        </q-item>
      </q-list>
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

const route = useRoute()
const router = useRouter()
const $q = useQuasar()
const billeteraStore = useBilleteraStore()

const monedaOptions = ref([])
const metodoOptions = ref([])
const form = reactive({ monedaId: null, metodoPagoId: null, monto: null })
const touched = reactive({ monedaId: false, metodoPagoId: false, monto: false })

const calculando = ref(false)
const confirmando = ref(false)
const errorMessage = ref('')

const resumen = ref(null)

const montoError = computed(() => {
  const m = form.monto
  if (m === null || m === undefined || m === '' || isNaN(m)) return null
  if (m <= 0) return 'El monto debe ser mayor a 0'
  if (m > 1_000_000) return 'Monto máximo excedido'
  return null
})

const isFormValid = computed(() => {
  const m = form.monto
  const validMonto = m !== null && m !== undefined && m !== '' && !isNaN(m)
  return !!form.monedaId && !!form.metodoPagoId && validMonto && !montoError.value
})

onMounted(async () => {
  const [{ data: monedas }, { data: metodos }] = await Promise.all([getMonedas(), getMetodosPago()])
  monedaOptions.value = monedas.map((m) => ({
    label: `${m.codigoISO} - ${m.nombre}`,
    value: m.monedaId,
  }))
  metodoOptions.value = metodos.map((m) => ({ label: m.nombre, value: m.metodoPagoId }))

  const monedaQuery = Number(route.query.monedaId)
  if (monedaQuery && monedaOptions.value.some((o) => o.value === monedaQuery)) {
    form.monedaId = monedaQuery
  }
})

async function onCalcular() {
  touched.monedaId = true
  touched.metodoPagoId = true
  touched.monto = true
  if (!isFormValid.value) return
  errorMessage.value = ''
  resumen.value = null
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
    await registrar(form)
    await billeteraStore.refrescar()
    $q.notify({
      type: 'positive',
      message: 'Depósito realizado. Se enviará el voucher a tu correo electrónico.',
    })
    router.push({ name: 'billetera' })
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo registrar el depósito.'
  } finally {
    confirmando.value = false
  }
}
</script>
