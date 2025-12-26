import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAchievementStore } from '../achievementStore';
import { achievements as achievementsRef } from '@/utils/achievementUitl';

const userStoreMock = {};

const toastStoreMock = {
  levelUp: vi.fn(),
  achievementUnlocked: vi.fn(),
  addToast: vi.fn()
};

const transactionStoreMock = {
  addTransaction: vi.fn()
};

vi.mock('@/stores/userStore', () => ({
  useUserStore: () => userStoreMock
}));

vi.mock('@/stores/toastStore', () => ({
  useToastStore: () => toastStoreMock
}));

vi.mock('@/stores/transactionStore', () => ({
  useTransactionStore: () => transactionStoreMock
}));

vi.mock('@/i18n', () => ({
  default: {
    global: {
      t: (key: string) => key
    }
  }
}));

describe('Achievement Store', () => {
  const originalAchievements = JSON.parse(JSON.stringify(achievementsRef.value));

  beforeEach(() => {
    setActivePinia(createPinia());
    achievementsRef.value = JSON.parse(JSON.stringify(originalAchievements));
    toastStoreMock.levelUp.mockClear();
    toastStoreMock.achievementUnlocked.mockClear();
    toastStoreMock.addToast.mockClear();
    transactionStoreMock.addTransaction.mockClear();
  });

  it('logs a transaction for level up rewards', () => {
    const store = useAchievementStore();

    store.currentLevel.currentXP = store.currentLevel.requiredXP - 1;
    store.addXP(2);

    expect(transactionStoreMock.addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 120,
        type: 'income',
        game: 'general',
        detailsKey: 'transactions.details.general.levelUp',
        detailsParams: {
          level: 2,
          amount: '$120'
        }
      })
    );
  });

  it('logs a transaction when claiming achievement rewards', () => {
    const store = useAchievementStore();

    store.updateAchievementProgress('first_hand', 1);
    store.claimAchievement('first_hand');

    expect(transactionStoreMock.addTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 10,
        type: 'income',
        game: 'general',
        detailsKey: 'transactions.details.general.achievementReward',
        detailsParams: {
          title: 'achievements.blackjack.first_hand.title',
          amount: '$10'
        }
      })
    );
  });
});
