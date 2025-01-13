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
import { formatIntAsCurrency } from '@/utils/currencyUtil'
import { useTransactionStore } from './transactionStore'
import { useUserStore } from './userStore'


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
  const transactionStore = useTransactionStore();
  const userStore = useUserStore();

  // Game state
  const gameState = ref<RouletteState>(RouletteState.betting)
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
   * Resets the game state for a new round
   */
  function reset() {
    gameState.value = RouletteState.betting
    currentBets.value = []
    winningNumber.value = null
    lastResult.value = null
  }

  function completeGame() {
    if (pendingResult.value) {
      lastResult.value = pendingResult.value
      pendingResult.value = null
    }
    gameState.value = RouletteState.complete
  }

  function handleSpinResult(result: RouletteResult) {
    // Update user's chips based on result
    const netWinnings = result.totalWin - result.totalBet;
    userStore.updateChips(netWinnings);

    if (result.totalWin > 0) {
      sessionStats.value.consecutiveWins++;
      sessionStats.value.maxConsecutiveWins = Math.max(
        sessionStats.value.maxConsecutiveWins,
        sessionStats.value.consecutiveWins
      );

      transactionStore.addTransaction({
        amount: netWinnings,
        type: 'win',
        game: 'roulette',
        details: `Won ${formatIntAsCurrency(result.totalWin)} on number ${result.winningNumber}`
      });
    } else {
      sessionStats.value.consecutiveWins = 0;

      transactionStore.addTransaction({
        amount: -result.totalBet,
        type: 'loss',
        game: 'roulette',
        details: `Lost ${formatIntAsCurrency(result.totalBet)} on number ${result.winningNumber}`
      });
    }

    // Update session stats
    sessionStats.value.biggestWin = Math.max(sessionStats.value.biggestWin, result.totalWin);

    // Track achievements if needed
    if (result.totalWin >= 1000) {
      achievementStore.updateAchievementProgress('high_roller', result.totalWin);
    }
  }

  async function spin(): Promise<RouletteResult> {
    if (!isSpinAllowed.value) return {} as RouletteResult;

    gameState.value = RouletteState.spinning;

    const result: RouletteResult = {
      winningNumber: Math.floor(Math.random() * 37),
      totalWin: 0,
      totalBet: totalBet.value,
      winningBets: [],
      losingBets: []
    };

    // Calculate results
    currentBets.value.forEach(bet => {
      if (bet.numbers.includes(result.winningNumber)) {
        const payout = bet.amount * (PAYOUT_MULTIPLIERS[bet.type] + 1);
        result.totalWin += payout;
        result.winningBets.push(bet);
      } else {
        result.losingBets.push(bet);
      }
    });

    // Update session stats
    sessionStats.value.spins++;
    sessionStats.value.totalWagered += totalBet.value;

    // Store the result
    pendingResult.value = result;
    winningNumber.value = result.winningNumber;

    // Handle the result immediately
    handleSpinResult(result);

    return result;
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
