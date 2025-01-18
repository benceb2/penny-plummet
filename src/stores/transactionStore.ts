import { ref } from 'vue';
import { defineStore } from 'pinia';
import { calculateStorageKey, createGameSerializer } from '@/utils/gameSaveSerializer';
import type { Transaction } from '@/types/Transaction';

const MAX_TRANSACTIONS = 10000 // Keep only the last 10,000 transactions to prevent storage bloat

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([]);

  function addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>) {
    transactions.value.unshift({
      ...transaction,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    });

    if (transactions.value.length > MAX_TRANSACTIONS) {
      transactions.value = transactions.value.slice(0, MAX_TRANSACTIONS);
    }
  }

  function clearTransactions() {
    transactions.value = [];
  }

  return {
    transactions,
    addTransaction,
    clearTransactions
  };
}, {
  persist: {
    key: calculateStorageKey("transaction-store"),
    serializer: createGameSerializer()
  }
} as any);
