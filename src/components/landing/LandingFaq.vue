<template>
  <section id="faq" class="xc-section xc-section--alt">
    <div class="xc-section-inner xc-faq-inner">
      <div class="xc-section-head">
        <span class="xc-section-kicker">
          <q-icon name="help_outline" size="14px" />
          Preguntas frecuentes
        </span>
        <h2 class="xc-section-title">Todo lo que debes saber antes de empezar</h2>
        <div class="xc-section-bar" aria-hidden="true" />
      </div>

      <q-list class="xc-faq-list">
        <q-expansion-item
          v-for="faq in faqs"
          :key="faq.pregunta"
          class="xc-faq-item"
          header-class="xc-faq-header"
          :icon="faq.icono"
          expand-icon="add"
          expanded-icon="remove"
          :label="faq.pregunta"
        >
          <div class="xc-faq-respuesta">{{ faq.respuesta }}</div>
        </q-expansion-item>
      </q-list>
    </div>
  </section>
</template>

<script setup>
const faqs = [
  {
    pregunta: '¿Cómo se define el tipo de cambio en X-Chang?',
    icono: 'show_chart',
    respuesta:
      'El tipo de cambio surge del libro de órdenes: los propios usuarios publican a qué precio compran o venden cada par de divisas. Tú puedes tomar la mejor oferta disponible o publicar tu propio precio.',
  },
  {
    pregunta: '¿Qué comisión cobra la plataforma?',
    icono: 'payments',
    respuesta:
      'Antes de confirmar cualquier operación verás siempre el monto que envías, el monto que recibes y la comisión aplicada, sin costos adicionales ocultos.',
  },
  {
    pregunta: '¿Cuánto tiempo tarda en acreditarse el dinero?',
    icono: 'schedule',
    respuesta:
      'Las compras y ventas inmediatas se liquidan en minutos contra el libro de órdenes disponible. Las órdenes a tu propio precio se ejecutan en cuanto exista una contraparte que las acepte.',
  },
  {
    pregunta: '¿Es necesario verificar mi identidad?',
    icono: 'fact_check',
    respuesta:
      'Sí. La verificación de identidad protege tu cuenta y a la comunidad de usuarios, y es un requisito para operar y retirar fondos.',
  },
  {
    pregunta: '¿Qué pasa si no hay contraparte disponible para mi monto?',
    icono: 'alt_route',
    respuesta:
      'Puedes dividir tu operación en varios saltos dentro del mercado, programar una orden a tu precio o ejecutar solo la parte con liquidez disponible en el momento.',
  },
]
</script>

<style scoped>
.xc-faq-inner {
  max-width: 760px;
}

.xc-faq-list {
  background: transparent;
}

.xc-faq-item {
  position: relative;
  border: 1px solid var(--xchang-border);
  border-radius: var(--xchang-radius-md);
  margin-bottom: 12px;
  background: var(--xchang-surface);
  overflow: hidden;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.xc-faq-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 3px;
  background: var(--xchang-blue);
  transform: scaleY(0);
  transition: transform 0.25s ease;
}

.xc-faq-item:hover {
  border-color: var(--xchang-blue-light);
}

.xc-faq-item:hover::before,
.xc-faq-item.q-expansion-item--expanded::before {
  transform: scaleY(1);
}

.xc-faq-item.q-expansion-item--expanded {
  box-shadow: var(--xchang-shadow-sm);
}

.xc-faq-item :deep(.xc-faq-header) {
  padding: 14px 16px;
  font-weight: 600;
}

.xc-faq-item :deep(.q-icon) {
  color: var(--xchang-blue);
}

.xc-faq-respuesta {
  padding: 0 16px 18px 52px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--xchang-text-secondary);
}
</style>
