import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import RouletteView from '../RouletteView.vue'
import ChipButton from '@/components/game/ChipButton.vue'
import ResultBanner from '@/components/game/ResultBanner.vue'
import { useRouletteStore } from '@/stores/rouletteStore'
import { useUserStore } from '@/stores/userStore'
import { RouletteState } from '@/types/RouletteState'
import i18n from '@/i18n'

const mountView = () => {
  const pinia = createPinia()
  setActivePinia(pinia)

  const wrapper = mount(RouletteView, {
    attachTo: document.body,
    global: {
      plugins: [pinia, i18n],
      // RulesSheet drives a real Bootstrap Offcanvas and RouletteSpinner
      // drives its own rAF/setTimeout animation; both have their own
      // dedicated tests, so they are stubbed out of this view-level suite.
      stubs: { RulesSheet: true, RouletteSpinner: true }
    }
  })

  return { wrapper, gameStore: useRouletteStore(), userStore: useUserStore() }
}

const chipButton = (wrapper: ReturnType<typeof mountView>['wrapper'], value: number) =>
  wrapper.findAllComponents(ChipButton).find((chip) => chip.props('value') === value)!

const numberCell = (wrapper: ReturnType<typeof mountView>['wrapper'], num: number) =>
  wrapper.get(`.number-board-mobile [aria-label="Place bet on number ${num}"]`)

describe('RouletteView', () => {
  it('shows the insufficient funds message instead of chips when the player is out of chips', async () => {
    const { wrapper, userStore } = mountView()
    userStore.chips = 0
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Insufficient Funds')
    expect(wrapper.findAllComponents(ChipButton)).toHaveLength(0)
  })

  it('hides denominations larger than the player chips', async () => {
    const { wrapper, userStore } = mountView()
    userStore.chips = 30
    await wrapper.vm.$nextTick()

    const values = wrapper.findAllComponents(ChipButton).map((chip) => chip.props('value'))
    expect(values).toEqual([1, 5, 25])
  })

  it('offers larger denominations once the balance runs into the millions and bets them on the table', async () => {
    const { wrapper, gameStore, userStore } = mountView()
    userStore.chips = 47_900_000
    await wrapper.vm.$nextTick()

    const values = wrapper.findAllComponents(ChipButton).map((chip) => chip.props('value'))
    expect(values).toEqual([100_000, 500_000, 1_000_000, 5_000_000, 25_000_000])

    await chipButton(wrapper, 5_000_000).trigger('click')
    await numberCell(wrapper, 17).trigger('click')

    expect(gameStore.currentBets).toEqual([{ type: 'straight', numbers: [17], amount: 5_000_000 }])
    expect(wrapper.get('.cta-btn--spin').text()).toContain('$5M')
  })

  it('moves the selection to the nearest chip still on offer when the row slides', async () => {
    const { wrapper, userStore } = mountView()
    userStore.chips = 5_000
    await wrapper.vm.$nextTick()

    const selectedValue = () => wrapper.findAllComponents(ChipButton).find((chip) => chip.props('selected'))!.props('value')

    // The smallest chip is selected by default; a win that pushes the row up
    // past it lands on the new smallest chip, not the largest.
    expect(selectedValue()).toBe(25)
    userStore.chips = 30_000
    await wrapper.vm.$nextTick()
    expect(selectedValue()).toBe(100)

    // A loss that takes the selected top chip away falls back to the new top chip.
    await chipButton(wrapper, 25_000).trigger('click')
    userStore.chips = 900
    await wrapper.vm.$nextTick()
    expect(selectedValue()).toBe(500)
  })

  it('places a straight bet by selecting a chip and tapping a table cell', async () => {
    const { wrapper, gameStore, userStore } = mountView()
    userStore.chips = 1000
    await wrapper.vm.$nextTick()

    await chipButton(wrapper, 25).trigger('click')
    await numberCell(wrapper, 17).trigger('click')

    expect(gameStore.currentBets).toEqual([{ type: 'straight', numbers: [17], amount: 25 }])
    expect(wrapper.get('.cta-btn--spin').text()).toContain('$25')
  })

  it('supports undo and clear', async () => {
    const { wrapper, gameStore, userStore } = mountView()
    userStore.chips = 1000
    await wrapper.vm.$nextTick()

    await chipButton(wrapper, 25).trigger('click')
    await numberCell(wrapper, 17).trigger('click')
    await chipButton(wrapper, 5).trigger('click')
    await wrapper.get('.outside-bets [aria-label="Place bet on 1st 12"]').trigger('click')

    expect(gameStore.currentBets).toHaveLength(2)

    await wrapper.get('[aria-label="Undo last bet"]').trigger('click')
    expect(gameStore.currentBets).toEqual([{ type: 'straight', numbers: [17], amount: 25 }])

    await wrapper.get('.cta-btn--clear').trigger('click')
    expect(gameStore.currentBets).toHaveLength(0)
  })

  it('disables Spin with no bets and enables it once a bet is placed', async () => {
    const { wrapper, userStore } = mountView()
    userStore.chips = 100
    await wrapper.vm.$nextTick()

    const spinButton = wrapper.get('.cta-btn--spin')
    expect(spinButton.attributes('disabled')).toBeDefined()

    await chipButton(wrapper, 25).trigger('click')
    await numberCell(wrapper, 3).trigger('click')

    expect(spinButton.attributes('disabled')).toBeUndefined()
  })

  it('starts the spin on tap and shows the result banner once the round completes', async () => {
    const { wrapper, gameStore, userStore } = mountView()
    userStore.chips = 1000
    await wrapper.vm.$nextTick()

    await chipButton(wrapper, 25).trigger('click')
    await numberCell(wrapper, 17).trigger('click')
    await wrapper.get('.cta-btn--spin').trigger('click')
    await wrapper.vm.$nextTick()

    expect(gameStore.gameState).toBe(RouletteState.SPINNING)

    // The real spinner is stubbed out (it drives its own animation and has
    // its own tests), so complete the round the same way its
    // spin-complete event would.
    gameStore.completeGame()
    await wrapper.vm.$nextTick()

    const resultBanner = wrapper.findComponent(ResultBanner)
    expect(resultBanner.props('show')).toBe(true)

    await resultBanner.vm.$emit('close')
    await wrapper.vm.$nextTick()

    expect(gameStore.gameState).toBe(RouletteState.BETTING)
    expect(gameStore.currentBets).toHaveLength(0)
    expect(wrapper.findComponent(ResultBanner).props('show')).toBe(false)
  })

  it('shows the net amount lost, not the gross bet, on a partial loss', async () => {
    // $5 on red, $5 on 1st 12 and $10 straight on 7; 27 comes up (red, but
    // outside the other two groups): the red bet pays 10, the rest lose, for
    // a net loss of 10 on a 20 total bet.
    const { wrapper, gameStore } = mountView()
    gameStore.gameState = RouletteState.COMPLETE
    gameStore.lastResult = {
      winningNumber: 27,
      totalBet: 20,
      totalWin: 10,
      winningBets: [{ type: 'red', numbers: [], amount: 5 }],
      losingBets: [
        { type: 'dozen', numbers: [], amount: 5 },
        { type: 'straight', numbers: [7], amount: 10 }
      ]
    }
    await wrapper.vm.$nextTick()

    const resultBanner = wrapper.findComponent(ResultBanner)
    expect(resultBanner.props('type')).toBe('loss')
    expect(resultBanner.props('amount')).toBe(10)
  })
})
