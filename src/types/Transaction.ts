export interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
  type: 'win' | 'loss' | 'push' | 'income';
  game: 'blackjack' | 'roulette' | 'clicker';
  details?: string;
}
