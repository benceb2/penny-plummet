import { describe, expect, it, vi } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import BlackjackView from '../BlackjackView.vue';
import { BlackjackState } from '@/types/BlackjackGameState';

const updateChipsMock = vi.fn();

vi.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    chips: 100,
    stats: {
      handsPlayed: 0,
      totalWinnings: 0,
      biggestWin: 0
    },
    updateChips: updateChipsMock
  })
}));

vi.mock('@/stores/blackjackStore', () => ({
  useBlackjackStore: () => ({
    deck: [],
    playerHand: [],
    dealerHand: [],
    gameState: BlackjackState.GAME_OVER,
    currentBet: 10,
    playerScore: 20,
    dealerScore: 18,
    sessionStats: {
      consecutiveWins: 0,
      maxConsecutiveWins: 0,
      blackjacks: 0,
      perfectPlays: 0
    },
    isBlackjack: false,
    dealCards: vi.fn(),
    hit: vi.fn(),
    stand: vi.fn(),
    reset: vi.fn()
  })
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}));

describe('BlackjackView', () => {
  it('does not award chips on result close (chips already handled in stores)', async () => {
    updateChipsMock.mockClear();

    const wrapper = shallowMount(BlackjackView, {
      global: {
        stubs: {
          BaseLayout: { template: '<div><slot /></div>' },
          BetAmountSelector: true,
          PlayingCard: true,
          GameResult: { name: 'GameResult', template: '<div></div>', emits: ['close'] }
        }
      }
    });

    const gameResult = wrapper.findComponent({ name: 'GameResult' });
    gameResult.vm.$emit('close');

    expect(updateChipsMock).not.toHaveBeenCalled();
  });
});
