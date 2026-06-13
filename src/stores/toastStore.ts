import { defineStore } from 'pinia';
import { ref } from 'vue';
import i18n from '@/i18n';
import { formatIntAsCurrency } from '@/utils/numberFormatUtil';

export interface ToastAction {
  label: string;
  handler: () => void;
}

export interface Toast {
  id: number;
  type: 'achievement' | 'level-up' | 'success' | 'error';
  title: string;
  message: string;
  icon?: string;
  action?: ToastAction;
  persist?: boolean;
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);
  let nextId = 0;

  function addToast(toast: Omit<Toast, 'id'>) {
    const id = nextId++;
    toasts.value.push({ ...toast, id });

    if (!toast.persist) {
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    }
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
      title: i18n.global.t('toast.achievementUnlocked.title'),
      message: i18n.global.t('toast.achievementUnlocked.message', { title, description }),
      icon: 'bi-trophy-fill'
    });
  }

  function levelUp(newLevel: number, rewards: { chips: number; multiplier: number }) {
    addToast({
      type: 'level-up',
      title: i18n.global.t('toast.levelUp.title'),
      message: i18n.global.t('toast.levelUp.message', {
        level: newLevel,
        chips: formatIntAsCurrency(rewards.chips)
      }),
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
