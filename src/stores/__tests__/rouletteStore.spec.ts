import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useRouletteStore } from '../rouletteStore'
import { RouletteState } from '@/types/RouletteState'

// Mock the achievement store
vi.mock('../achievementStore', () => ({
  useAchievementStore: () => ({
    updateAchievementProgress: vi.fn(),
    addXP: vi.fn()
  })
}))

// Mock the transaction store (hoisted so tests can assert on calls made by the store)
const addTransaction = vi.fn()
vi.mock('../transactionStore', () => ({
  useTransactionStore: () => ({
    addTransaction
  })
}))

// Mock the user store with chips property
vi.mock('../userStore', () => ({
  useUserStore: () => ({
    chips: 10000, // Give the user some chips to work with
    updateStats: vi.fn()
  })
}))

describe('Roulette Store', () => {
  let store: ReturnType<typeof useRouletteStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useRouletteStore()
    // Reset mocks
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should start in betting state', () => {
      expect(store.gameState).toBe(RouletteState.BETTING)
    })

    it('should have no current bets', () => {
      expect(store.currentBets).toHaveLength(0)
    })

    it('should have no last result', () => {
      expect(store.lastResult).toBeNull()
    })
  })

  describe('Betting', () => {
    it('should allow placing a bet', () => {
      store.placeBet('straight', [1], 100)
      expect(store.currentBets).toHaveLength(1)
      expect(store.totalBet).toBe(100)
    })

    it('should calculate total bet correctly with multiple bets', () => {
      store.placeBet('straight', [1], 100)
      store.placeBet('split', [1, 2], 50)
      expect(store.totalBet).toBe(150)
    })

    it('should not allow placing bets when not in betting state', () => {
      store.gameState = RouletteState.SPINNING
      store.placeBet('straight', [1], 100)
      expect(store.currentBets).toHaveLength(0)
    })

    it('should not allow placing bets that exceed available chips', () => {
      store.placeBet('straight', [1], 15000) // More than the 10000 chips we have
      expect(store.currentBets).toHaveLength(0)
    })

    it('should not allow placing additional bets that would exceed available chips', () => {
      store.placeBet('straight', [1], 6000)
      expect(store.currentBets).toHaveLength(1)

      store.placeBet('straight', [2], 5000) // Would total 11000, exceeding 10000 chips
      expect(store.currentBets).toHaveLength(1) // Should still be just 1 bet
      expect(store.totalBet).toBe(6000)
    })

    it('should clear all bets', () => {
      store.placeBet('straight', [1], 100)
      store.placeBet('split', [1, 2], 50)
      store.clearBets()
      expect(store.currentBets).toHaveLength(0)
      expect(store.totalBet).toBe(0)
    })
  })

  describe('Spinning', () => {
    beforeEach(() => {
      // Mock Math.random to return predictable values
      vi.spyOn(Math, 'random').mockReturnValue(0.1) // Will give number 3 (0.1 * 37 = 3.7, floor to 3)
    })

    it('should not allow spin without bets', () => {
      expect(store.isSpinAllowed).toBe(false)
    })

    it('should allow spin with valid bets', () => {
      store.placeBet('straight', [1], 100)
      expect(store.isSpinAllowed).toBe(true)
    })

    it('should calculate winning straight bet correctly', async () => {
      store.placeBet('straight', [3], 100) // Will win because mocked random gives 3
      const result = await store.spin()

      expect(result.winningNumber).toBe(3)
      expect(result.totalWin).toBe(3600) // 100 * (35 + 1)
      expect(result.winningBets).toHaveLength(1)
      expect(result.losingBets).toHaveLength(0)
    })

    it('should calculate losing bet correctly', async () => {
      store.placeBet('straight', [1], 100) // Will lose because mocked random gives 3
      const result = await store.spin()

      expect(result.winningNumber).toBe(3)
      expect(result.totalWin).toBe(0)
      expect(result.winningBets).toHaveLength(0)
      expect(result.losingBets).toHaveLength(1)
    })

    it('should update session stats after spin', async () => {
      store.placeBet('straight', [3], 100) // Will win
      await store.spin()

      expect(store.sessionStats.spins).toBe(1)
      expect(store.sessionStats.totalWagered).toBe(100)
      // Note: consecutiveWins is updated in completeGame/handleSpinResult
      // which happens after the spinner animation completes
    })

    it('should track consecutive wins correctly', async () => {
      // First spin - win
      store.placeBet('straight', [3], 100)
      await store.spin()
      store.completeGame() // Simulate spinner animation completion

      // Reset and second spin - win
      store.reset()
      store.placeBet('straight', [3], 100)
      await store.spin()
      store.completeGame() // Simulate spinner animation completion

      expect(store.sessionStats.consecutiveWins).toBe(2)
      expect(store.sessionStats.maxConsecutiveWins).toBe(2)
    })

    it('should reset consecutive wins on loss', async () => {
      // First spin - win
      store.placeBet('straight', [3], 100)
      await store.spin()
      store.completeGame()

      // Reset and second spin - loss
      store.reset()
      vi.spyOn(Math, 'random').mockReturnValue(0.5) // Different number
      store.placeBet('straight', [3], 100)
      await store.spin()
      store.completeGame()

      expect(store.sessionStats.consecutiveWins).toBe(0)
    })

    it('should record a loss transaction for the net amount on a partial loss (some bets win, others lose)', async () => {
      // Winning number is 3. $5 on red (covering 3) wins; $15 on black (not covering 3) loses.
      store.placeBet('red', [3], 5) // wins: payout = 5 * (1 + 1) = 10
      store.placeBet('black', [10], 15) // loses

      const result = await store.spin()
      expect(result.totalBet).toBe(20)
      expect(result.totalWin).toBe(10) // less than totalBet, but more than 0

      store.completeGame()

      // The net loss (totalBet - totalWin = 10) must still be charged to the player,
      // since chips only ever change via transactionStore.addTransaction.
      expect(addTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: -10,
          type: 'loss',
          game: 'roulette',
          detailsKey: 'transactions.details.roulette.loss'
        })
      )
    })

    it('should reset consecutive wins on a partial loss', async () => {
      // First spin - win, to build up a streak
      store.placeBet('straight', [3], 100)
      await store.spin()
      store.completeGame()
      expect(store.sessionStats.consecutiveWins).toBe(1)

      // Reset and second spin - partial loss
      store.reset()
      store.placeBet('red', [3], 5)
      store.placeBet('black', [10], 15)
      await store.spin()
      store.completeGame()

      expect(store.sessionStats.consecutiveWins).toBe(0)
    })
  })

  describe('Game Reset', () => {
    it('should reset to initial state', () => {
      store.placeBet('straight', [1], 100)
      store.reset()

      expect(store.gameState).toBe(RouletteState.BETTING)
      expect(store.currentBets).toHaveLength(0)
      expect(store.winningNumber).toBeNull()
    })

    it('should preserve session stats on reset', () => {
      store.sessionStats.spins = 5
      store.sessionStats.biggestWin = 1000
      store.reset()

      expect(store.sessionStats.spins).toBe(5)
      expect(store.sessionStats.biggestWin).toBe(1000)
    })
  })

  describe('Complete Game', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random').mockReturnValue(0.1) // Number 3
    })

    it('should complete game and update state', async () => {
      store.placeBet('straight', [3], 100)
      await store.spin()

      expect(store.gameState).toBe(RouletteState.SPINNING)
      expect(store.pendingResult).not.toBeNull()

      store.completeGame()

      expect(store.gameState).toBe(RouletteState.COMPLETE)
      expect(store.lastResult).not.toBeNull()
      expect(store.pendingResult).toBeNull()
    })
  })
})
