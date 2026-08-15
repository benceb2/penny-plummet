/**
 * Roulette Game Store
 *
 * This store manages the state and logic for a roulette game using standard casino rules:
 * - European roulette with single zero (0-36 + 0)
 * - Supports inside bets (straight, split, corner, etc.)
 * - Supports outside bets (red/black, odd/even, dozens, etc.)
 * - Tracks betting history and statistics
 *
 * @module useRouletteStore
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { calculateStorageKey, createGameSerializer } from '../utils/gameSaveSerializerUtil'
import { useAchievementStore } from './achievementStore'
import { formatIntAsCurrency } from '@/utils/numberFormatUtil'
import { useTransactionStore } from './transactionStore'
import { useUserStore } from './userStore'
import { RouletteState } from '@/types/RouletteState'
import type { BetType, RouletteBet } from '@/types/RouletteBet'
import type { RouletteResult } from '@/types/RouletteResult'

export type { BetType, RouletteBet, RouletteResult }

// Payout multipliers for different bet types
const PAYOUT_MULTIPLIERS = {
  straight: 35,
  split: 17,
  street: 11,
  corner: 8,
  line: 5,
  dozen: 2,
  column: 2,
  red: 1,
  black: 1,
  even: 1,
  odd: 1,
  low: 1,
  high: 1
}

export const useRouletteStore = defineStore('roulette', () => {
  const achievementStore = useAchievementStore()
  const transactionStore = useTransactionStore()
  const userStore = useUserStore()

  // Game state
  const gameState = ref<RouletteState>(RouletteState.BETTING)
  const currentBets = ref<RouletteBet[]>([])
  const lastResult = ref<RouletteResult | null>(null)
  const winningNumber = ref<number | null>(null)
  const pendingResult = ref<RouletteResult | null>(null)

  // Session statistics
  const sessionStats = ref({
    spins: 0,
    biggestWin: 0,
    totalWagered: 0,
    consecutiveWins: 0,
    maxConsecutiveWins: 0
  })

  // Computed properties
  const totalBet = computed(() =>
    currentBets.value.reduce((sum, bet) => sum + bet.amount, 0)
  )

  const isSpinAllowed = computed(() =>
    gameState.value === RouletteState.BETTING &&
    totalBet.value > 0 &&
    totalBet.value <= userStore.chips // Ensure user has enough chips
  )

  /**
   * Places a new bet on the table
   * @param betType Type of bet being placed
   * @param numbers Array of numbers covered by this bet
   * @param amount Bet amount
   */
  function placeBet(betType: BetType, numbers: number[], amount: number) {
    if (gameState.value !== RouletteState.BETTING) return

    // Check if adding this bet would exceed user's chips
    if (totalBet.value + amount > userStore.chips) {
      console.warn('Cannot place bet: would exceed available chips')
      return
    }

    currentBets.value.push({
      type: betType,
      numbers,
      amount
    })

    // Track high stakes bets
    if (amount >= 500) {
      achievementStore.updateAchievementProgress('high_stakes', amount)
    }
  }

  /**
   * Clears all current bets from the table
   */
  function clearBets() {
    if (gameState.value !== RouletteState.BETTING) return
    currentBets.value = []
  }

  /**
   * Resets the game state for a new round
   */
  function reset() {
    gameState.value = RouletteState.BETTING
    currentBets.value = []
    winningNumber.value = null
    lastResult.value = null
  }

  /**
   * Complete the game after spinner animation finishes
   */
  function completeGame() {
    if (pendingResult.value) {
      // NOW apply the chip changes after spinner completes
      handleSpinResult(pendingResult.value)
      lastResult.value = pendingResult.value
      pendingResult.value = null
    }
    gameState.value = RouletteState.COMPLETE
  }

  /**
   * Handle the spin result - update chips, log transactions, track achievements
   */
  function handleSpinResult(result: RouletteResult) {
    if (result.totalWin > 0 && result.totalWin >= result.totalBet) {
      // Player won something (net win or push)
      sessionStats.value.consecutiveWins++
      sessionStats.value.maxConsecutiveWins = Math.max(
        sessionStats.value.maxConsecutiveWins,
        sessionStats.value.consecutiveWins
      )
      achievementStore.updateAchievementProgress(
        'roulette_hot_streak',
        sessionStats.value.maxConsecutiveWins
      )

      if (result.totalWin > result.totalBet) {
        // Net win
        transactionStore.addTransaction({
          amount: result.totalWin - result.totalBet,
          type: 'win',
          game: 'roulette',
          detailsKey: 'transactions.details.roulette.win',
          detailsParams: {
            amount: formatIntAsCurrency(result.totalWin),
            number: result.winningNumber
          }
        })
      } else {
        // Push/break even
        transactionStore.addTransaction({
          amount: 0,
          type: 'push',
          game: 'roulette',
          detailsKey: 'transactions.details.roulette.push',
          detailsParams: {
            number: result.winningNumber
          }
        })
      }
    } else if (result.totalWin > 0) {
      // Partial loss: some bets won, but the payout doesn't cover the total stake.
      // Still a losing round overall, so it breaks a win streak like a complete loss.
      sessionStats.value.consecutiveWins = 0

      const netLoss = result.totalBet - result.totalWin
      transactionStore.addTransaction({
        amount: -netLoss,
        type: 'loss',
        game: 'roulette',
        detailsKey: 'transactions.details.roulette.loss',
        detailsParams: {
          amount: formatIntAsCurrency(netLoss),
          number: result.winningNumber
        }
      })
    } else {
      // Complete loss
      sessionStats.value.consecutiveWins = 0

      transactionStore.addTransaction({
        amount: -result.totalBet,
        type: 'loss',
        game: 'roulette',
        detailsKey: 'transactions.details.roulette.loss',
        detailsParams: {
          amount: formatIntAsCurrency(result.totalBet),
          number: result.winningNumber
        }
      })
    }

    // Update session stats
    sessionStats.value.biggestWin = Math.max(sessionStats.value.biggestWin, result.totalWin)

    // Track achievements if needed
    if (result.totalWin >= 1000) {
      achievementStore.updateAchievementProgress('high_roller', result.totalWin)
    }

    // Track single number win achievement
    const straightBetWins = result.winningBets.filter(bet => bet.type === 'straight')
    if (straightBetWins.length > 0) {
      achievementStore.updateAchievementProgress('lucky_number', 1)
    }
  }

  /**
   * Spin the roulette wheel
   */
  async function spin(): Promise<RouletteResult> {
    if (!isSpinAllowed.value) {
      console.error('Spin not allowed:', {
        state: gameState.value,
        totalBet: totalBet.value,
        chips: userStore.chips
      })
      return {} as RouletteResult
    }

    // Validate user has enough chips (double-check)
    if (totalBet.value > userStore.chips) {
      console.error('Insufficient chips for bet')
      return {} as RouletteResult
    }

    gameState.value = RouletteState.SPINNING

    // Generate winning number
    const result: RouletteResult = {
      winningNumber: Math.floor(Math.random() * 37),
      totalWin: 0,
      totalBet: totalBet.value,
      winningBets: [],
      losingBets: []
    }

    // Calculate winnings for each bet
    currentBets.value.forEach(bet => {
      if (bet.numbers.includes(result.winningNumber)) {
        // This bet wins - payout is bet amount * multiplier + original bet
        const payout = bet.amount * (PAYOUT_MULTIPLIERS[bet.type] + 1)
        result.totalWin += payout
        result.winningBets.push(bet)
      } else {
        result.losingBets.push(bet)
      }
    })

    // Update session stats
    sessionStats.value.spins++
    sessionStats.value.totalWagered += totalBet.value
    achievementStore.updateAchievementProgress('roulette_regular', sessionStats.value.spins)
    achievementStore.updateAchievementProgress('roulette_marathon', sessionStats.value.totalWagered)

    // Store the result for later (don't update chips yet!)
    pendingResult.value = result
    winningNumber.value = result.winningNumber

    return result
  }

  return {
    // State
    gameState,
    currentBets,
    lastResult,
    winningNumber,
    sessionStats,
    pendingResult,

    // Computed
    totalBet,
    isSpinAllowed,

    // Actions
    placeBet,
    clearBets,
    spin,
    reset,
    completeGame
  }
}, {
  persist: {
    key: calculateStorageKey("roulette-store"),
    serializer: createGameSerializer()
  }
} as any)

export type RouletteStore = ReturnType<typeof useRouletteStore>
