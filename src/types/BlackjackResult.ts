export interface BlackjackResult {
  isWin: boolean
  isPush: boolean
  amount: number
  playerScore: number
  dealerScore: number
  initialBet: number
}