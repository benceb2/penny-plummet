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
