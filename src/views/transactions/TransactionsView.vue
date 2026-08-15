<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useTransactionStore } from '@/stores/transactionStore';
import type { TransactionQuery } from '@/types/TransactionFilters';
import BaseLayout from '@/components/layout/BaseLayout.vue';
import BasePagination from '@/components/layout/BasePagination.vue';
import TransactionItem from '@/components/TransactionItem.vue';

const transactionStore = useTransactionStore();

type GameFilter = TransactionQuery['game'];
type TypeFilter = TransactionQuery['type'];

const gameOptions = ['all', 'blackjack', 'roulette', 'clicker', 'general'] as const;
const typeOptions = ['all', 'win', 'loss', 'push'] as const;

const selectedGame = ref<GameFilter>('all');
const selectedType = ref<TypeFilter>('all');
const pageSize = ref(10);
const currentPage = ref(1);
const { t } = useI18n();

const paginatedTransactions = computed(() => transactionStore.transactions);
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

    
    <div class="card">
      <div class="card-body">
        
        <div class="row gy-3 pb-3 mb-4 border-bottom align-items-center">
          <div class="col-12 col-md-auto filter-scroll">
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
          <div class="col-12 col-md-auto ms-md-3 filter-scroll">
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

            
            <div class="text-center text-muted mt-2">
              {{ t('transactions.pagination.summary', {
                from: transactionStore.totalCount === 0 ? 0 : ((currentPage - 1) * pageSize) + 1,
                to: Math.min(currentPage * pageSize, transactionStore.totalCount),
                total: transactionStore.totalCount
              }) }}
            </div>

            
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

/* The game/type filter button-groups don't wrap; on narrow viewports they
   can run wider than the column, which would otherwise push the whole page
   into horizontal scroll. Let the row itself scroll instead. */
.filter-scroll {
  overflow-x: auto;
  max-width: 100%;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.filter-scroll::-webkit-scrollbar {
  display: none;
}

.filter-scroll .btn-group {
  flex-wrap: nowrap;
}
</style>
