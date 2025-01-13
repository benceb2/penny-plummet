import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: {
        title: 'Home'
      }
    },
    {
      path: '/blackjack',
      name: 'Blackjack',
      component: () => import('../views/BlackjackView.vue'),
      meta: {
        title: 'Blackjack'
      }
    },
    {
      path: '/roulette',
      name: 'roulette',
      component: () => import('../views/RouletteView.vue'),
      meta: {
        title: 'Roulette'
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
      path: '/clicker',
      name: 'clicker',
      component: () => import('../views/ClickerView.vue'),
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
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: {
        title: 'Settings'
      }
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('../views/TransactionsView.vue'),
      meta: {
        title: 'Transaction History'
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
