import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import BlackjackView from '../BlackjackView.vue'
import ChipButton from '@/components/game/ChipButton.vue'
import ResultBanner from '@/components/game/ResultBanner.vue'
import { useBlackjackStore } from '@/stores/blackjackStore'
import { useUserStore } from '@/stores/userStore'
import { BlackjackState } from '@/types/BlackjackGameState'
import i18n from '@/i18n'

const mountView = () => {
  const pinia = createPinia()
  setActivePinia(pinia)

  const wrapper = mount(BlackjackView, {
    attachTo: document.body,
    global: {
      plugins: [pinia, i18n],
      // RulesSheet drives a real Bootstrap Offcanvas; it has its own
      // dedicated tests, so it is stubbed out of this view-level suite.
      stubs: { RulesSheet: true }
    }
  })

  return { wrapper, gameStore: useBlackjackStore(), userStore: useUserStore() }
}

const chipButton = (wrapper: ReturnType<typeof mountView>['wrapper'], value: number) =>
  wrapper.findAllComponents(ChipButton).find((chip) => chip.props('value') === value)!

describe('BlackjackView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows the insufficient funds message instead of chips when the player is out of chips', () => {
    const { wrapper, userStore } = mountView()
    userStore.chips = 0

    return wrapper.vm.$nextTick().then(() => {
      expect(wrapper.text()).toContain('Insufficient Funds')
      expect(wrapper.findAllComponents(ChipButton)).toHaveLength(0)
    })
  })

  it('hides denominations larger than the player chips', async () => {
    const { wrapper, userStore } = mountView()
    userStore.chips = 30
    await wrapper.vm.$nextTick()

    const values = wrapper.findAllComponents(ChipButton).map((chip) => chip.props('value'))
    expect(values).toEqual([1, 5, 25])
  })

  it('offers larger denominations with compact labels once the balance runs into the millions', async () => {
    const { wrapper, gameStore, userStore } = mountView()
    userStore.chips = 47_900_000
    await wrapper.vm.$nextTick()

    const chips = wrapper.findAllComponents(ChipButton)
    expect(chips.map((chip) => chip.props('value'))).toEqual([100_000, 500_000, 1_000_000, 5_000_000, 25_000_000])
    expect(chips.map((chip) => chip.text())).toEqual(['100K', '500K', '1M', '5M', '25M'])
    expect(chips[4].attributes('aria-label')).toBe('Bet 25M')

    await chipButton(wrapper, 25_000_000).trigger('click')
    await chipButton(wrapper, 5_000_000).trigger('click')
    expect(wrapper.get('.bet-amount').text()).toBe('$30M')

    await wrapper.get('button.btn-primary.cta-btn').trigger('click')
    expect(gameStore.currentBet).toBe(30_000_000)
  })

  it('builds a bet by tapping chips, supports undo, and deals with the accumulated bet', async () => {
    const { wrapper, gameStore, userStore } = mountView()
    userStore.chips = 100
    await wrapper.vm.$nextTick()

    await chipButton(wrapper, 25).trigger('click')
    await chipButton(wrapper, 25).trigger('click')
    expect(wrapper.text()).toContain('$50')

    const dealButton = wrapper.get('button.btn-primary.cta-btn')
    expect(dealButton.text()).toContain('$50')
    expect(dealButton.attributes('disabled')).toBeUndefined()

    const undoButton = wrapper.get('[aria-label="Undo last chip"]')
    await undoButton.trigger('click')
    expect(wrapper.text()).toContain('$25')

    await chipButton(wrapper, 25).trigger('click')
    await dealButton.trigger('click')

    expect(gameStore.currentBet).toBe(50)
    expect(gameStore.gameState).not.toBe(BlackjackState.BETTING)
    expect(gameStore.playerHand).toHaveLength(2)
  })

  it('caps the pending bet at the player chips and disables Deal at zero', async () => {
    const { wrapper, userStore } = mountView()
    userStore.chips = 30
    await wrapper.vm.$nextTick()

    const dealButton = wrapper.get('button.btn-primary.cta-btn')
    expect(dealButton.attributes('disabled')).toBeDefined()

    await chipButton(wrapper, 25).trigger('click')
    await chipButton(wrapper, 25).trigger('click')

    expect(wrapper.text()).toContain('$25')
    expect(wrapper.text()).not.toContain('$50')
  })

  it('shows Hit and Stand during the player turn and calls the store', async () => {
    const { wrapper, gameStore, userStore } = mountView()
    userStore.chips = 100
    gameStore.currentBet = 20
    gameStore.dealCards()
    await wrapper.vm.$nextTick()

    const handSizeBeforeHit = gameStore.playerHand.length
    await wrapper.get('button.btn-primary.cta-btn').trigger('click')

    expect(gameStore.playerHand.length).toBe(handSizeBeforeHit + 1)
  })

  it('shows the result banner once the round ends and hides it when dismissed', async () => {
    const { wrapper, gameStore } = mountView()
    gameStore.gameState = BlackjackState.GAME_OVER
    await wrapper.vm.$nextTick()

    await vi.advanceTimersByTimeAsync(500)
    await wrapper.vm.$nextTick()

    const resultBanner = wrapper.findComponent(ResultBanner)
    expect(resultBanner.props('show')).toBe(true)

    await resultBanner.vm.$emit('close')
    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent(ResultBanner).props('show')).toBe(false)
  })
})
