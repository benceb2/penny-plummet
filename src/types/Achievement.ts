export interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement: number;
  progress: number;
  completed: boolean;
  reward: number; // Chips or XP reward
  category: 'blackjack' | 'clicker' | 'general';
}
