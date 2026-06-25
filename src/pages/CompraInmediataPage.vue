<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Compra inmediata</div>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-md-3">
          <q-select
            v-model="form.monedaDestinoId"
            label="Moneda que quiero obtener"
            outlined
            :options="monedaOptions"
            emit-value
            map-options
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
          />
        </div>
        <div class="col-12 col-md-3">
          <q-input
            v-model.number="form.cantidad"
            type="number"
            label="Cantidad a obtener"
            outlined
          />
        </div>
        <div class="col-12 col-md-3">
          <q-btn
            color="primary"
            label="Ver resumen"
            class="full-width"
            :loading="cargandoResumen"
            @click="onVerResumen"
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

    <q-card v-if="resumen" flat bordered class="q-pa-md q-mb-md">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">Resumen</div>
      <q-list dense>
        <q-item>
          <q-item-section>Cantidad ejecutable</q-item-section>
          <q-item-section side
            >{{ resumen.cantidadEjecutable }} {{ resumen.monedaDestino }}</q-item-section
          >
        </q-item>
        <q-item>
          <q-item-section>Precio promedio</q-item-section>
          <q-item-section side>{{ resumen.precioPromedioVenta ?? '-' }}</q-item-section>
        </q-item>
        <q-item>
          <q-item-section>Total estimado a pagar</q-item-section>
          <q-item-section side
            >{{ resumen.totalEstimado }} {{ resumen.monedaOrigen }}</q-item-section
          >
        </q-item>
      </q-list>

      <q-banner
        v-if="!resumen.liquidezSuficiente"
        dense
        class="xchang-banner xchang-banner--warning q-mt-sm"
        rounded
      >
        Liquidez insuficiente para la cantidad solicitada. Puedes confirmar solo la cantidad
        disponible.
      </q-banner>
      <q-banner
        v-if="!resumen.saldoSuficiente"
        dense
        class="xchang-banner xchang-banner--error q-mt-sm"
        rounded
      >
        Saldo insuficiente en {{ resumen.monedaOrigen }}.
      </q-banner>

      <div class="row q-gutter-sm q-mt-md">
        <q-btn
          color="primary"
          label="Confirmar compra normal"
          :loading="confirmando"
          :disable="!resumen.saldoSuficiente"
          @click="onConfirmarNormal"
        />
        <q-select
          v-model="maxSaltos"
          :options="[1, 2, 3, 4, 5]"
          dense
          outlined
          style="width: 160px"
          label="Máx. saltos"
        />
        <q-btn
          color="secondary"
          label="Buscar mejor ruta"
          :loading="buscandoRuta"
          @click="onBuscarRuta"
        />
      </div>
    </q-card>

    <q-card v-if="ruta" flat bordered class="q-pa-md q-mb-md">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">Resultado de búsqueda de ruta</div>

      <q-banner
        v-if="!ruta.rutaEncontrada"
        dense
        class="xchang-banner xchang-banner--warning"
        rounded
      >
        {{ ruta.mensaje || 'No se encontró una ruta mejor que la compra normal.' }}
      </q-banner>

      <template v-else>
        <q-list dense>
          <q-item>
            <q-item-section>Saltos</q-item-section>
            <q-item-section side>{{ ruta.cantidadSaltos }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Total compra normal</q-item-section>
            <q-item-section side>{{ ruta.totalCompraNormal }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Total por ruta</q-item-section>
            <q-item-section side>{{ ruta.totalRutaEncontrada }}</q-item-section>
          </q-item>
          <q-item>
            <q-item-section>Ahorro estimado</q-item-section>
            <q-item-section side class="text-positive">{{ ruta.ahorroEstimado }}</q-item-section>
          </q-item>
        </q-list>

        <q-list bordered class="q-mt-sm">
          <q-item v-for="salto in ruta.saltos" :key="salto.numeroSalto">
            <q-item-section>
              Salto {{ salto.numeroSalto }}: {{ salto.monedaOrigen }} → {{ salto.monedaDestino }}
            </q-item-section>
            <q-item-section side>{{ salto.resultadoObtenido }}</q-item-section>
          </q-item>
        </q-list>

        <q-btn
          color="primary"
          class="q-mt-md"
          label="Confirmar con esta ruta"
          :loading="confirmando"
          @click="onConfirmarRuta"
        />
      </template>
    </q-card>

    <q-card v-if="resultado" flat bordered class="q-pa-md xchang-banner--success">
      <div class="text-subtitle1 text-weight-medium q-mb-sm">Operación completada</div>
      <q-list dense>
        <q-item>
          <q-item-section>Cantidad ejecutada</q-item-section>
          <q-item-section side
            >{{ resultado.cantidadEjecutada }} {{ resultado.monedaDestino }}</q-item-section
          >
        </q-item>
        <q-item>
          <q-item-section>Total pagado</q-item-section>
          <q-item-section side
            >{{ resultado.totalPagado }} {{ resultado.monedaOrigen }}</q-item-section
          >
        </q-item>
        <q-item>
          <q-item-section>Estado</q-item-section>
          <q-item-section side>{{ resultado.estado }}</q-item-section>
        </q-item>
      </q-list>
      <q-btn flat color="primary" label="Nueva operación" class="q-mt-sm" @click="reiniciar" />
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { getMonedas } from '@/services/monedas'
import { resolveParMonedaId } from '@/services/preciosPares'
import { getResumen, confirmar, buscarRuta, confirmarRuta } from '@/services/compraInmediata'

const monedaOptions = ref([])
const form = reactive({ monedaOrigenId: null, monedaDestinoId: null, cantidad: null })
const maxSaltos = ref(1)

const errorMessage = ref('')
const cargandoResumen = ref(false)
const buscandoRuta = ref(false)
const confirmando = ref(false)

const parMonedaId = ref(null)
const resumen = ref(null)
const ruta = ref(null)
const resultado = ref(null)

onMounted(async () => {
  const { data } = await getMonedas()
  monedaOptions.value = data.map((m) => ({
    label: `${m.codigoISO} - ${m.nombre}`,
    value: m.monedaId,
    iso: m.codigoISO,
  }))
})

async function onVerResumen() {
  errorMessage.value = ''
  resumen.value = null
  ruta.value = null
  resultado.value = null

  if (form.monedaOrigenId === form.monedaDestinoId) {
    errorMessage.value = 'Las monedas deben ser distintas.'
    return
  }

  cargandoResumen.value = true
  try {
    const origen = monedaOptions.value.find((m) => m.value === form.monedaOrigenId)
    const destino = monedaOptions.value.find((m) => m.value === form.monedaDestinoId)
    parMonedaId.value = await resolveParMonedaId(origen.iso, destino.iso)
    if (!parMonedaId.value) {
      errorMessage.value = 'No existe un par de monedas para esa combinación.'
      return
    }
    const { data } = await getResumen({
      parMonedaId: parMonedaId.value,
      cantidadAObtener: form.cantidad,
    })
    resumen.value = data
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo obtener el resumen.'
  } finally {
    cargandoResumen.value = false
  }
}

async function onConfirmarNormal() {
  confirmando.value = true
  errorMessage.value = ''
  try {
    const { data } = await confirmar({
      parMonedaId: parMonedaId.value,
      cantidadAObtener: form.cantidad,
      comprarCantidadDisponible: !resumen.value.liquidezSuficiente,
    })
    resultado.value = data
    resumen.value = null
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo confirmar la compra.'
  } finally {
    confirmando.value = false
  }
}

async function onBuscarRuta() {
  buscandoRuta.value = true
  errorMessage.value = ''
  try {
    const { data } = await buscarRuta({
      parMonedaId: parMonedaId.value,
      cantidadAObtener: form.cantidad,
      cantidadMaximaSaltos: maxSaltos.value,
    })
    ruta.value = data
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo buscar la ruta.'
  } finally {
    buscandoRuta.value = false
  }
}

async function onConfirmarRuta() {
  confirmando.value = true
  errorMessage.value = ''
  try {
    const { data } = await confirmarRuta({ busquedaRutaId: ruta.value.busquedaRutaId })
    resultado.value = data
    resumen.value = null
    ruta.value = null
  } catch (error) {
    errorMessage.value = error.response?.data?.mensaje || 'No se pudo confirmar la ruta.'
  } finally {
    confirmando.value = false
  }
}

function reiniciar() {
  resultado.value = null
  resumen.value = null
  ruta.value = null
  form.cantidad = null
}
</script>
