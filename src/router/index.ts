import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/seguimiento'
  },
  {
    path: '/seguimiento',
    name: 'ServiciosActivos',
    component: () => import('@/views/SeguimientoPage.vue')
  },
  {
    path: '/historial',
    name: 'Historial',
    component: () => import('@/views/HistorialPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
