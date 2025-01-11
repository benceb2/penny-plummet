import type { RouletteBet } from "./RouletteBet";

export interface RouletteResult {
  isWin: boolean;
  winningNumber: number;
  totalWinAmount: number;
  initialBets: RouletteBet[];
  winningBets: RouletteBet[];
}
