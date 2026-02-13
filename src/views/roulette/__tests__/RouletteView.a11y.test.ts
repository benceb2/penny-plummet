import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { configureAxe } from 'vitest-axe'
import RouletteView from '@/views/roulette/RouletteView.vue'
import i18n from '@/i18n'

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false }
  }
})

const mountRouletteView = () => {
  const pinia = createPinia()
  setActivePinia(pinia)

  return mount(RouletteView, {
    attachTo: document.body,
    global: {
      plugins: [pinia, i18n]
    }
  })
}

describe('RouletteView accessibility', () => {
  it('has no axe violations', async () => {
    const wrapper = mountRouletteView()

    const results = await axe(wrapper.element)
    expect(results.violations).toHaveLength(0)

    wrapper.unmount()
  })
})
