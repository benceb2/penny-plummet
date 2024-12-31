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
    reward: 10,
    category: 'blackjack'
  },
  {
    id: 'blackjack_veteran',
    title: 'Blackjack Veteran',
    description: 'Play 100 hands of Blackjack',
    requirement: 100,
    progress: 0,
    completed: false,
    reward: 500,
    category: 'blackjack'
  },
  {
    id: 'winning_streak',
    title: 'Hot Streak',
    description: 'Win 5 hands in a row',
    requirement: 5,
    progress: 0,
    completed: false,
    reward: 250,
    category: 'blackjack'
  },
  {
    id: 'high_roller',
    title: 'High Roller',
    description: 'Win $1,000 or more in a single hand',
    requirement: 1000,
    progress: 0,
    completed: false,
    reward: 1000,
    category: 'blackjack'
  },
  {
    id: 'blackjack_master',
    title: 'Natural Talent',
    description: 'Get Blackjack 10 times',
    requirement: 10,
    progress: 0,
    completed: false,
    reward: 500,
    category: 'blackjack'
  },
  {
    id: 'high_stakes',
    title: 'High Stakes Player',
    description: 'Place a bet of $500 or more',
    requirement: 500,
    progress: 0,
    completed: false,
    reward: 300,
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
    reward: 50,
    category: 'clicker'
  },
  {
    id: 'click_master',
    title: 'Click Master',
    description: 'Click 1,000 times',
    requirement: 1000,
    progress: 0,
    completed: false,
    reward: 200,
    category: 'clicker'
  },
  {
    id: 'auto_collector',
    title: 'Automation Beginner',
    description: 'Buy your first auto-clicker',
    requirement: 1,
    progress: 0,
    completed: false,
    reward: 100,
    category: 'clicker'
  },
  {
    id: 'auto_empire',
    title: 'Click Empire',
    description: 'Own 10 auto-clickers',
    requirement: 10,
    progress: 0,
    completed: false,
    reward: 500,
    category: 'clicker'
  },
  {
    id: 'multiplier_enthusiast',
    title: 'Multiplier Enthusiast',
    description: 'Reach multiplier level 5',
    requirement: 5,
    progress: 0,
    completed: false,
    reward: 300,
    category: 'clicker'
  },

  // General Achievements
  {
    id: 'small_debt',
    title: 'In the Red',
    description: 'Hit a balance of -$100',
    requirement: 100,
    progress: 0,
    completed: false,
    reward: 200,
    category: 'general'
  },
  {
    id: 'big_debt',
    title: 'Deep in Debt',
    description: 'Hit a balance of -$1,000',
    requirement: 1000,
    progress: 0,
    completed: false,
    reward: 2000,
    category: 'general'
  },
  {
    id: 'massive_debt',
    title: 'Rock Bottom',
    description: 'Hit a balance of -$100,000',
    requirement: 100000,
    progress: 0,
    completed: false,
    reward: 150000,
    category: 'general'
  },
  {
    id: 'small_fortune',
    title: 'Small Fortune',
    description: 'Accumulate $1,000 in chips',
    requirement: 1000,
    progress: 0,
    completed: false,
    reward: 100,
    category: 'general'
  },
  {
    id: 'medium_fortune',
    title: 'Medium Fortune',
    description: 'Accumulate $10,000 in chips',
    requirement: 10000,
    progress: 0,
    completed: false,
    reward: 1000,
    category: 'general'
  },
  {
    id: 'large_fortune',
    title: 'Large Fortune',
    description: 'Accumulate $100,000 in chips',
    requirement: 100000,
    progress: 0,
    completed: false,
    reward: 10000,
    category: 'general'
  }
])
