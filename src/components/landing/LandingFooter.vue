<template>
  <footer class="xc-footer">
    <div class="xc-footer-inner">
      <div class="xc-footer-brand">
        <div class="xc-footer-logo">
          <q-icon name="currency_exchange" size="22px" color="primary" />
          <span>X-Chang</span>
        </div>
        <p class="xc-footer-tagline">
          Mercado de cambio de divisas peer-to-peer: rápido, transparente y seguro.
        </p>
      </div>

      <div v-for="col in columnas" :key="col.titulo" class="xc-footer-col">
        <div class="xc-footer-col-titulo">{{ col.titulo }}</div>
        <ul class="xc-footer-col-list">
          <li v-for="item in col.items" :key="item.texto">
            <router-link v-if="item.to" :to="item.to" class="xc-footer-link">
              {{ item.texto }}
            </router-link>
            <span v-else class="xc-footer-text">{{ item.texto }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="xc-footer-bottom">
      <span>© {{ anio }} X-Chang. Todos los derechos reservados.</span>
      <div class="xc-footer-social">
        <q-icon name="language" size="18px" />
        <q-icon name="mail_outline" size="18px" />
        <q-icon name="chat_bubble_outline" size="18px" />
      </div>
    </div>
  </footer>
</template>

<script setup>
const anio = new Date().getFullYear()

const columnas = [
  {
    titulo: 'Producto',
    items: [
      { texto: 'Monedas y tasas', to: { name: 'monedas' } },
      { texto: 'Cómo funciona' },
      { texto: 'Seguridad' },
    ],
  },
  {
    titulo: 'Cuenta',
    items: [
      { texto: 'Iniciar sesión', to: { name: 'login' } },
      { texto: 'Crear cuenta', to: { name: 'register' } },
      { texto: 'Centro de ayuda' },
    ],
  },
  {
    titulo: 'Legal',
    items: [
      { texto: 'Términos y condiciones' },
      { texto: 'Política de privacidad' },
      { texto: 'Prevención de fraude' },
    ],
  },
]
</script>

<style scoped>
.xc-footer {
  background: var(--xchang-page-text);
  color: rgba(255, 255, 255, 0.78);
  padding: 56px 24px 28px;
}

.xc-footer-inner {
  max-width: 1180px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr 1fr;
  gap: 32px;
}

.xc-footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 12px;
}

.xc-footer-tagline {
  font-size: 0.88rem;
  line-height: 1.55;
  max-width: 280px;
  margin: 0;
}

.xc-footer-col-titulo {
  font-size: 0.82rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 14px;
}

.xc-footer-col-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.xc-footer-link,
.xc-footer-text {
  font-size: 0.86rem;
  color: rgba(255, 255, 255, 0.72);
  text-decoration: none;
}

.xc-footer-link:hover {
  color: #ffffff;
}

.xc-footer-bottom {
  max-width: 1180px;
  margin: 40px auto 0;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  flex-wrap: wrap;
  gap: 12px;
}

.xc-footer-social {
  display: flex;
  gap: 16px;
}

@media (max-width: 1023px) {
  .xc-footer-inner {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 599px) {
  .xc-footer-inner {
    grid-template-columns: 1fr;
  }
}
</style>
