import type { Achievement } from "@/types/Achievement";
import { ref } from "vue";

export const achievements = ref<Achievement[]>([
  // Blackjack achievements
  {
    id: 'first_hand',
    title: 'Getting Started',
    description: 'Play your first hand of Blackjack',
    requirement: 1,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      chips: 10,
      xp: 10
    },
    category: 'blackjack'
  },
  {
    id: 'blackjack_veteran',
    title: 'Blackjack Veteran',
    description: 'Play 100 hands of Blackjack',
    requirement: 100,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      chips: 500,
      xp: 250
    },
    category: 'blackjack'
  },
  {
    id: 'winning_streak',
    title: 'Hot Streak',
    description: 'Win 5 hands in a row',
    requirement: 5,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      chips: 250,
      xp: 100
    },
    category: 'blackjack'
  },
  {
    id: 'high_roller',
    title: 'High Roller',
    description: 'Win $1,000 or more in a single hand',
    requirement: 1000,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      chips: 1000,
      xp: 500
    },
    category: 'blackjack'
  },
  {
    id: 'blackjack_master',
    title: 'Natural Talent',
    description: 'Get Blackjack 10 times',
    requirement: 10,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      chips: 500,
      xp: 200
    },
    category: 'blackjack'
  },
  {
    id: 'high_stakes',
    title: 'High Stakes Player',
    description: 'Place a bet of $500 or more',
    requirement: 500,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      chips: 300,
      xp: 150
    },
    category: 'blackjack'
  },
  // Clicker Achievements
  {
    id: 'click_novice',
    title: 'Click Novice',
    description: 'Click 100 times',
    requirement: 100,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      chips: 50,
      xp: 25
    },
    category: 'clicker'
  },
  {
    id: 'click_master',
    title: 'Click Master',
    description: 'Click 1,000 times',
    requirement: 1000,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      chips: 200,
      xp: 100
    },
    category: 'clicker'
  },
  {
    id: 'auto_collector',
    title: 'Automation Beginner',
    description: 'Buy your first auto-clicker',
    requirement: 1,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      chips: 100,
      xp: 50
    },
    category: 'clicker'
  },
  {
    id: 'auto_empire',
    title: 'Click Empire',
    description: 'Own 10 auto-clickers',
    requirement: 10,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      chips: 500,
      xp: 250
    },
    category: 'clicker'
  },
  {
    id: 'multiplier_enthusiast',
    title: 'Multiplier Enthusiast',
    description: 'Reach multiplier level 5',
    requirement: 5,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      chips: 300,
      xp: 150
    },
    category: 'clicker'
  },
  {
    id: 'lucky_number',
    title: 'Lucky Number',
    description: 'Win with a straight bet in Roulette',
    requirement: 1,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      chips: 250,
      xp: 150
    },
    category: 'general'
  },
  {
    id: 'small_fortune',
    title: 'Small Fortune',
    description: 'Accumulate $1,000 in chips',
    requirement: 1000,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      chips: 100,
      xp: 50
    },
    category: 'general'
  },
  {
    id: 'medium_fortune',
    title: 'Medium Fortune',
    description: 'Accumulate $10,000 in chips',
    requirement: 10000,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      chips: 1000,
      xp: 250
    },
    category: 'general'
  },
  {
    id: 'large_fortune',
    title: 'Large Fortune',
    description: 'Accumulate $100,000 in chips',
    requirement: 100000,
    progress: 0,
    completed: false,
    claimed: false,
    reward: {
      chips: 10000,
      xp: 1000
    },
    category: 'general'
  }
]);

export function sortAchievementsByPriority(achievements: Achievement[]): Achievement[] {
  return [...achievements].sort((a, b) => {
    // Priority 1: Unclaimed completed achievements first
    if (a.completed && !a.claimed && !(b.completed && !b.claimed)) return -1;
    if (b.completed && !b.claimed && !(a.completed && !a.claimed)) return 1;

    // Priority 2: In-progress achievements next
    if (!a.completed && b.completed && b.claimed) return -1;
    if (!b.completed && a.completed && a.claimed) return 1;

    // Priority 3: Completed & claimed achievements last
    if (a.completed && a.claimed && !b.completed) return 1;
    if (b.completed && b.claimed && !a.completed) return -1;

    // Within same priority, sort by progress percentage (descending)
    const aProgress = a.completed ? 100 : (a.progress / a.requirement) * 100;
    const bProgress = b.completed ? 100 : (b.progress / b.requirement) * 100;
    return bProgress - aProgress;
  });
}

export function filterAndSortAchievements(
  achievements: Achievement[],
  category: string = 'all'
): Achievement[] {
  let filtered = achievements;

  // Apply category filter
  if (category !== 'all') {
    filtered = filtered.filter(a => a.category === category);
  }

  return sortAchievementsByPriority(filtered);
}
