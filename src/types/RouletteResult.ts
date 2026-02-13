import type { RouletteBet } from './RouletteBet';

export interface RouletteResult {
  winningNumber: number
  totalWin: number
  totalBet: number
  winningBets: RouletteBet[]
  losingBets: RouletteBet[]
}
