import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

import { calculateStorageKey, createGameSerializer } from '@/utils/gameSaveSerializer';
import { achievements } from '@/utils/achievementUitl';
import type { Achievement } from '@/types/Achievement';
import type { Level } from '@/types/Level';
import { useUserStore } from './userStore';
import { useToastStore } from './toastStore';

export const useAchievementStore = defineStore('achievements', () => {
  const userStore = useUserStore();
  const toastStore = useToastStore();

  // Level System
  const currentLevel = ref<Level>({
    level: 1,
    currentXP: 0,
    requiredXP: 600,
    rewards: {
      chips: 100,
    }
  });

  // Computed Properties
  const levelProgress = computed(() => {
    return (currentLevel.value.currentXP / currentLevel.value.requiredXP) * 100;
  });

  const completedAchievements = computed(() => {
    return achievements.value.filter(a => a.completed);
  });

  // Methods
  function addXP(amount: number) {
    currentLevel.value.currentXP += amount;
    checkLevelUp();
  }

  function checkLevelUp() {
    while (currentLevel.value.currentXP >= currentLevel.value.requiredXP) {
      // Store old level for comparison
      const oldLevel = currentLevel.value.level;
      levelUp();

      // Only show toast if level actually increased
      if (currentLevel.value.level > oldLevel) {
        const toastStore = useToastStore();
        const rewards = {
          chips: Math.floor(100 * Math.pow(1.2, currentLevel.value.level - 1)),
          multiplier: 1 + (currentLevel.value.level - 1) * 0.1
        };

        toastStore.levelUp(currentLevel.value.level, rewards);
      }
    }
  }

  function levelUp() {
    const excess = currentLevel.value.currentXP - currentLevel.value.requiredXP;
    currentLevel.value.level++;
    currentLevel.value.currentXP = excess;
    currentLevel.value.requiredXP = Math.floor(currentLevel.value.requiredXP * 1.5);

    // Apply level up rewards
    const reward = calculateLevelReward(currentLevel.value.level);
    userStore.updateChips(reward.chips);

    // Update rewards for next level
    currentLevel.value.rewards = {
      chips: Math.floor(currentLevel.value.rewards.chips * 1.2),
    };
  }

  function calculateLevelReward(level: number) {
    return {
      chips: Math.floor(100 * Math.pow(1.2, level - 1)),
      multiplier: 1 + (level - 1) * 0.1
    };
  }

  function updateAchievementProgress(achievementId: string, progress: number) {
    const achievement = achievements.value.find(a => a.id === achievementId);
    if (achievement && !achievement.completed) {
      achievement.progress = Math.min(achievement.requirement, progress);

      if (achievement.progress >= achievement.requirement) {
        completeAchievement(achievement);
      }
    }
  }

  function completeAchievement(achievement: Achievement) {
    if (!achievement.completed) {
      achievement.completed = true;
      userStore.updateChips(achievement.reward.chips);
      addXP(achievement.reward.xp); // Also grant XP equal to chip reward
      toastStore.achievementUnlocked(achievement.title, achievement.description);
    }
  }

  return {
    currentLevel,
    achievements,
    levelProgress,
    completedAchievements,
    addXP,
    updateAchievementProgress
  };
}, {
  persist: {
    key: calculateStorageKey("achievements-store"),
    serializer: createGameSerializer()
  }
} as any) // treating this as any because the TS support for the persistence
// plugin doesn't seem to be working and we cannot compile otherwise.)

export type AchievementStore = ReturnType<typeof useAchievementStore>;
