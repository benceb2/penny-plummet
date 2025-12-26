import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

const updateChipsMock = vi.fn();

vi.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    updateChips: updateChipsMock
  })
}));

vi.mock('@/utils/transactionDb', () => ({
  clearTransactionsDb: vi.fn(),
  getAllTransactions: vi.fn(),
  getLatestTransactions: vi.fn(),
  getTransactionCount: vi.fn(),
  getTransactionSummary: vi.fn(),
  getTransactionsPage: vi.fn(),
  putTransaction: vi.fn(),
  replaceAllTransactions: vi.fn()
}));

describe('Transaction Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    updateChipsMock.mockClear();
  });

  it('updates chips when adding a transaction even without IndexedDB', async () => {
    const { useTransactionStore } = await import('../transactionStore');
    const store = useTransactionStore();

    await store.addTransaction({
      amount: 25,
      type: 'income',
      game: 'general',
      detailsKey: 'transactions.details.general.openingBalance'
    });

    expect(updateChipsMock).toHaveBeenCalledWith(25);
  });
});
