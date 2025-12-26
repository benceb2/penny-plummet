import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { Card } from '@/types/Card'
import { achievements as achievementsRef } from '@/utils/achievementUitl'
import { useAchievementStore } from '../achievementStore'
import { useBlackjackStore } from '../blackjackStore'
import { useClickerStore } from '../clickerStore'
import { useRouletteStore } from '../rouletteStore'
import { useUserStore } from '../userStore'

const toastStoreMock = {
  levelUp: vi.fn(),
  achievementUnlocked: vi.fn(),
  addToast: vi.fn()
}

const transactionStoreMock = {
  addTransaction: vi.fn()
}

let mockDeck: Card[] = []

vi.mock('@/stores/toastStore', () => ({
  useToastStore: () => toastStoreMock
}))

vi.mock('@/stores/transactionStore', () => ({
  useTransactionStore: () => transactionStoreMock
}))

vi.mock('@/i18n', () => ({
  default: {
    global: {
      t: (key: string) => key
    }
  }
}))

vi.mock('@/utils/blackjackUtil', async () => {
  const actual = await vi.importActual<typeof import('@/utils/blackjackUtil')>(
    '@/utils/blackjackUtil'
  )
  return {
    ...actual,
    generateDeck: () => mockDeck,
    shuffleDeck: (deck: Card[]) => deck
  }
})

const makeCard = (suit: Card['suit'], value: number, display: string): Card => ({
  suit,
  value,
  display,
  faceUp: true
})

const buildDeckForDeal = (
  player: [Card, Card],
  dealer: [Card, Card],
  nextDraw: Card
) => ([
  makeCard('clubs', 2, '2'),
  nextDraw,
  dealer[1],
  dealer[0],
  player[1],
  player[0]
])

describe('Achievement integration flows', () => {
  const originalAchievements = JSON.parse(JSON.stringify(achievementsRef.value))

  beforeEach(() => {
    setActivePinia(createPinia())
    achievementsRef.value = JSON.parse(JSON.stringify(originalAchievements))
    vi.clearAllMocks()
  })

  it('completes a blackjack achievement through a normal hand', () => {
    const achievementStore = useAchievementStore()
    const blackjackStore = useBlackjackStore()

    mockDeck = buildDeckForDeal(
      [makeCard('hearts', 9, '9'), makeCard('spades', 8, '8')],
      [makeCard('diamonds', 6, '6'), makeCard('clubs', 6, '6')],
      makeCard('spades', 10, '10')
    )

    blackjackStore.currentBet = 500
    blackjackStore.dealCards()
    blackjackStore.stand()

    const achievement = achievementStore.achievements.find(a => a.id === 'high_stakes')
    expect(achievement?.completed).toBe(true)
  })

  it('completes a clicker achievement by buying an auto-clicker', () => {
    const achievementStore = useAchievementStore()
    const clickerStore = useClickerStore()
    const userStore = useUserStore()

    userStore.chips = 10000
    vi.spyOn(clickerStore, 'startAutoClicker').mockImplementation(() => {})
    clickerStore.buyAutoClicker(userStore)

    const achievement = achievementStore.achievements.find(a => a.id === 'auto_collector')
    expect(achievement?.completed).toBe(true)
  })

  it('completes a roulette achievement across multiple spins', async () => {
    const achievementStore = useAchievementStore()
    const rouletteStore = useRouletteStore()
    const userStore = useUserStore()

    userStore.chips = 100000

    for (let i = 0; i < 25; i++) {
      rouletteStore.placeBet('straight', [1], 10)
      await rouletteStore.spin()
      rouletteStore.reset()
    }

    const achievement = achievementStore.achievements.find(a => a.id === 'roulette_regular')
    expect(achievement?.completed).toBe(true)
  })
})
