import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { type BlackjackResult } from '@/types/BlackjackResult';
import { calculateStorageKey, createGameSerializer } from '@/utils/gameSaveSerializerUtil';
import { formatIntAsCurrency } from '@/utils/numberFormatUtil';
import { useAchievementStore } from './achievementStore';

export const STARTING_CHIPS = 50;

export const useUserStore = defineStore('user', () => {
  const achievementStore = useAchievementStore()

  const consented = ref(false)
  const chips = ref(STARTING_CHIPS)
  const formattedChips = computed(() => formatIntAsCurrency(chips.value))
  const username = ref<string | null>(null)

  const stats = ref({
    handsPlayed: 0,
    totalWinnings: 0,
    biggestWin: 0,
    maxTotalWinnings: 0
  })

  function updateChips(amount: number) {
    chips.value += amount

    // Check positive balance achievements
    if (chips.value > 0) {
      // Update progress with highest balance reached
      achievementStore.updateAchievementProgress('small_fortune', chips.value)
      achievementStore.updateAchievementProgress('medium_fortune', chips.value)
      achievementStore.updateAchievementProgress('large_fortune', chips.value)
      achievementStore.updateAchievementProgress('fortune_king', chips.value)
    }
  }

  function updateStats(gameResult: BlackjackResult) {
    stats.value.handsPlayed++;

    if (gameResult.isWin) {
      const winAmount = gameResult.amount - gameResult.initialBet;
      stats.value.totalWinnings += winAmount;
      stats.value.biggestWin = Math.max(stats.value.biggestWin, winAmount);
    } else if (gameResult.isPush) {
    } else {
      stats.value.totalWinnings -= gameResult.initialBet;
    }

    stats.value.maxTotalWinnings = Math.max(
      stats.value.maxTotalWinnings,
      stats.value.totalWinnings
    );
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
    updateConsent,
  }
}, { persist: { key: calculateStorageKey("user-store"), serializer: createGameSerializer() } } as any)

export type UserStore = ReturnType<typeof useUserStore>
