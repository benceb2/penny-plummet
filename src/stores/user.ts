import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { type BlackjackResult } from '@/types/BlackjackResult';

export const useUserStore = defineStore('user', () => {
  const chips = ref(1000)
  const username = ref<string | null>(null)
  const stats = ref({
    handsPlayed: 0,
    totalWinnings: 0,
    biggestWin: 0
  })

  const formattedChips = computed(() => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(chips.value)
  })

  function updateChips(amount: number) {
    chips.value += amount
  }

  function updateStats(gameResult: BlackjackResult) {
    stats.value.handsPlayed++

    if (gameResult.isWin) {
      const winAmount = gameResult.amount - gameResult.initialBet
      stats.value.totalWinnings += winAmount
      stats.value.biggestWin = Math.max(stats.value.biggestWin, winAmount)
      updateChips(gameResult.amount)
    } else if (gameResult.isPush) {
      updateChips(gameResult.initialBet) // Return original bet
    } else {
      stats.value.totalWinnings -= gameResult.initialBet
    }
  }

  return {
    chips,
    username,
    stats,
    formattedChips,
    updateChips,
    updateStats
  }
}, {
  persist: true
})
