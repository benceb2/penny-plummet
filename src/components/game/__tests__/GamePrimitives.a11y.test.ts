import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { configureAxe } from 'vitest-axe'

import ChipButton from '@/components/game/ChipButton.vue'
import ChipStack from '@/components/game/ChipStack.vue'
import ResultBanner from '@/components/game/ResultBanner.vue'
import RulesSheet from '@/components/game/RulesSheet.vue'
import i18n from '@/i18n'

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false }
  }
})

const mountWithI18n = (component: object, options: Record<string, unknown> = {}) =>
  mount(component, {
    attachTo: document.body,
    global: { plugins: [i18n] },
    ...options
  })

const runAxe = async (wrapper: ReturnType<typeof mount>) => {
  const results = await axe(wrapper.element)
  expect(results.violations).toHaveLength(0)
  wrapper.unmount()
}

describe('Game primitives accessibility', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('ChipButton has no axe violations, selected or not', async () => {
    expect.hasAssertions()
    const wrapper = mountWithI18n(ChipButton, { props: { value: 25, selected: true } })
    await runAxe(wrapper)
  })

  it('ChipButton has no axe violations when disabled', async () => {
    expect.hasAssertions()
    const wrapper = mountWithI18n(ChipButton, { props: { value: 100, disabled: true } })
    await runAxe(wrapper)
  })

  it('ChipStack has no axe violations for a multi-chip stack', async () => {
    expect.hasAssertions()
    const wrapper = mountWithI18n(ChipStack, { props: { amount: 131 } })
    await runAxe(wrapper)
  })

  it('ChipStack has no axe violations for an empty stack', async () => {
    expect.hasAssertions()
    const wrapper = mountWithI18n(ChipStack, { props: { amount: 0 } })
    await runAxe(wrapper)
  })

  it('ResultBanner has no axe violations while shown', async () => {
    expect.hasAssertions()
    const wrapper = mountWithI18n(ResultBanner, {
      props: {
        show: true,
        type: 'win',
        amount: 50,
        headline: 'Dealer busts',
        detail: 'You 20 · Dealer 25'
      }
    })
    await runAxe(wrapper)
  })

  it('RulesSheet has no axe violations while open', async () => {
    expect.hasAssertions()

    const wrapper = mountWithI18n(RulesSheet, {
      props: { title: 'Rules & payouts', open: true },
      slots: { default: '<p>Dealer stands on all 17.</p>' }
    })

    // Bootstrap's Offcanvas emulates its transitionend with a short real
    // setTimeout (jsdom reports no CSS transition duration); wait it out
    // rather than faking timers, which conflicts with its own scheduling.
    await new Promise((resolve) => setTimeout(resolve, 30))
    await wrapper.vm.$nextTick()

    await runAxe(wrapper)
  })
})
