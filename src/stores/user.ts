import { defineStore } from 'pinia';
import { type GameResult } from '../types/GameResult';

export const useUserStore = defineStore('user', {
  state: () => ({
    chips: 1000,
    username: null,
    stats: {
      handsPlayed: 0,
      totalWinnings: 0,
      biggestWin: 0
    }
  }),
  actions: {
    updateChips(amount: number) {
      this.chips += amount;
    },
    updateStats(gameResult: GameResult) {

    }
  }
})