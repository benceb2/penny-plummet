export interface BlackjackResult {
  isWin: boolean // TODO: consider having enum value for win/loss/push
  isPush: boolean
  amount: number
  playerScore: number
  dealerScore: number
  initialBet: number
}
