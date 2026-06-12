const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('@/pages/IndexPage.vue') },
      { path: 'second', component: () => import('@/pages/SecondPage.vue') },
      { path: 'test2', component: () => import('@/pages/TestPage.vue') },
    ],
  },
  {
    path: '/login',
    component: () => import('@/components/auth/LoginForm.vue'),
  },
  {
    path: '/test',
    component: () => import('@/pages/TestPage.vue'),
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('@/pages/ErrorNotFound.vue'),
  },
]

export default routes
