import { SessionStorage } from 'quasar';

const routes = [
  {
    path: '/',
    beforeEnter: (to, from, next) => {
      const useUser = SessionStorage.getItem('user');
      const usePassword = SessionStorage.getItem('password');
      const useAdmin = SessionStorage.getItem('is_admin');
      !useUser && !usePassword && !useAdmin ? next({path: '/login'}) : next()
    },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('../pages/IndexPage.vue') },
      { path: 'indexpage', component: () => import('../pages/IndexPage.vue') },
      { path: 'ABMProd', component: () => import('pages/ABMProd.vue') },
      { path: 'ABMUser', component: () => import('pages/ABMUser.vue') },
    ]
  },
  {
    path: '/login',
    beforeEnter: (to, from, next) => {
      const useUser = SessionStorage.getItem('user');
      const userPassword = SessionStorage.getItem('password');
      const useAdmin = SessionStorage.getItem('is_admin');
      !useUser && !userPassword && !useAdmin ? next() : next(from.fullPath)
    },
    name: 'Login',
    component: () => import('../pages/Login.vue'),
  },


  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
