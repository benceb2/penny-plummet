import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { calculateStorageKey, createGameSerializer } from '@/utils/gameSaveSerializerUtil';
import { achievements } from '@/utils/achievementUitl';
import type { Achievement } from '@/types/Achievement';
import type { Level } from '@/types/Level';
import i18n from '@/i18n';
import { useUserStore } from './userStore';
import { useToastStore } from './toastStore';

// Extend Achievement type to include claim status
interface AchievementWithClaim extends Achievement {
  completed: boolean;
  claimed: boolean;
  progress: number;
}

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

  // Track pending level ups to show them sequentially
  const pendingLevelUps = ref<Array<{ level: number, rewards: any }>>([]);
  const isShowingLevelUp = ref(false);

  // Computed Properties
  const levelProgress = computed(() => {
    return (currentLevel.value.currentXP / currentLevel.value.requiredXP) * 100;
  });

  const completedAchievements = computed(() => {
    return achievements.value.filter(a => a.completed);
  });

  const unclaimedAchievements = computed(() => {
    return achievements.value.filter(a => a.completed && !a.claimed);
  });

  // Methods
  function getAchievementKey(achievement: AchievementWithClaim) {
    return `achievements.${achievement.category}.${achievement.id}`;
  }

  function getAchievementTexts(achievement: AchievementWithClaim) {
    const key = getAchievementKey(achievement);
    return {
      title: i18n.global.t(`${key}.title`),
      description: i18n.global.t(`${key}.description`)
    };
  }

  function addXP(amount: number) {
    currentLevel.value.currentXP += amount;
    checkLevelUp();
  }

  async function checkLevelUp() {
    while (currentLevel.value.currentXP >= currentLevel.value.requiredXP) {
      const oldLevel = currentLevel.value.level;
      levelUp();

      if (currentLevel.value.level > oldLevel) {
        const rewards = {
          chips: Math.floor(100 * Math.pow(1.2, currentLevel.value.level - 1)),
          multiplier: 1 + (currentLevel.value.level - 1) * 0.1
        };

        // Queue level up notification
        pendingLevelUps.value.push({
          level: currentLevel.value.level,
          rewards
        });
      }
    }

    // Start showing level ups if not already showing
    if (pendingLevelUps.value.length > 0 && !isShowingLevelUp.value) {
      showNextLevelUp();
    }
  }

  async function showNextLevelUp() {
    if (pendingLevelUps.value.length === 0) {
      isShowingLevelUp.value = false;
      return;
    }

    isShowingLevelUp.value = true;
    const levelUpInfo = pendingLevelUps.value.shift();

    if (levelUpInfo) {
      toastStore.levelUp(levelUpInfo.level, levelUpInfo.rewards);
      // Wait for toast duration before showing next
      await new Promise(resolve => setTimeout(resolve, 2000));
      showNextLevelUp();
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

  function completeAchievement(achievement: AchievementWithClaim) {
    if (!achievement.completed) {
      achievement.completed = true;
      achievement.claimed = false; // Mark as unclaimed initially
      const { title, description } = getAchievementTexts(achievement);
      toastStore.achievementUnlocked(title, description);
    }
  }

  function claimAchievement(achievementId: string) {
    const achievement = achievements.value.find(a => a.id === achievementId) as AchievementWithClaim;
    if (achievement && achievement.completed && !achievement.claimed) {
      achievement.claimed = true;
      userStore.updateChips(achievement.reward.chips);
      addXP(achievement.reward.xp);
      toastStore.addToast({
        type: 'success',
        title: i18n.global.t('toast.rewardsClaimed.title'),
        message: i18n.global.t('toast.rewardsClaimed.message', {
          chips: achievement.reward.chips,
          xp: achievement.reward.xp
        }),
        icon: 'bi-gift-fill'
      });
    }
  }

  return {
    currentLevel,
    achievements,
    levelProgress,
    completedAchievements,
    unclaimedAchievements,
    addXP,
    updateAchievementProgress,
    claimAchievement
  };
}, {
  persist: {
    key: calculateStorageKey("achievements-store"),
    serializer: createGameSerializer()
  }
} as any);

export type AchievementStore = ReturnType<typeof useAchievementStore>;
