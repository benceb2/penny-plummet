import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useRouletteStore, RouletteState } from '../rouletteStore'
// import { useAchievementStore } from '../achievementStore'
// import { useUserStore } from '../userStore'

// Mock the achievement and user stores
vi.mock('./achievementStore', () => ({
  useAchievementStore: () => ({
    updateAchievementProgress: vi.fn(),
    addXP: vi.fn()
  })
}))

vi.mock('./userStore', () => ({
  useUserStore: () => ({
    updateStats: vi.fn()
  })
}))

describe('Roulette Store', () => {
  let store: ReturnType<typeof useRouletteStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useRouletteStore()
  })

  describe('Initial State', () => {
    it('should start in betting state', () => {
      expect(store.gameState).toBe(RouletteState.betting)
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
      store.gameState = RouletteState.spinning
      store.placeBet('straight', [1], 100)
      expect(store.currentBets).toHaveLength(0)
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

    it.skip('should update session stats after spin', async () => {
      store.placeBet('straight', [3], 100) // Will win
      await store.spin()

      expect(store.sessionStats.spins).toBe(1)
      expect(store.sessionStats.totalWagered).toBe(100)
      expect(store.sessionStats.consecutiveWins).toBe(1)
    })

    it.skip('should track consecutive wins correctly', async () => {
      // First spin - win
      store.placeBet('straight', [3], 100)
      await store.spin()

      // Reset and second spin - win
      store.reset()
      store.placeBet('straight', [3], 100)
      await store.spin()

      expect(store.sessionStats.consecutiveWins).toBe(2)
      expect(store.sessionStats.maxConsecutiveWins).toBe(2)
    })
  })

  describe('Game Reset', () => {
    it('should reset to initial state', () => {
      store.placeBet('straight', [1], 100)
      store.reset()

      expect(store.gameState).toBe(RouletteState.betting)
      expect(store.currentBets).toHaveLength(0)
      expect(store.winningNumber).toBeNull()
    })
  })
})
