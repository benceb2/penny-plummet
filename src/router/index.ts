import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/home/HomeView.vue')
    },
    {
      path: '/blackjack',
      name: 'blackjack',
      component: () => import('../views/blackjack/BlackjackView.vue'),
      meta: {
        title: 'Blackjack'
      }
    },
    {
      path: '/roulette',
      name: 'roulette',
      component: () => import('../views/roulette/RouletteView.vue'),
      meta: {
        title: 'Roulette'
      }
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/about/AboutView.vue'),
      meta: {
        title: 'About'
      }
    },
    {
      path: '/clicker',
      name: 'clicker',
      component: () => import('../views/clicker/ClickerView.vue'),
      meta: {
        title: 'Earn'
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/profile/ProfileView.vue'),
      meta: {
        title: 'Profile'
      }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/settings/SettingsView.vue'),
      meta: {
        title: 'Settings'
      }
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('../views/transactions/TransactionsView.vue'),
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
