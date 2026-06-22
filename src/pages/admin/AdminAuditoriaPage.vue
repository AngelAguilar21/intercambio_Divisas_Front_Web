<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Auditoría administrativa</div>

    <q-card flat bordered class="q-pa-md q-mb-md">
      <div class="row q-col-gutter-md items-end">
        <div class="col-6 col-md-2">
          <q-input v-model="filtro.fechaDesde" type="date" label="Desde" outlined dense />
        </div>
        <div class="col-6 col-md-2">
          <q-input v-model="filtro.fechaHasta" type="date" label="Hasta" outlined dense />
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
          <q-btn color="primary" label="Buscar" class="full-width" @click="cargar" />
        </div>
      </div>
    </q-card>

    <q-card flat bordered class="q-pa-md">
      <div class="row q-mb-sm">
        <q-space />
        <q-btn flat dense icon="download" label="Exportar Excel" class="q-mr-sm" @click="onExportar('excel')" />
        <q-btn flat dense icon="picture_as_pdf" label="Exportar PDF" @click="onExportar('pdf')" />
      </div>
      <q-table :rows="registros" :columns="columnas" row-key="auditoriaId" :loading="cargando" flat />
    </q-card>
  </q-page>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { buscarAuditoria, exportarExcel, exportarPdf } from '@/services/adminAuditoria'

const filtro = reactive({ fechaDesde: '', fechaHasta: '', administrador: '', usuarioAfectado: '', tipoAccion: 'Todos', pagina: 1, registrosPorPagina: '20' })
const registros = ref([])
const cargando = ref(false)

const columnas = [
  { name: 'fechaHora', label: 'Fecha', field: (r) => new Date(r.fechaHora).toLocaleString(), align: 'left' },
  { name: 'administrador', label: 'Administrador', field: 'administrador', align: 'left' },
  { name: 'usuarioAfectado', label: 'Usuario afectado', field: 'usuarioAfectado', align: 'left' },
  { name: 'tipoAccion', label: 'Acción', field: 'tipoAccion', align: 'left' },
  { name: 'mensajeRegistrado', label: 'Detalle', field: 'mensajeRegistrado', align: 'left' },
]

function buildFiltro() {
  const f = { ...filtro }
  Object.keys(f).forEach((k) => {
    if (!f[k]) delete f[k]
  })
  return f
}

async function cargar() {
  cargando.value = true
  try {
    const { data } = await buscarAuditoria(buildFiltro())
    registros.value = data.registros
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)

async function onExportar(tipo) {
  const fn = tipo === 'excel' ? exportarExcel : exportarPdf
  const { data } = await fn(buildFiltro())
  const blob = new Blob([data])
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `auditoria.${tipo === 'excel' ? 'csv' : 'pdf'}`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
