<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useTransactionStore } from '@/stores/transactionStore';
import { formatIntAsCurrency } from '@/utils/numberFormatUtil';
import BaseLayout from '@/components/layout/BaseLayout.vue';
import BasePagination from '@/components/layout/BasePagination.vue';
import TransactionItem from '@/components/TransactionItem.vue';

import { usePagination } from '@/composables/usePagination';
const transactionStore = useTransactionStore();
const selectedGame = ref('all');
const selectedType = ref('all');
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

watch([selectedGame, selectedType], () => {
  goToPage(1);
});
</script>

<template>
  <BaseLayout
    title="Transaction History"
    bootstrapIcon="clock-history">

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
          <TransactionItem
            v-for="transaction in paginatedTransactions"
            :key="transaction.id"
            :transaction="transaction" />

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
