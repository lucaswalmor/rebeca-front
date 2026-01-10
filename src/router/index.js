import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
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
        next('/');
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
        next('/');
      }
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
