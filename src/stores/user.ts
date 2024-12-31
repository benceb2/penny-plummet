import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { type BlackjackResult } from '@/types/BlackjackResult';
import { calculateStorageKey, createGameSerializer } from '../utils/serializer';
import { formatIntAsCurrency } from '@/utils/currency';

export const useUserStore = defineStore('user', () => {
  const consented = ref(false)
  const chips = ref(50)
  const formattedChips = computed(() => formatIntAsCurrency(chips.value))
  const username = ref<string | null>(null)
  const stats = ref({
    handsPlayed: 0,
    totalWinnings: 0,
    biggestWin: 0
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

  function updateConsent(newConsent: boolean) {
    consented.value = newConsent;
  }

  function updateUsername(newUsername: string) {
    username.value = newUsername
  }

  return {
    consented,
    chips,
    formattedChips,
    username,
    stats,
    updateChips,
    updateStats,
    updateUsername,
    updateConsent
  }
}, {
  persist: {
    key: calculateStorageKey("user-store"),
    serializer: createGameSerializer()
  }
})

export type UserStore = ReturnType<typeof useUserStore>
