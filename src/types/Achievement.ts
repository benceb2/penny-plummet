export interface Achievement {
  id: string;
  title: string;
  description: string;
  requirement: number;
  progress: number;
  claimed: boolean;
  completed: boolean;
  reward: {
    chips: number;
    xp: number;
  }; // Chips or XP reward
  category: 'blackjack' | 'clicker' | 'general';
}
