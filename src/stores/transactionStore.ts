import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Transaction } from '@/types/Transaction';
import {
  clearTransactionsDb,
  getAllTransactions,
  getLatestTransactions,
  getTransactionCount,
  getTransactionSummary,
  getTransactionsPage,
  putTransaction,
  replaceAllTransactions
} from '@/utils/transactionDb';
import { STARTING_CHIPS } from '@/stores/userStore';
import { formatIntAsCurrency } from '@/utils/numberFormatUtil';
import { useUserStore } from '@/stores/userStore';

const LATEST_TRANSACTIONS_LIMIT = 6;

type TransactionFilters = {
  game: Transaction['game'] | 'all';
  type: Transaction['type'] | 'all';
};

type TransactionSummary = {
  total: number;
  totalWins: number;
  totalLosses: number;
  totalPushes: number;
  netAmount: number;
};

type TransactionQuery = TransactionFilters & {
  page: number;
  pageSize: number;
};

export type BalanceAudit = {
  expectedBalance: number;
  actualBalance: number;
  delta: number;
  transactionCount: number;
};

export const useTransactionStore = defineStore('transactions', () => {
  const userStore = useUserStore();
  const transactions = ref<Transaction[]>([]);
  const latestTransactions = ref<Transaction[]>([]);
  const totalCount = ref(0);
  const stats = ref<TransactionSummary>({
    total: 0,
    totalWins: 0,
    totalLosses: 0,
    totalPushes: 0,
    netAmount: 0
  });
  const isListLoading = ref(true);
  const listError = ref<string | null>(null);
  const hasIndexedDb = typeof indexedDB !== 'undefined';
  let dbReadyPromise: Promise<void> | null = null;
  const latestLimit = ref(LATEST_TRANSACTIONS_LIMIT);
  const lastQuery = ref<TransactionQuery | null>(null);

  const ensureOpeningBalance = async () => {
    if (!hasIndexedDb) return;
    const count = await getTransactionCount();
    if (count > 0) return;

    const opening: Transaction = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      amount: STARTING_CHIPS,
      type: 'income',
      game: 'general',
      detailsKey: 'transactions.details.general.openingBalance',
      detailsParams: {
        amount: formatIntAsCurrency(STARTING_CHIPS)
      }
    };

    await putTransaction(opening);
  };

  const ensureDbReady = async () => {
    if (!hasIndexedDb) return;
    if (!dbReadyPromise) {
      dbReadyPromise = (async () => {
        await ensureOpeningBalance();
      })();
    }
    await dbReadyPromise;
  };

  const loadLatestTransactions = async (limit = latestLimit.value) => {
    if (!hasIndexedDb) return;
    await ensureDbReady();
    latestLimit.value = limit;
    latestTransactions.value = await getLatestTransactions(limit);
  };

  const loadTransactionsPage = async (query: TransactionQuery) => {
    if (!hasIndexedDb) return;
    await ensureDbReady();
    isListLoading.value = true;
    listError.value = null;
    lastQuery.value = query;

    try {
      const offset = Math.max(0, (query.page - 1) * query.pageSize);
      const filters = { game: query.game, type: query.type };
      const [pageItems, summary] = await Promise.all([
        getTransactionsPage(filters, offset, query.pageSize),
        getTransactionSummary(filters)
      ]);

      transactions.value = pageItems;
      stats.value = summary;
      totalCount.value = summary.total;
    } catch (error) {
      console.error('Failed to load transactions from IndexedDB:', error);
      listError.value = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      isListLoading.value = false;
    }
  };

  void loadLatestTransactions();

  async function addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>) {
    const next = {
      ...transaction,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    userStore.updateChips(next.amount);

    if (!hasIndexedDb) return;
    await ensureDbReady();
    await putTransaction(next);

    latestTransactions.value.unshift(next);
    if (latestTransactions.value.length > latestLimit.value) {
      latestTransactions.value = latestTransactions.value.slice(0, latestLimit.value);
    }

    if (lastQuery.value) {
      const { game, type, page } = lastQuery.value;
      const matchesGame = game === 'all' || game === next.game;
      const matchesType = type === 'all' || type === next.type;
      if (matchesGame && matchesType) {
        totalCount.value += 1;
        stats.value = {
          ...stats.value,
          total: stats.value.total + 1,
          totalWins: stats.value.totalWins + (next.type === 'win' ? 1 : 0),
          totalLosses: stats.value.totalLosses + (next.type === 'loss' ? 1 : 0),
          totalPushes: stats.value.totalPushes + (next.type === 'push' ? 1 : 0),
          netAmount: stats.value.netAmount + next.amount
        };

        if (page === 1) {
          transactions.value.unshift(next);
        }
      }
    }
  }

  async function replaceTransactions(next: Transaction[]) {
    if (!hasIndexedDb) return;
    await ensureDbReady();
    await replaceAllTransactions(next);
    await loadLatestTransactions();
    if (lastQuery.value) {
      await loadTransactionsPage(lastQuery.value);
    }
  }

  async function clearTransactions() {
    transactions.value = [];
    latestTransactions.value = [];
    totalCount.value = 0;
    stats.value = {
      total: 0,
      totalWins: 0,
      totalLosses: 0,
      totalPushes: 0,
      netAmount: 0
    };
    if (!hasIndexedDb) return;
    await clearTransactionsDb();
    await ensureOpeningBalance();
  }

  const getAllSavedTransactions = async () => {
    if (!hasIndexedDb) return [];
    await ensureDbReady();
    return getAllTransactions();
  };

  const auditBalance = async (baseBalance: number, actualBalance: number): Promise<BalanceAudit> => {
    if (!hasIndexedDb) {
      return {
        expectedBalance: baseBalance,
        actualBalance,
        delta: actualBalance - baseBalance,
        transactionCount: 0
      };
    }
    await ensureDbReady();
    const summary = await getTransactionSummary({ game: 'all', type: 'all' });
    const expectedBalance = baseBalance + summary.netAmount;
    return {
      expectedBalance,
      actualBalance,
      delta: actualBalance - expectedBalance,
      transactionCount: summary.total
    };
  };

  return {
    transactions,
    latestTransactions,
    totalCount,
    stats,
    isListLoading,
    listError,
    loadLatestTransactions,
    loadTransactionsPage,
    addTransaction,
    replaceTransactions,
    getAllSavedTransactions,
    auditBalance,
    clearTransactions
  };
});

export type TransactionStore = ReturnType<typeof useTransactionStore>;
