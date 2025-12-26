<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTransactionStore } from '@/stores/transactionStore';
import type { Transaction } from '@/types/Transaction';
import { formatIntAsCurrency } from '@/utils/numberFormatUtil';
import BaseLayout from '@/components/layout/BaseLayout.vue';
import BasePagination from '@/components/layout/BasePagination.vue';
import TransactionItem from '@/components/TransactionItem.vue';
const transactionStore = useTransactionStore();

type GameFilter = Transaction['game'] | 'all';
type TypeFilter = Transaction['type'] | 'all';

const gameOptions = ['all', 'blackjack', 'roulette', 'clicker', 'general'] as const;
const typeOptions = ['all', 'win', 'loss', 'push'] as const;

const selectedGame = ref<GameFilter>('all');
const selectedType = ref<TypeFilter>('all');
const pageSize = ref(10);
const currentPage = ref(1);
const { t } = useI18n();

const paginatedTransactions = computed(() => transactionStore.transactions);
const stats = computed(() => transactionStore.stats);
const isInitialLoading = computed(() => transactionStore.isListLoading && paginatedTransactions.value.length === 0);
const totalPages = computed(() => {
  const total = transactionStore.totalCount;
  return total === 0 ? 1 : Math.ceil(total / pageSize.value);
});

const loadPage = async () => {
  await transactionStore.loadTransactionsPage({
    game: selectedGame.value,
    type: selectedType.value,
    page: currentPage.value,
    pageSize: pageSize.value
  });
};

watch([selectedGame, selectedType, pageSize, currentPage], async ([game, type, size, page], [prevGame, prevType, prevSize]) => {
  const filtersChanged = game !== prevGame || type !== prevType || size !== prevSize;
  if (filtersChanged && page !== 1) {
    currentPage.value = 1;
    return;
  }
  await loadPage();
}, { immediate: true });

const goToPage = (page: number) => {
  currentPage.value = page;
};
</script>

<template>
  <BaseLayout
    :title="t('transactions.title')"
    bootstrapIcon="clock-history">

    <!-- Stats Summary Card -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-4">
          <div class="col-md-3">
            <div class="text-center p-3 rounded-3 hover-lift">
              <div class="mb-2">
                <i class="bi bi-graph-up text-success fs-1" aria-hidden="true"></i>
              </div>
              <h2 class="text-muted section-title">{{ t('transactions.stats.netAmount') }}</h2>
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
                <i class="bi bi-trophy text-success fs-1" aria-hidden="true"></i>
              </div>
              <h2 class="text-muted section-title">{{ t('transactions.stats.wins') }}</h2>
              <p class="fs-4 fw-bold mb-0">{{ stats.totalWins }}</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="text-center p-3 rounded-3 hover-lift">
              <div class="mb-2">
                <i class="bi bi-x-circle text-danger fs-1" aria-hidden="true"></i>
              </div>
              <h2 class="text-muted section-title">{{ t('transactions.stats.losses') }}</h2>
              <p class="fs-4 fw-bold mb-0">{{ stats.totalLosses }}</p>
            </div>
          </div>
          <div class="col-md-3">
            <div class="text-center p-3 rounded-3 hover-lift">
              <div class="mb-2">
                <i class="bi bi-arrow-repeat text-info fs-1" aria-hidden="true"></i>
              </div>
              <h2 class="text-muted section-title">{{ t('transactions.stats.pushes') }}</h2>
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
                v-for="game in gameOptions"
                :key="game"
                class="btn"
                :class="selectedGame === game ? 'btn-primary' : 'btn-outline-primary'"
                @click="selectedGame = game">
                {{ t(`transactions.filters.game.${game}`) }}
              </button>
            </div>
          </div>
          <div class="col-12 col-md-auto ms-md-3">
            <div class="btn-group">
              <button
                v-for="type in typeOptions"
                :key="type"
                class="btn"
                :class="selectedType === type ? 'btn-primary' : 'btn-outline-primary'"
                @click="selectedType = type">
                {{ t(`transactions.filters.type.${type}`) }}
              </button>
            </div>
          </div>
        </div>

        <!-- Transaction List -->
        <div class="transaction-list">
          <div
            v-if="isInitialLoading"
            class="d-flex flex-column align-items-center py-4 text-muted">
            <div class="spinner-border mb-2" role="status" aria-hidden="true"></div>
            <span>{{ t('transactions.loading') }}</span>
          </div>

          <template v-else>
            <TransactionItem
              v-for="transaction in paginatedTransactions"
              :key="transaction.id"
              :transaction="transaction" />

            <div v-if="paginatedTransactions.length === 0" class="text-center py-4 text-muted">
              {{ t('transactions.empty') }}
            </div>

            <!-- Page Info -->
            <div class="text-center text-muted mt-2">
              {{ t('transactions.pagination.summary', {
                from: transactionStore.totalCount === 0 ? 0 : ((currentPage - 1) * pageSize) + 1,
                to: Math.min(currentPage * pageSize, transactionStore.totalCount),
                total: transactionStore.totalCount
              }) }}
            </div>

            <!-- Pagination -->
            <BasePagination
              v-if="totalPages > 1"
              :current-page="currentPage"
              :total-pages="totalPages"
              @page-change="goToPage" />
          </template>
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
