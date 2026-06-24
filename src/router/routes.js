const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '',         component: () => import('pages/IndexPage.vue') },
      { path: 'exchange', component: () => import('pages/ExchangePage.vue') },
      { path: 'wallet',   component: () => import('pages/WalletPage.vue') },
      { path: 'orders',   component: () => import('pages/OrdersPage.vue') },
      { path: 'history',  component: () => import('pages/HistoryPage.vue') },
      { path: 'profile',  component: () => import('pages/ProfilePage.vue') },
    ],
  },
  {
    path: '/login',
    component: () => import('components/auth/LoginForm.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    component: () => import('components/auth/RegisterForm.vue'),
    meta: { guest: true },
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
