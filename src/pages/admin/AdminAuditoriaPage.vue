<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Auditoría administrativa</div>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="row q-col-gutter-md items-end">
        <div class="col-6 col-md-2">
          <q-input v-model="filtro.fechaDesde" type="date" label="Desde" outlined dense />
        </div>
        <div class="col-6 col-md-2">
          <q-input
            v-model="filtro.fechaHasta"
            type="date"
            label="Hasta"
            outlined
            dense
            :error="fechaInvalida"
            error-message="La fecha final debe ser posterior a la fecha inicial"
          />
        </div>
        <div class="col-6 col-md-2">
          <q-input v-model="filtro.administrador" label="Administrador" outlined dense />
        </div>
        <div class="col-6 col-md-2">
          <q-input v-model="filtro.usuarioAfectado" label="Usuario afectado" outlined dense />
        </div>
        <div class="col-6 col-md-2">
          <q-select v-model="filtro.tipoAccion" label="Tipo de acción" outlined dense :options="['Todos', 'Restricción', 'Habilitación']" />
        </div>
        <div class="col-6 col-md-2">
          <q-btn color="primary" label="Buscar" class="full-width" :disable="fechaInvalida" @click="buscar" />
        </div>
      </div>
    </q-card>

    <q-card flat bordered class="q-pa-md">
      <div class="row items-center q-mb-sm">
        <q-select
          v-model="filtro.registrosPorPagina"
          label="Registros por página"
          outlined
          dense
          style="width: 160px"
          :options="['10', '20', '40', '100', '200', '400', 'Todos']"
          @update:model-value="buscar"
        />
        <q-space />
        <q-btn flat dense icon="download" label="Exportar Excel" class="q-mr-sm" @click="onExportar('excel')" />
        <q-btn flat dense icon="picture_as_pdf" label="Exportar PDF" @click="onExportar('pdf')" />
      </div>

      <q-table :rows="registros" :columns="columnas" row-key="auditoriaId" :loading="cargando" flat hide-pagination>
        <template #no-data>
          <div class="full-width text-center xc-text-secondary q-py-md">
            {{ mensajeVacio || 'No se encontraron registros de auditoría' }}
          </div>
        </template>
      </q-table>

      <div v-if="totalRegistros > 0" class="row items-center justify-end q-gutter-sm q-pa-sm">
        <div class="text-caption xc-text-secondary">Página {{ paginaActual }} de {{ totalPaginas }}</div>
        <q-btn flat dense round icon="first_page" :disable="paginaActual === 1" @click="irAPagina(1)" />
        <q-btn flat dense round icon="chevron_left" :disable="paginaActual === 1" @click="irAPagina(paginaActual - 1)" />
        <q-btn
          flat
          dense
          round
          icon="chevron_right"
          :disable="paginaActual >= totalPaginas"
          @click="irAPagina(paginaActual + 1)"
        />
        <q-btn
          flat
          dense
          round
          icon="last_page"
          :disable="paginaActual >= totalPaginas"
          @click="irAPagina(totalPaginas)"
        />
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { buscarAuditoria, exportarExcel, exportarPdf } from '@/services/adminAuditoria'

const filtro = reactive({
  fechaDesde: '',
  fechaHasta: '',
  administrador: '',
  usuarioAfectado: '',
  tipoAccion: 'Todos',
  pagina: 1,
  registrosPorPagina: '20',
})
const registros = ref([])
const cargando = ref(false)
const totalRegistros = ref(0)
const totalPaginas = ref(1)
const paginaActual = ref(1)
const mensajeVacio = ref('')

const columnas = [
  { name: 'fechaHora', label: 'Fecha', field: (r) => new Date(r.fechaHora).toLocaleString(), align: 'left' },
  { name: 'administrador', label: 'Administrador', field: 'administrador', align: 'left' },
  { name: 'usuarioAfectado', label: 'Usuario afectado', field: 'usuarioAfectado', align: 'left' },
  { name: 'tipoAccion', label: 'Acción', field: 'tipoAccion', align: 'left' },
  { name: 'mensajeRegistrado', label: 'Detalle', field: 'mensajeRegistrado', align: 'left' },
]

const fechaInvalida = computed(() => {
  if (!filtro.fechaDesde || !filtro.fechaHasta) return false
  return new Date(filtro.fechaDesde) > new Date(filtro.fechaHasta)
})

function buildFiltro() {
  const f = { ...filtro }
  Object.keys(f).forEach((k) => {
    if (!f[k]) delete f[k]
  })
  return f
}

async function cargar() {
  if (fechaInvalida.value) return
  cargando.value = true
  try {
    const { data } = await buscarAuditoria(buildFiltro())
    registros.value = data.registros || []
    totalRegistros.value = data.totalRegistros ?? registros.value.length
    totalPaginas.value = data.totalPaginas || 1
    paginaActual.value = data.paginaActual || filtro.pagina
    mensajeVacio.value = data.mensaje || ''
  } finally {
    cargando.value = false
  }
}

function buscar() {
  filtro.pagina = 1
  cargar()
}

function irAPagina(pagina) {
  filtro.pagina = pagina
  cargar()
}

onMounted(cargar)

async function onExportar(tipo) {
  const fn = tipo === 'excel' ? exportarExcel : exportarPdf
  const { data } = await fn(buildFiltro())
  const blob = new Blob([data])
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `auditoria.${tipo === 'excel' ? 'xls' : 'pdf'}`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
