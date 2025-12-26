import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useBlackjackStore } from '../blackjackStore'
import { BlackjackState } from '@/types/BlackjackGameState'
import type { Card } from '@/types/Card'

const updateStats = vi.fn()
const updateAchievementProgress = vi.fn()
const addXP = vi.fn()
const addTransaction = vi.fn()
let mockDeck: Card[] = []

vi.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    stats: { handsPlayed: 0 },
    updateStats
  })
}))

vi.mock('@/stores/achievementStore', () => ({
  useAchievementStore: () => ({
    updateAchievementProgress,
    addXP
  })
}))

vi.mock('@/stores/transactionStore', () => ({
  useTransactionStore: () => ({
    addTransaction
  })
}))

vi.mock('@/utils/blackjackUtil', async () => {
  const actual = await vi.importActual<typeof import('@/utils/blackjackUtil')>('@/utils/blackjackUtil')
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

const buildDeckForDeal = (player: [Card, Card], dealer: [Card, Card]) => ([
  makeCard('clubs', 2, '2'),
  makeCard('diamonds', 3, '3'),
  makeCard('spades', 4, '4'),
  makeCard('hearts', 5, '5'),
  dealer[1],
  dealer[0],
  player[1],
  player[0]
])

describe('Blackjack Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockDeck = buildDeckForDeal(
      [makeCard('hearts', 9, '9'), makeCard('spades', 8, '8')],
      [makeCard('diamonds', 7, '7'), makeCard('clubs', 6, '6')]
    )
  })

  // Initial state tests
  describe('Initial State', () => {
    it('initializes with default state', () => {
      const store = useBlackjackStore()

      expect(store.deck).toEqual([])
      expect(store.playerHand).toEqual([])
      expect(store.dealerHand).toEqual([])
      expect(store.gameState).toBe(BlackjackState.BETTING)
      expect(store.currentBet).toBe(0)
    })
  })

  // Game initialization tests
  describe('Deal Cards', () => {
    it('deals correct number of initial cards', () => {
      const store = useBlackjackStore()
      store.dealCards()

      expect(store.playerHand).toHaveLength(2)
      expect(store.dealerHand).toHaveLength(2)
      expect(store.gameState).toBe(BlackjackState.PLAYER_TURN)
    })

    it('deals player cards face up and dealer with one card face down', () => {
      const store = useBlackjackStore()
      store.dealCards()

      // Player cards should be face up
      expect(store.playerHand.every(card => card.faceUp)).toBe(true)
      // Dealer's first card should be face up, second face down
      expect(store.dealerHand[0].faceUp).toBe(true)
      expect(store.dealerHand[1].faceUp).toBe(false)
    })
  })

  describe('Initial Blackjack Resolution', () => {
    it('ends the game when the player has blackjack and dealer does not', () => {
      mockDeck = buildDeckForDeal(
        [makeCard('hearts', 1, 'A'), makeCard('spades', 10, 'K')],
        [makeCard('diamonds', 9, '9'), makeCard('clubs', 7, '7')]
      )
      const store = useBlackjackStore()
      store.currentBet = 10

      store.dealCards()

      expect(store.gameState).toBe(BlackjackState.GAME_OVER)
      expect(store.dealerHand[1].faceUp).toBe(true)
      expect(updateStats).toHaveBeenCalledWith(expect.objectContaining({
        isWin: true,
        isPush: false,
        amount: 25,
        initialBet: 10
      }))
    })

    it('ends the game when the dealer has blackjack and player does not', () => {
      mockDeck = buildDeckForDeal(
        [makeCard('hearts', 9, '9'), makeCard('spades', 8, '8')],
        [makeCard('diamonds', 1, 'A'), makeCard('clubs', 10, 'Q')]
      )
      const store = useBlackjackStore()
      store.currentBet = 10

      store.dealCards()

      expect(store.gameState).toBe(BlackjackState.GAME_OVER)
      expect(store.dealerHand[1].faceUp).toBe(true)
      expect(updateStats).toHaveBeenCalledWith(expect.objectContaining({
        isWin: false,
        isPush: false,
        amount: 0,
        initialBet: 10
      }))
    })

    it('marks a push when both player and dealer have blackjack', () => {
      mockDeck = buildDeckForDeal(
        [makeCard('hearts', 1, 'A'), makeCard('spades', 10, 'K')],
        [makeCard('diamonds', 1, 'A'), makeCard('clubs', 10, 'Q')]
      )
      const store = useBlackjackStore()
      store.currentBet = 10

      store.dealCards()

      expect(store.gameState).toBe(BlackjackState.GAME_OVER)
      expect(store.dealerHand[1].faceUp).toBe(true)
      expect(updateStats).toHaveBeenCalledWith(expect.objectContaining({
        isWin: false,
        isPush: true,
        amount: 10,
        initialBet: 10
      }))
    })
  })

  // Player actions tests
  describe('Player Actions', () => {
    it('allows hit during player turn', () => {
      const store = useBlackjackStore()
      store.dealCards()
      const initialHandSize = store.playerHand.length

      store.hit()

      expect(store.playerHand).toHaveLength(initialHandSize + 1)
    })

    it('prevents hit when not player turn', () => {
      const store = useBlackjackStore()
      store.dealCards()
      store.gameState = BlackjackState.GAME_OVER
      const initialHandSize = store.playerHand.length

      store.hit()

      expect(store.playerHand).toHaveLength(initialHandSize)
    })

    it('automatically ends game when player busts', () => {
      const store = useBlackjackStore()
      store.dealCards()

      // Mock a hand that will bust
      store.playerHand = [
        { suit: 'hearts', value: 10, display: 'K', faceUp: true },
        { suit: 'spades', value: 10, display: 'Q', faceUp: true },
      ]
      store.deck = [
        { suit: 'diamonds', value: 10, display: 'J', faceUp: true },
      ]

      store.hit()

      expect(store.gameState).toBe(BlackjackState.GAME_OVER)
      expect(store.playerScore).toBe(30)
    })

    it('handles stand action correctly', () => {
      const store = useBlackjackStore()
      store.dealCards()

      store.stand()

      expect(store.gameState).toBe(BlackjackState.GAME_OVER)
      expect(store.dealerHand[1].faceUp).toBe(true)
    })
  })

  // Dealer logic tests
  describe('Dealer Logic', () => {
    it('dealer hits on 16 and stands on 17', () => {
      const store = useBlackjackStore()
      store.dealCards()

      // Set up a specific dealer hand
      store.dealerHand = [
        { suit: 'hearts', value: 10, display: 'K', faceUp: true },
        { suit: 'spades', value: 6, display: '6', faceUp: false },
      ]

      // Mock deck for deterministic testing
      store.deck = [
        { suit: 'diamonds', value: 2, display: '2', faceUp: true },
      ]

      store.stand() // Trigger dealer's turn

      expect(store.dealerScore).toBeGreaterThanOrEqual(17)
    })
  })

  // Game outcome tests
  describe('Game Outcomes', () => {
    it('correctly identifies player win', () => {
      const store = useBlackjackStore()
      store.currentBet = 10
      store.dealCards()

      // Set up winning scenario
      store.playerHand = [
        { suit: 'hearts', value: 10, display: 'K', faceUp: true },
        { suit: 'spades', value: 9, display: '9', faceUp: true },
      ]
      store.dealerHand = [
        { suit: 'diamonds', value: 10, display: 'Q', faceUp: true },
        { suit: 'clubs', value: 8, display: '8', faceUp: false },
      ]

      const result = store.endGame()

      expect(result.isWin).toBe(true)
      expect(result.amount).toBe(20) // Double the bet
    })

    it('correctly identifies dealer win', () => {
      const store = useBlackjackStore()
      store.currentBet = 10
      store.dealCards()

      // Set up losing scenario
      store.playerHand = [
        { suit: 'hearts', value: 10, display: 'K', faceUp: true },
        { suit: 'spades', value: 8, display: '8', faceUp: true },
      ]
      store.dealerHand = [
        { suit: 'diamonds', value: 10, display: 'Q', faceUp: true },
        { suit: 'clubs', value: 9, display: '9', faceUp: false },
      ]

      const result = store.endGame()

      expect(result.isWin).toBe(false)
      expect(result.amount).toBe(0)
    })

    it('correctly handles push', () => {
      const store = useBlackjackStore()
      store.currentBet = 10
      store.dealCards()

      // Set up push scenario
      store.playerHand = [
        { suit: 'hearts', value: 10, display: 'K', faceUp: true },
        { suit: 'spades', value: 9, display: '9', faceUp: true },
      ]
      store.dealerHand = [
        { suit: 'diamonds', value: 10, display: 'Q', faceUp: true },
        { suit: 'clubs', value: 9, display: '9', faceUp: false },
      ]

      const result = store.endGame()

      expect(result.isPush).toBe(true)
      expect(result.amount).toBe(10) // Return original bet
    })
  })

  // Reset functionality tests
  describe('Reset', () => {
    it('properly resets game state', () => {
      const store = useBlackjackStore()
      store.dealCards()
      store.currentBet = 100

      store.reset()

      expect(store.deck).toEqual([])
      expect(store.playerHand).toEqual([])
      expect(store.dealerHand).toEqual([])
      expect(store.gameState).toBe(BlackjackState.BETTING)
      expect(store.currentBet).toBe(0)
    })
  })
})
