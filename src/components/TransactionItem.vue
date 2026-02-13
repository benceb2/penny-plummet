<script setup lang="ts">
import type { Transaction } from '@/types/Transaction';
import { formatIntAsCurrency } from '@/utils/numberFormatUtil';
import { useI18n } from 'vue-i18n';

interface Props {
  transaction: Transaction;
  compact?: boolean;
  showDetails?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  compact: false,
  showDetails: true
});

import type { Locale } from 'date-fns';
import { formatDistanceToNow, format } from 'date-fns';
import { enGB, hu } from 'date-fns/locale';

const { locale, t } = useI18n();

const dateLocaleMap: Record<string, Locale> = {
  'en-GB': enGB,
  'hu-HU': hu
};

function getDateLocale() {
  return dateLocaleMap[locale.value] ?? enGB;
}

function formatDate(timestamp: number): string {
  const dateLocale = getDateLocale();
  if (props.compact) {
    return formatDistanceToNow(timestamp, { addSuffix: true, locale: dateLocale });
  } else {
    return format(timestamp, 'EEE, MMM d, h:mm a', { locale: dateLocale });
  }
}

function getTypeLabel(type: Transaction['type']): string {
  return t(`transactions.badges.type.${type}`);
}

function getGameLabel(game: Transaction['game']): string {
  return t(`transactions.badges.game.${game}`);
}

function getDetails(): string | undefined {
  if (props.transaction.detailsKey) {
    return t(props.transaction.detailsKey, props.transaction.detailsParams ?? {});
  }
  return props.transaction.details;
}
</script>

<template>
  <div
    class="transaction-item border-bottom p-3">
    <div class="d-flex align-items-start justify-content-between">
      
      <div class="flex-grow-1 me-3">
        <div class="d-flex align-items-center mb-1">
          <span
            class="badge me-2"
            :class="{
              'bg-success': ['win', 'income'].includes(transaction.type),
              'bg-danger': ['loss', 'purchase'].includes(transaction.type),
              'bg-secondary': transaction.type === 'push'
            }">
            {{ getTypeLabel(transaction.type) }}
          </span>
          <span class="badge bg-primary me-2">
            {{ getGameLabel(transaction.game) }}
          </span>
          <small class="text-muted">{{ formatDate(transaction.timestamp) }}</small>
        </div>

        <div
          v-if="showDetails && getDetails()"
          class="text-muted small">
          {{ getDetails() }}
        </div>
      </div>

      
      <div class="text-end">
        <span
          class="fs-5"
          :class="{
            'text-success': ['win', 'income'].includes(transaction.type),
            'text-danger': ['loss', 'purchase'].includes(transaction.type),
            'text-muted': transaction.type === 'push'
          }">
          {{ ['win', 'income'].includes(transaction.type) ? '+' : '' }}{{ formatIntAsCurrency(transaction.amount) }}
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
