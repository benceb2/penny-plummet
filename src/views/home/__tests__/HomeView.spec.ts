import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../HomeView.vue'
import i18n from '@/i18n'

const stub = { template: '<div />' }

const createTestRouter = () => createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: stub },
    { path: '/blackjack', component: stub },
    { path: '/roulette', component: stub },
    { path: '/clicker', component: stub },
    { path: '/achievements', component: stub },
    { path: '/transactions', component: stub }
  ]
})

describe('HomeView lobby', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders tappable links to the three game routes', async () => {
    const router = createTestRouter()
    router.push('/')
    await router.isReady()

    const wrapper = mount(HomeView, {
      global: {
        plugins: [i18n, router]
      }
    })

    const hrefs = wrapper.findAll('a').map(link => link.attributes('href'))
    expect(hrefs).toContain('/blackjack')
    expect(hrefs).toContain('/roulette')
    expect(hrefs).toContain('/clicker')
  })
})
