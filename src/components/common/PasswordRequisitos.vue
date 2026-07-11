<template>
  <ul class="xc-pw-requisitos">
    <li v-for="req in requisitos" :key="req.clave" :class="{ 'xc-pw-ok': req.cumplido }">
      <q-icon :name="req.cumplido ? 'check_circle' : 'radio_button_unchecked'" size="16px" />
      <span>{{ req.texto }}</span>
    </li>
  </ul>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  password: { type: String, default: '' },
})

const requisitos = computed(() => {
  const val = props.password || ''
  return [
    { clave: 'longitud', texto: 'Mínimo 8 caracteres', cumplido: val.length >= 8 },
    { clave: 'mayuscula', texto: 'Una letra mayúscula', cumplido: /[A-Z]/.test(val) },
    { clave: 'numero', texto: 'Un número', cumplido: /\d/.test(val) },
    { clave: 'especial', texto: 'Un carácter especial', cumplido: /[^A-Za-z0-9]/.test(val) },
  ]
})
</script>

<style scoped>
.xc-pw-requisitos {
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
  display: grid;
  gap: 4px;
}

.xc-pw-requisitos li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--xchang-text-secondary);
  opacity: 0.85;
  transition: color 0.15s ease, opacity 0.15s ease;
}

.xc-pw-requisitos li.xc-pw-ok {
  color: var(--xchang-sell-color);
  opacity: 1;
}
</style>
