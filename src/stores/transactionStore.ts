import { ref } from 'vue';
import { defineStore } from 'pinia';
import { calculateStorageKey, createGameSerializer } from '@/utils/gameSaveSerializer';
import type { Transaction } from '@/types/Transaction';

export const useTransactionStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([]);

  function addTransaction(transaction: Omit<Transaction, 'id' | 'timestamp'>) {
    transactions.value.unshift({
      ...transaction,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    });

    // Keep only the last 100 transactions to prevent storage bloat
    if (transactions.value.length > 100) {
      transactions.value = transactions.value.slice(0, 100);
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
