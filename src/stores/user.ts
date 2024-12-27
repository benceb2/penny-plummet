import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { type GameResult } from '@/types/BlackjackResult';

export const useUserStore = defineStore('user', () => {
  const chips = ref(1000)
  const username = ref(null)
  const stats = ref({
    handsPlayed: 0,
    totalWinnings: 0,
    biggestWin: 0
  })

  function updateChips(amount: number) {
    chips.value += amount
  }

  function updateStats(gameResult: GameResult) {

  }

  return {
    chips,
    username,
    stats,
    updateChips,
    updateStats
  }
})