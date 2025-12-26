import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { configureAxe } from 'vitest-axe'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import ToastContainer from '@/components/layout/ToastContainer.vue'
import ClickArea from '@/views/clicker/ClickArea.vue'
import UpgradesPanel from '@/views/clicker/UpgradesPanel.vue'
import i18n from '@/i18n'
import { useUserStore } from '@/stores/userStore'
import { useAchievementStore } from '@/stores/achievementStore'
import { useToastStore } from '@/stores/toastStore'
import { useClickerStore } from '@/stores/clickerStore'

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
  },
})

const mountWithStores = (component: object, options: Record<string, unknown> = {}) => {
  const pinia = createPinia()
  setActivePinia(pinia)

  return mount(component, {
    attachTo: document.body,
    global: {
      plugins: [pinia, i18n],
      stubs: {
        RouterLink: {
          template: '<a><slot /></a>',
        },
      },
    },
    ...options,
  })
}

const runAxe = async (wrapper: ReturnType<typeof mount>) => {
  const results = await axe(wrapper.element)
  expect(results.violations).toHaveLength(0)
  wrapper.unmount()
}

describe('Interactive components accessibility', () => {
  it('AppNavbar has no axe violations', async () => {
    expect.hasAssertions()
    const wrapper = mountWithStores(AppNavbar)
    const userStore = useUserStore()
    const achievementStore = useAchievementStore()

    userStore.updateUsername('A11yTester')
    userStore.updateConsent(true)
    achievementStore.currentLevel.currentXP = 200
    achievementStore.currentLevel.requiredXP = 500

    await runAxe(wrapper)
  })

  it('ToastContainer has no axe violations with active toasts', async () => {
    expect.hasAssertions()
    const wrapper = mountWithStores(ToastContainer)
    const toastStore = useToastStore()

    toastStore.addToast({
      type: 'success',
      title: 'Saved',
      message: 'Settings updated successfully.',
      icon: 'bi-check-circle',
    })
    toastStore.addToast({
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'Test achievement description.',
      icon: 'bi-trophy-fill',
    })

    await runAxe(wrapper)
  })

  it('ClickArea has no axe violations', async () => {
    expect.hasAssertions()
    const wrapper = mountWithStores(ClickArea)
    const clickerStore = useClickerStore()

    clickerStore.setClickerActive(true)

    await runAxe(wrapper)
  })

  it('UpgradesPanel has no axe violations', async () => {
    expect.hasAssertions()
    const wrapper = mountWithStores(UpgradesPanel)
    const userStore = useUserStore()
    const clickerStore = useClickerStore()

    userStore.chips = 2000
    clickerStore.autoClickersCount = 1

    await runAxe(wrapper)
  })
})
