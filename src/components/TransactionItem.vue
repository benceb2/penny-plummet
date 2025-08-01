<script setup lang="ts">
import type { Transaction } from '@/types/Transaction';
import { formatIntAsCurrency } from '@/utils/numberFormatUtil';

interface Props {
  transaction: Transaction;
  compact?: boolean; // For home view vs full transactions page
  showDetails?: boolean; // Whether to show the details line
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  showDetails: true
});

function formatDate(timestamp: number): string {
  if (props.compact) {
    // Shorter format for home view
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } else {
    // Full format for transactions page
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
</script>

<template>
  <div
    class="transaction-item"
    :class="{
      'p-3 border-bottom': !compact,
      'py-2 border-bottom': compact
    }">
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
        <small class="text-muted">{{ formatDate(transaction.timestamp) }}</small>
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
    <div
      v-if="showDetails && transaction.details"
      class="mt-1 text-muted small">
      {{ transaction.details }}
    </div>
  </div>
</template>

<style scoped>
.transaction-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}
</style>
