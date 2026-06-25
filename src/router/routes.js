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
    children: [
      { path: '', name: 'dashboard', component: () => import('@/pages/DashboardPage.vue') },

      {
        path: 'monedas',
        name: 'monedas',
        component: () => import('@/pages/MercadoPage.vue'),
      },
      {
        path: 'mercado',
        redirect: { name: 'monedas' },
      },

      {
        path: 'configuracion',
        name: 'configuracion',
        component: () => import('@/pages/ConfiguracionPage.vue'),
      },

      {
        path: 'perfil',
        name: 'perfil',
        component: () => import('@/pages/PerfilPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'transacciones',
        name: 'transacciones',
        component: () => import('@/pages/TransaccionesPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'mis-ofertas',
        name: 'mis-ofertas',
        component: () => import('@/pages/MisOfertasPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'mis-ordenes',
        name: 'mis-ordenes',
        component: () => import('@/pages/MisOrdenesPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'billetera',
        name: 'billetera',
        component: () => import('@/pages/BilleteraPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'compra-inmediata',
        name: 'compra-inmediata',
        component: () => import('@/pages/CompraInmediataPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'venta-inmediata',
        name: 'venta-inmediata',
        component: () => import('@/pages/VentaInmediataPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'deposito',
        name: 'deposito',
        component: () => import('@/pages/DepositoPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'retiro',
        name: 'retiro',
        component: () => import('@/pages/RetiroPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'historial',
        name: 'historial',
        component: () => import('@/pages/HistorialPage.vue'),
        meta: { requiresAuth: true },
      },

      {
        path: 'calificaciones',
        name: 'calificaciones',
        component: () => import('@/pages/CalificacionesPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'disputas',
        name: 'disputas',
        component: () => import('@/pages/DisputasPage.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: '/admin',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/pages/admin/AdminDashboardPage.vue'),
      },
      {
        path: 'usuarios',
        name: 'admin-usuarios',
        component: () => import('@/pages/admin/AdminUsuariosPage.vue'),
      },
      {
        path: 'auditoria',
        name: 'admin-auditoria',
        component: () => import('@/pages/admin/AdminAuditoriaPage.vue'),
      },

      {
        path: 'disputas',
        name: 'admin-disputas',
        component: () => import('@/pages/admin/AdminDisputasPage.vue'),
      },
      {
        path: 'configuracion',
        name: 'admin-configuracion',
        component: () => import('@/pages/admin/AdminConfiguracionPage.vue'),
      },
      {
        path: 'reportes',
        name: 'admin-reportes',
        component: () => import('@/pages/admin/AdminReportesPage.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
