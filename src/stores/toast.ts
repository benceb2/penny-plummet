import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Toast {
  id: number;
  type: 'achievement' | 'level-up' | 'success' | 'error';
  title: string;
  message: string;
  icon?: string;
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);
  let nextId = 0;

  function addToast(toast: Omit<Toast, 'id'>) {
    console.log('toastStore.addToast()', toast)
    const id = nextId++;
    toasts.value.push({ ...toast, id });

    // Remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }

  function removeToast(id: number) {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  }

  // Specific toast types
  function achievementUnlocked(title: string, description: string) {
    addToast({
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: `${title} - ${description}`,
      icon: 'bi-trophy-fill'
    });
  }

  function levelUp(newLevel: number, rewards: { chips: number; multiplier: number }) {
    addToast({
      type: 'level-up',
      title: 'Level Up!',
      message: `You've reached level ${newLevel}! Rewards: $${rewards.chips} chips`,
      icon: 'bi-stars'
    });
  }

  return {
    toasts,
    addToast,
    removeToast,
    achievementUnlocked,
    levelUp
  };
});
