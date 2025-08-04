<script setup lang="ts">
import type { Transaction } from '@/types/Transaction';
import { formatIntAsCurrency } from '@/utils/numberFormatUtil';

interface Props {
  transaction: Transaction;
  compact?: boolean;
  showDetails?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  showDetails: true
});

import { formatDistanceToNow, format } from 'date-fns';

function formatDate(timestamp: number): string {
  if (props.compact) {
    return formatDistanceToNow(timestamp, { addSuffix: true });
  } else {
    return format(timestamp, 'EEE, MMM d, h:mm a');
  }
}
</script>

<template>
  <div
    class="transaction-item border-bottom"
    :class="{ 'py-2': compact, 'p-3': !compact }">

    <div class="d-flex align-items-start justify-content-between">
      <!-- Left side: Game info and details -->
      <div class="flex-grow-1 me-3">
        <div class="d-flex align-items-center mb-1">
          <span
            class="badge me-2"
            :class="{
              'bg-success': ['win', 'income'].includes(transaction.type),
              'bg-danger': ['loss', 'purchase'].includes(transaction.type),
              'bg-secondary': transaction.type === 'push'
            }">
            {{ transaction.type.toUpperCase() }}
          </span>
          <span class="badge bg-primary me-2">
            {{ transaction.game.toUpperCase() }}
          </span>
          <small class="text-muted">{{ formatDate(transaction.timestamp) }}</small>
        </div>

        <div
          v-if="showDetails && transaction.details"
          class="text-muted small">
          {{ transaction.details }}
        </div>
      </div>

      <!-- Right side: Amount -->
      <div class="text-end">
        <span
          class="fs-5 fw-bold"
          :class="{
            'text-success': transaction.type === 'win',
            'text-danger': transaction.type === 'loss',
            'text-muted': transaction.type === 'push'
          }">
          {{ transaction.type === 'win' ? '+' : '' }}{{ formatIntAsCurrency(transaction.amount) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.transaction-item {
  transition: background-color 0.15s ease;
}

.transaction-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.transaction-item:last-child {
  border-bottom: none;
}
</style>
