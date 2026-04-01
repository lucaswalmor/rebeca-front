import { createRouter, createWebHistory } from 'vue-router'
// import SiteAdulto from '../views/SiteAdulto.vue'
import PaginaEmConstrucao from '../views/PaginaEmConstrucao.vue'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'adult-site',
    component: SiteAdulto
  },
  // {
  //   path: '/',
  //   name: 'pagina-em-construcao',
  //   component: PaginaEmConstrucao
  // },
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../pages/profile/Profile.vue'),
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.is_admin === true) {
        next();
      } else {
        next('/home');
      }
    }
  },
  {
    path: '/checkout/success',
    name: 'checkout-success',
    component: () => import('../views/CheckoutSuccessView.vue')
  },
  {
    path: '/user-settings',
    name: 'user-settings',
    component: () => import('../pages/UserSettings.vue'),
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      if (token && user.id && user.is_admin === false) {
        next();
      } else {
        next('/home');
      }
    }
  },
  {
    path: '/admin/enquete',
    name: 'admin-enquete',
    component: () => import('../views/EnqueteDashboard.vue'),
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      if (token && user.id && user.is_admin === true) {
        next();
      } else {
        next('/home');
      }
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
