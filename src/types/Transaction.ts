export interface Transaction {
  id: string;
  timestamp: number;
  amount: number;
  type: 'win' | 'loss' | 'push';
  game: 'blackjack' | 'roulette' | 'clicker';
  details?: string;
}
