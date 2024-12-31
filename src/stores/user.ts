import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { type BlackjackResult } from '@/types/BlackjackResult';
import { calculateStorageKey, createGameSerializer } from '@/utils/serializer';
import { formatIntAsCurrency } from '@/utils/currency';
import { useAchievementStore } from './achievement';

export const useUserStore = defineStore('user', () => {
  const achievementStore = useAchievementStore()

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
    const oldChips = chips.value
    chips.value += amount

    // Check negative balance achievements
    if (chips.value < 0) {
      if (oldChips >= -100 && chips.value <= -100) {
        achievementStore.updateAchievementProgress('small_debt', 100)
      }
      if (oldChips >= -1000 && chips.value <= -1000) {
        achievementStore.updateAchievementProgress('big_debt', 1000)
      }
      if (oldChips >= -100000 && chips.value <= -100000) {
        achievementStore.updateAchievementProgress('massive_debt', 100000)
      }
    }

    // Check positive balance achievements
    if (chips.value > 0) {
      if (oldChips < 1000 && chips.value >= 1000) {
        achievementStore.updateAchievementProgress('small_fortune', 1000)
      }
      if (oldChips < 10000 && chips.value >= 10000) {
        achievementStore.updateAchievementProgress('medium_fortune', 10000)
      }
      if (oldChips < 100000 && chips.value >= 100000) {
        achievementStore.updateAchievementProgress('large_fortune', 100000)
      }
    }
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
