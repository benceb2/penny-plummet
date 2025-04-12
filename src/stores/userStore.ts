import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { type BlackjackResult } from '@/types/BlackjackResult';
import { calculateStorageKey, createGameSerializer } from '@/utils/gameSaveSerializer';
import { formatIntAsCurrency } from '@/utils/currencyUtil';
import { useAchievementStore } from './achievementStore';
import { useTransactionStore } from './transactionStore';

export const useUserStore = defineStore('user', () => {
  const achievementStore = useAchievementStore()

  const consented = ref(false)
  const chips = ref(50)
  const formattedChips = computed(() => formatIntAsCurrency(chips.value))
  const username = ref<string | null>(null)
  // Add cloud save prompt flag
  const hasSeenCloudSavePrompt = ref(false)
  const stats = ref({
    handsPlayed: 0,
    totalWinnings: 0,
    biggestWin: 0
  })

  function updateChips(amount: number) {
    chips.value += amount

    // Check positive balance achievements
    if (chips.value > 0) {
      // Update progress with highest balance reached
      achievementStore.updateAchievementProgress('small_fortune', chips.value)
      achievementStore.updateAchievementProgress('medium_fortune', chips.value)
      achievementStore.updateAchievementProgress('large_fortune', chips.value)
    }
  }

  function updateStats(gameResult: BlackjackResult) {
    stats.value.handsPlayed++;
    const transactionStore = useTransactionStore();

    if (gameResult.isWin) {
      const winAmount = gameResult.amount - gameResult.initialBet;
      stats.value.totalWinnings += winAmount;
      stats.value.biggestWin = Math.max(stats.value.biggestWin, winAmount);
      updateChips(gameResult.amount);

      // Add win transaction
      transactionStore.addTransaction({
        amount: winAmount,
        type: 'win',
        game: 'blackjack',
        details: `Won ${formatIntAsCurrency(winAmount)} with ${gameResult.playerScore} versus the dealer's ${gameResult.dealerScore}`
      });

    } else if (gameResult.isPush) {
      updateChips(gameResult.initialBet);

      // Add push transaction
      transactionStore.addTransaction({
        amount: 0,
        type: 'push',
        game: 'blackjack',
        details: 'Push - bet returned'
      });

    } else {
      stats.value.totalWinnings -= gameResult.initialBet;

      // Add loss transaction
      transactionStore.addTransaction({
        amount: -gameResult.initialBet,
        type: 'loss',
        game: 'blackjack',
        details: `Lost ${formatIntAsCurrency(gameResult.initialBet)} with ${gameResult.playerScore} versus the dealer's ${gameResult.dealerScore}`
      });
    }
  }

  function updateConsent(newConsent: boolean) {
    consented.value = newConsent;
  }

  function updateUsername(newUsername: string) {
    username.value = newUsername
  }

  // Add function to mark cloud save prompt as seen
  function markCloudSavePromptAsSeen() {
    hasSeenCloudSavePrompt.value = true;
  }

  return {
    consented,
    chips,
    formattedChips,
    username,
    stats,
    hasSeenCloudSavePrompt,
    updateChips,
    updateStats,
    updateUsername,
    updateConsent,
    markCloudSavePromptAsSeen
  }
},
  {
    persist: {
      key: calculateStorageKey("user-store"),
      serializer: createGameSerializer()
    }
  } as any) // treating this as any because the TS support for the persistence
// plugin doesn't seem to be working and we cannot compile otherwise.

export type UserStore = ReturnType<typeof useUserStore>
