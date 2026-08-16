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
    class="transaction-item border-bottom"
    :class="compact ? 'transaction-item--compact' : 'p-3'">
    <div class="d-flex align-items-start justify-content-between">
      
      <div class="flex-grow-1 me-3">
        <div class="d-flex align-items-center mb-1">
          <span class="transaction-pill me-2">
            {{ getTypeLabel(transaction.type) }}
          </span>
          <span class="transaction-pill me-2">
            {{ getGameLabel(transaction.game) }}
          </span>
          <small class="text-body-secondary">{{ formatDate(transaction.timestamp) }}</small>
        </div>

        <div
          v-if="showDetails && getDetails()"
          class="text-body-secondary small">
          {{ getDetails() }}
        </div>
      </div>


      <div class="text-end">
        <span
          class="fs-5"
          :class="{
            'text-win': ['win', 'income'].includes(transaction.type),
            'text-loss': ['loss', 'purchase'].includes(transaction.type),
            'text-body-secondary': transaction.type === 'push'
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

@media (hover: hover) {
  .transaction-item:hover {
    background-color: rgba(255, 255, 255, .03);
  }
}

.transaction-item:last-child {
  border-bottom: none;
}

/* Tighter rows for embedded lists such as the lobby's "Recent" card. Kept
   as a scoped rule rather than a Bootstrap spacing utility so a parent can
   still adjust it (utilities are !important and would win). */
.transaction-item--compact {
  padding: .6rem 0;
}

.transaction-pill {
  display: inline-flex;
  align-items: center;
  padding: .15rem .5rem;
  border-radius: 999px;
  background: var(--pp-surface-2);
  color: var(--pp-cream-dim);
  font-size: .75rem;
  font-weight: 600;
}

.text-win {
  color: var(--pp-win);
}

.text-loss {
  color: var(--pp-loss);
}
</style>
