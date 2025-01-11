export interface RouletteBet {
  type: 'straight' | 'split' | 'street' | 'corner' | 'sixLine' | 'dozen' | 'column' | 'even' | 'odd' | 'red' | 'black' | 'low' | 'high';
  amount: number;
  numbers: number[];  // Numbers covered by this bet
  payout: number;     // Payout multiplier
}
