import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import { configureAxe } from 'vitest-axe'
import AppHud from '@/components/layout/AppHud.vue'
import AppTabBar from '@/components/layout/AppTabBar.vue'
import i18n from '@/i18n'
import { useUserStore } from '@/stores/userStore'
import { useAchievementStore } from '@/stores/achievementStore'

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
  },
})

const createTestRouter = () => createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/blackjack', component: { template: '<div />' } },
    { path: '/roulette', component: { template: '<div />' } },
    { path: '/clicker', component: { template: '<div />' } },
    { path: '/profile', component: { template: '<div />' } },
  ],
})

const mountWithStores = async (component: object) => {
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = createTestRouter()
  router.push('/blackjack')
  await router.isReady()

  return mount(component, {
    attachTo: document.body,
    global: {
      plugins: [pinia, i18n, router],
    },
  })
}

const runAxe = async (wrapper: ReturnType<typeof mount>) => {
  const results = await axe(wrapper.element)
  expect(results.violations).toHaveLength(0)
  wrapper.unmount()
}

describe('App shell accessibility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('AppHud has no axe violations', async () => {
    expect.hasAssertions()
    const wrapper = await mountWithStores(AppHud)
    const userStore = useUserStore()
    const achievementStore = useAchievementStore()

    userStore.updateUsername('A11yTester')
    userStore.updateConsent(true)
    achievementStore.currentLevel.currentXP = 200
    achievementStore.currentLevel.requiredXP = 500

    await runAxe(wrapper)
  })

  it('AppTabBar has no axe violations', async () => {
    expect.hasAssertions()
    const wrapper = await mountWithStores(AppTabBar)

    await runAxe(wrapper)
  })
})
