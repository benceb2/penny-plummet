import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { axe } from 'vitest-axe'
import { toHaveNoViolations } from 'vitest-axe/matchers'
import ClickerView from '@/views/clicker/ClickerView.vue'
import i18n from '@/i18n'

expect.extend({ toHaveNoViolations })

const mountClickerView = () => {
  const pinia = createPinia()
  setActivePinia(pinia)

  return mount(ClickerView, {
    attachTo: document.body,
    global: {
      plugins: [pinia, i18n],
    },
  })
}

describe('ClickerView accessibility', () => {
  it('has no axe violations', async () => {
    const wrapper = mountClickerView()

    const results = await axe(wrapper.element)
    expect(results).toHaveNoViolations()

    wrapper.unmount()
  })
})
