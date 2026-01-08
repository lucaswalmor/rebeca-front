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
    path: '/checkout',
    name: 'checkout',
    component: () => import('../views/CheckoutView.vue')
  },
  {
    path: '/checkout/success',
    name: 'checkout-success',
    component: () => import('../views/CheckoutSuccessView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
