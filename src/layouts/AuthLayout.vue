<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-2">
        <q-card class="auth-card" flat bordered>
          <q-card-section class="text-center q-pb-none">
            <div class="row items-center justify-center q-gutter-sm">
              <q-icon name="currency_exchange" size="32px" color="primary" />
              <div class="text-h5 text-weight-bold text-primary">X-Chang</div>
            </div>
            <div class="text-caption text-grey-7">Intercambio de divisas P2P</div>
          </q-card-section>

          <q-card-section>
            <router-view />
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
.auth-card {
  width: 100%;
  max-width: 420px;
}
</style>
