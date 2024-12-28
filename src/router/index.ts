import { createRouter, createWebHistory } from 'vue-router'
import GameView from '../views/BlackjackView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/blackjack',
      name: 'Blackjack',
      component: GameView,
      meta: {
        title: 'Blackjack'  // Add this meta field
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: {
        title: 'About'  // Add this meta field
      }
    },
  ],
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title
    ? `Penny Plummet | ${to.meta.title}`
    : 'Penny Plummet'
  next()
})

export default router