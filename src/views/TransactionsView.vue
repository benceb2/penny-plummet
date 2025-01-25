<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { formatIntAsCurrency } from '@/utils/currencyUtil';
import BaseLayout from '@/components/layout/BaseLayout.vue';
import BasePagination from '@/components/layout/BasePagination.vue';
import { usePagination } from '@/composables/usePagination';
import { createGameSerializer } from '@/utils/gameSaveSerializer';

const transactionStore = useTransactionStore();
const selectedGame = ref('all');
const selectedType = ref('all');
const isDev = import.meta.env.DEV;
const isRunningTest = ref(false);
const testResults = ref<any[]>([]);
const pageSize = ref(10);

const filteredTransactions = computed(() => {
  let transactions = transactionStore.transactions;

  if (selectedGame.value !== 'all') {
    transactions = transactions.filter(t => t.game === selectedGame.value);
  }

  if (selectedType.value !== 'all') {
    transactions = transactions.filter(t => t.type === selectedType.value);
  }

  return transactions;
});


const {
  currentPage,
  paginatedItems: paginatedTransactions,
  totalPages,
  goToPage
} = usePagination(filteredTransactions, {
  itemsPerPage: pageSize.value
});


const stats = computed(() => {
  const filtered = filteredTransactions.value;
  return {
    totalWins: filtered.filter(t => t.type === 'win').length,
    totalLosses: filtered.filter(t => t.type === 'loss').length,
    totalPushes: filtered.filter(t => t.type === 'push').length,
    netAmount: filtered.reduce((sum, t) => sum + t.amount, 0)
  };
});

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Dev-only storage testing functionality
let runStorageTest: () => Promise<void>;
if (isDev) {
  const testStorageLimits = async (
    incrementSize: number = 1000,
    maxTestSize: number = 15000
  ) => {
    const metrics: any[] = [];
    const serializer = createGameSerializer();

    const gameTypes = ['blackjack', 'roulette', 'clicker'] as const;
    const transactionTypes = ['win', 'loss', 'push'] as const;

    try {
      for (let size = incrementSize; size <= maxTestSize; size += incrementSize) {
        const transactions = Array.from({ length: size }, (_, i) => ({
          id: crypto.randomUUID(),
          timestamp: Date.now() - (i * 60000),
          amount: Math.floor(Math.random() * 1000000) / 100,
          type: transactionTypes[i % transactionTypes.length],
          game: gameTypes[i % gameTypes.length],
          details: `Test transaction ${i}`
        }));

        const state = { transactions: { value: transactions } };

        const serializeStart = performance.now();
        const serialized = serializer.serialize(state);
        const serializationTime = performance.now() - serializeStart;

        const compressedSize = new Blob([serialized]).size;
        const rawSize = new Blob([JSON.stringify(state)]).size;

        const deserializeStart = performance.now();
        serializer.deserialize(serialized);
        const deserializationTime = performance.now() - deserializeStart;

        metrics.push({
          transactionCount: size,
          rawSizeMB: (rawSize / 1024 / 1024).toFixed(2),
          compressedSizeMB: (compressedSize / 1024 / 1024).toFixed(2),
          compressionRatio: ((compressedSize / rawSize) * 100).toFixed(1),
          serializationTime: serializationTime.toFixed(1),
          deserializationTime: deserializationTime.toFixed(1)
        });

        // Test localStorage
        try {
          localStorage.setItem('test-storage', serialized);
          localStorage.removeItem('test-storage');
        } catch (e: any) {
          console.warn(`localStorage limit reached at ${size} transactions`);
          console.error(e)
          break;
        }

        // Break if processing time gets too high
        if (serializationTime > 1000 || deserializationTime > 1000) {
          console.warn(`Performance threshold exceeded at ${size} transactions`);
          break;
        }

        // Let UI update
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    } catch (error) {
      console.error('Testing stopped due to error:', error);
    }

    return metrics;
  };

  runStorageTest = async () => {
    isRunningTest.value = true;
    testResults.value = [];
    try {
      testResults.value = await testStorageLimits();
    } finally {
      isRunningTest.value = false;
    }
  };
}

watch([selectedGame, selectedType], () => {
  goToPage(1);
});
</script>

<template>
  <BaseLayout
    title="Transaction History"
    icon="clock-history"
    :showBalance="true">

    <!-- Dev Testing Panel -->
    <div v-if="isDev" class="card mb-4">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            <i class="bi bi-gear-fill me-2"></i>
            Development Testing Tools
          </h5>
          <button
            class="btn btn-primary"
            @click="runStorageTest"
            :disabled="isRunningTest">
            <span v-if="isRunningTest" class="spinner-border spinner-border-sm me-2"></span>
            {{ isRunningTest ? 'Running Tests...' : 'Test Storage Limits' }}
          </button>
        </div>

        <!-- Test Results -->
        <div v-if="testResults.length > 0" class="mt-4">
          <div class="table-responsive">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Transactions</th>
                  <th>Raw Size</th>
                  <th>Compressed</th>
                  <th>Ratio</th>
                  <th>Serialize (ms)</th>
                  <th>Deserialize (ms)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="result in testResults" :key="result.transactionCount">
                  <td>{{ result.transactionCount.toLocaleString() }}</td>
                  <td>{{ result.rawSizeMB }} MB</td>
                  <td>{{ result.compressedSizeMB }} MB</td>
                  <td>{{ result.compressionRatio }}%</td>
                  <td>{{ result.serializationTime }}ms</td>
                  <td>{{ result.deserializationTime }}ms</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Summary Card -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-4">
          <div class="col-md-3">
            <div class="text-center p-3 rounded-3 hover-lift">
              <div class="mb-2">
                <i class="bi bi-graph-up text-success fs-1"></i>
              </div>
              <h5 class="text-muted">Net Amount</h5>
              <p
                class="fs-4 fw-bold mb-0"
                :class="{ 'text-success': stats.netAmount > 0, 'text-danger': stats.netAmount < 0 }">
                {{ stats.netAmount > 0 ? '+' : '' }}{{ formatIntAsCurrency(stats.netAmount) }}
              </p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="text-center p-3 rounded-3 hover-lift">
              <div class="mb-2">
                <i class="bi bi-trophy text-success fs-1"></i>
              </div>
              <h5 class="text-muted">Wins</h5>
              <p class="fs-4 fw-bold mb-0">{{ stats.totalWins }}</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="text-center p-3 rounded-3 hover-lift">
              <div class="mb-2">
                <i class="bi bi-x-circle text-danger fs-1"></i>
              </div>
              <h5 class="text-muted">Losses</h5>
              <p class="fs-4 fw-bold mb-0">{{ stats.totalLosses }}</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="text-center p-3 rounded-3 hover-lift">
              <div class="mb-2">
                <i class="bi bi-arrow-repeat text-info fs-1"></i>
              </div>
              <h5 class="text-muted">Pushes</h5>
              <p class="fs-4 fw-bold mb-0">{{ stats.totalPushes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transactions Card -->
    <div class="card">
      <div class="card-body">
        <!-- Filters -->
        <div class="row gy-3 pb-3 mb-4 border-bottom align-items-center">
          <div class="col-12 col-md-auto">
            <div class="btn-group">
              <button
                v-for="game in ['all', 'blackjack', 'roulette', 'clicker']"
                :key="game"
                class="btn"
                :class="selectedGame === game ? 'btn-primary' : 'btn-outline-primary'"
                @click="selectedGame = game">
                {{ game.charAt(0).toUpperCase() + game.slice(1) }}
              </button>
            </div>
          </div>
          <div class="col-12 col-md-auto ms-md-3">
            <div class="btn-group">
              <button
                v-for="type in ['all', 'win', 'loss', 'push']"
                :key="type"
                class="btn"
                :class="selectedType === type ? 'btn-primary' : 'btn-outline-primary'"
                @click="selectedType = type">
                {{ type.charAt(0).toUpperCase() + type.slice(1) }}
              </button>
            </div>
          </div>
        </div>

        <!-- Transaction List -->
        <div class="transaction-list">
          <div
            v-for="transaction in paginatedTransactions"
            :key="transaction.id"
            class="transaction-item p-3 border-bottom">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <span
                  class="badge me-2"
                  :class="{
                    'bg-success': transaction.type === 'win',
                    'bg-danger': transaction.type === 'loss',
                    'bg-secondary': transaction.type === 'push'
                  }">
                  {{ transaction.type.toUpperCase() }}
                </span>
                <span class="badge bg-primary me-2">
                  {{ transaction.game.toUpperCase() }}
                </span>
                <span class="text-muted">{{ formatDate(transaction.timestamp) }}</span>
              </div>
              <div>
                <span
                  :class="{
                    'text-success': transaction.type === 'win',
                    'text-danger': transaction.type === 'loss'
                  }"
                  class="fw-bold">
                  {{ transaction.type === 'win' ? '+' : '' }}{{ formatIntAsCurrency(transaction.amount) }}
                </span>
              </div>
            </div>
            <div class="mt-1 text-muted small">
              {{ transaction.details }}
            </div>
          </div>

          <div v-if="paginatedTransactions.length === 0" class="text-center py-4 text-muted">
            No transactions to display
          </div>

          <!-- Pagination -->
          <BasePagination
            v-if="totalPages > 1"
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-change="goToPage" />

          <!-- Page Info -->
          <div class="text-center text-muted mt-2">
            Showing {{ ((currentPage - 1) * pageSize) + 1 }}
            to {{ Math.min(currentPage * pageSize, filteredTransactions.length) }}
            of {{ filteredTransactions.length }} transactions
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<style scoped>
.transaction-list {
  overflow-y: auto;
}

.transaction-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.hover-lift:hover {
  transform: translateY(-2px);
  transition: transform 0.2s;
}
</style>
