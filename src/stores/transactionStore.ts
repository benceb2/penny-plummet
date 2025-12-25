import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Transaction } from '@/types/Transaction';
import { calculateStorageKey, createGameSerializer } from '@/utils/gameSaveSerializerUtil';
import {
  clearTransactionsDb,
  deleteTransactionsById,
  getLatestTransactions,
  putTransaction,
  replaceAllTransactions
} from '@/utils/transactionDb';

const MAX_TRANSACTIONS = 10000; // Keep only the last 10,000 transactions to prevent storage bloat
const LEGACY_STORAGE_KEY = calculateStorageKey('transaction-store');
const LEGACY_SERIALIZER = createGameSerializer();

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([]);
  const isLoading = ref(true);
  const loadError = ref<string | null>(null);
  let hydratePromise: Promise<void> | null = null;

  const migrateLegacyStorage = async () => {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return;

    try {
      const decoded = LEGACY_SERIALIZER.deserialize(raw) as { transactions?: Transaction[] };
      if (Array.isArray(decoded?.transactions)) {
        await replaceAllTransactions(decoded.transactions.slice(0, MAX_TRANSACTIONS));
      }
    } finally {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  };

  const hydrateFromDb = async () => {
    if (hydratePromise) return hydratePromise;

    hydratePromise = (async () => {
      isLoading.value = true;
      loadError.value = null;

      try {
        await migrateLegacyStorage();
        transactions.value = await getLatestTransactions(MAX_TRANSACTIONS);
      } catch (error) {
        console.error('Failed to load transactions from IndexedDB:', error);
        loadError.value = error instanceof Error ? error.message : 'Unknown error';
      } finally {
        isLoading.value = false;
      }
    })();

    try {
      await hydratePromise;
    } finally {
      hydratePromise = null;
    }
  };

  void hydrateFromDb();

  async function addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>) {
    if (isLoading.value) {
      await hydrateFromDb();
    }
    const next = {
      ...transaction,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    transactions.value.unshift(next);
    await putTransaction(next);

    if (transactions.value.length > MAX_TRANSACTIONS) {
      const removed = transactions.value.slice(MAX_TRANSACTIONS);
      transactions.value = transactions.value.slice(0, MAX_TRANSACTIONS);
      await deleteTransactionsById(removed.map(item => item.id));
    }
  }

  async function replaceTransactions(next: Transaction[]) {
    const trimmed = next.slice(0, MAX_TRANSACTIONS);
    transactions.value = trimmed;
    await replaceAllTransactions(trimmed);
  }

  async function clearTransactions() {
    transactions.value = [];
    await clearTransactionsDb();
  }

  return {
    transactions,
    isLoading,
    loadError,
    hydrateFromDb,
    addTransaction,
    replaceTransactions,
    clearTransactions
  };
});

export type TransactionStore = ReturnType<typeof useTransactionStore>;
