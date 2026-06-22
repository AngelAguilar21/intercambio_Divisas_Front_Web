const routes = [
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { guestOnly: true },
    children: [
      { path: '/login', name: 'login', component: () => import('@/pages/auth/LoginPage.vue') },
      {
        path: '/registro',
        name: 'register',
        component: () => import('@/pages/auth/RegisterPage.vue'),
      },
      {
        path: '/olvide-password',
        name: 'forgot-password',
        component: () => import('@/pages/auth/ForgotPasswordPage.vue'),
      },
      {
        path: '/restablecer-password',
        name: 'reset-password',
        component: () => import('@/pages/auth/ResetPasswordPage.vue'),
      },
      {
        path: '/verificar-correo',
        name: 'verify-email',
        component: () => import('@/pages/auth/VerifyEmailPage.vue'),
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: () => import('@/pages/DashboardPage.vue') },
      { path: 'perfil', name: 'perfil', component: () => import('@/pages/PerfilPage.vue') },
      { path: 'mercado', name: 'mercado', component: () => import('@/pages/MercadoPage.vue') },
      { path: 'mis-ofertas', name: 'mis-ofertas', component: () => import('@/pages/MisOfertasPage.vue') },
      { path: 'mis-ordenes', name: 'mis-ordenes', component: () => import('@/pages/MisOrdenesPage.vue') },
      { path: 'billetera', name: 'billetera', component: () => import('@/pages/BilleteraPage.vue') },
      { path: 'compra-inmediata', name: 'compra-inmediata', component: () => import('@/pages/CompraInmediataPage.vue') },
      { path: 'venta-inmediata', name: 'venta-inmediata', component: () => import('@/pages/VentaInmediataPage.vue') },
      { path: 'deposito', name: 'deposito', component: () => import('@/pages/DepositoPage.vue') },
      { path: 'retiro', name: 'retiro', component: () => import('@/pages/RetiroPage.vue') },
      { path: 'historial', name: 'historial', component: () => import('@/pages/HistorialPage.vue') },
      { path: 'calificaciones', name: 'calificaciones', component: () => import('@/pages/CalificacionesPage.vue') },
      { path: 'disputas', name: 'disputas', component: () => import('@/pages/DisputasPage.vue') },
    ],
  },
  {
    path: '/admin',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('@/pages/admin/AdminDashboardPage.vue') },
      { path: 'usuarios', name: 'admin-usuarios', component: () => import('@/pages/admin/AdminUsuariosPage.vue') },
      { path: 'disputas', name: 'admin-disputas', component: () => import('@/pages/admin/AdminDisputasPage.vue') },
      { path: 'configuracion', name: 'admin-configuracion', component: () => import('@/pages/admin/AdminConfiguracionPage.vue') },
      { path: 'reportes', name: 'admin-reportes', component: () => import('@/pages/admin/AdminReportesPage.vue') },
      { path: 'auditoria', name: 'admin-auditoria', component: () => import('@/pages/admin/AdminAuditoriaPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
