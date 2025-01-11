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
import { calculateStorageKey, createGameSerializer } from '../utils/gameSaveSerializer'
import { useAchievementStore } from './achievementStore'
// import { useUserStore } from './userStore'

export enum RouletteState {
  betting = 'betting',
  spinning = 'spinning',
  complete = 'complete'
}

export type BetType =
  | 'straight'    // Single number
  | 'split'       // Two adjacent numbers
  | 'street'      // Three numbers in a row
  | 'corner'      // Four adjacent numbers
  | 'line'        // Six numbers (two rows)
  | 'dozen'       // 1-12, 13-24, 25-36
  | 'column'      // 1st, 2nd, or 3rd column
  | 'red'         // Red numbers
  | 'black'       // Black numbers
  | 'even'        // Even numbers
  | 'odd'         // Odd numbers
  | 'low'         // 1-18
  | 'high'        // 19-36

export interface RouletteBet {
  type: BetType
  numbers: number[]  // Numbers covered by this bet
  amount: number
}

export interface RouletteResult {
  winningNumber: number
  totalWin: number
  totalBet: number
  winningBets: RouletteBet[]
  losingBets: RouletteBet[]
}

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
  // const userStore = useUserStore()

  // Game state
  const gameState = ref<RouletteState>(RouletteState.betting)
  const currentBets = ref<RouletteBet[]>([])
  const lastResult = ref<RouletteResult | null>(null)
  const winningNumber = ref<number | null>(null)

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
    gameState.value === RouletteState.betting && totalBet.value > 0
  )

  /**
   * Places a new bet on the table
   * @param betType Type of bet being placed
   * @param numbers Array of numbers covered by this bet
   * @param amount Bet amount
   */
  function placeBet(betType: BetType, numbers: number[], amount: number) {
    if (gameState.value !== RouletteState.betting) return

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
    if (gameState.value !== RouletteState.betting) return
    currentBets.value = []
  }

  /**
   * Spins the roulette wheel and determines the outcome
   * @returns {RouletteResult} Object containing spin results and payout information
   */
  async function spin(): Promise<RouletteResult> {
    if (!isSpinAllowed.value) return {} as RouletteResult;

    gameState.value = RouletteState.spinning

    // Generate winning number (0-36)
    winningNumber.value = Math.floor(Math.random() * 37)

    // Calculate results
    const winningBets: RouletteBet[] = []
    const losingBets: RouletteBet[] = []
    let totalWin = 0

    currentBets.value.forEach(bet => {
      if (winningNumber.value == null) return;
      if (bet.numbers.includes(winningNumber.value)) {
        const payout = bet.amount * (PAYOUT_MULTIPLIERS[bet.type] + 1)
        totalWin += payout
        winningBets.push(bet)
      } else {
        losingBets.push(bet)
      }
    })

    // Update session stats
    sessionStats.value.spins++
    sessionStats.value.totalWagered += totalBet.value

    if (totalWin > 0) {
      sessionStats.value.consecutiveWins++
      sessionStats.value.maxConsecutiveWins = Math.max(
        sessionStats.value.consecutiveWins,
        sessionStats.value.maxConsecutiveWins
      )
      sessionStats.value.biggestWin = Math.max(
        sessionStats.value.biggestWin,
        totalWin
      )

      // Track achievements
      achievementStore.updateAchievementProgress('winning_streak',
        sessionStats.value.consecutiveWins)

      if (totalWin >= 1000) {
        achievementStore.updateAchievementProgress('high_roller', totalWin)
      }

      // Add XP based on win amount (10% of winnings)
      const xpGain = Math.floor((totalWin - totalBet.value) * 0.1)
      achievementStore.addXP(xpGain)
    } else {
      sessionStats.value.consecutiveWins = 0
    }

    // Create result object
    const result: RouletteResult = {
      winningNumber: winningNumber.value,
      totalWin,
      totalBet: totalBet.value,
      winningBets,
      losingBets
    }

    // Update last result and game state
    lastResult.value = result
    gameState.value = RouletteState.complete

    // Update user stats
    // userStore.updateStats({
    //   isWin: totalWin > totalBet.value,
    //   isPush: totalWin === totalBet.value,
    //   amount: totalWin,
    //   initialBet: totalBet.value
    // })

    return result
  }

  /**
   * Resets the game state for a new round
   */
  function reset() {
    gameState.value = RouletteState.betting
    currentBets.value = []
    winningNumber.value = null
  }

  return {
    // State
    gameState,
    currentBets,
    lastResult,
    winningNumber,
    sessionStats,

    // Computed
    totalBet,
    isSpinAllowed,

    // Actions
    placeBet,
    clearBets,
    spin,
    reset
  }
}, {
  persist: {
    key: calculateStorageKey("roulette-store"),
    serializer: createGameSerializer()
  }
} as any)
