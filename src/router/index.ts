import { createRouter, createWebHistory } from 'vue-router'
import GameView from '../views/BlackjackView.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Home'
      }
    },
    {
      path: '/blackjack',
      name: 'Blackjack',
      component: GameView,
      meta: {
        title: 'Blackjack'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        title: 'About'
      }
    },
    {
      path: '/earn',
      name: 'earn',
      component: () => import('../views/EarnView.vue'),
      meta: {
        title: 'Earn'
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: {
        title: 'Profile'
      }
    }
  ],
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title
    ? `${to.meta.title} | Penny Plummet`
    : 'Penny Plummet'
  next()
})

export default router
