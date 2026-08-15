<script setup lang="ts">
/**
 * Compact stats band that sits at the top of ClickerView's felt, above the
 * coin (mirrors roulette's on-felt history strip rather than a separate
 * surface card).
 */
import { useI18n } from 'vue-i18n'
import { useClickerStore } from '@/stores/clickerStore'

const clickerStore = useClickerStore()
const { t } = useI18n()
</script>

<template>
  <div class="stats-strip">
    <div class="stat stat-primary">
      <span class="stat-value">{{ clickerStore.formattedClicks }}</span>
      <span class="stat-label">{{ t('clicker.stats.availableToCollect') }}</span>
    </div>
    <div class="stat">
      <span class="stat-value">{{ clickerStore.formattedIncome }}{{ t('clicker.stats.perSecondSuffix') }}</span>
      <span class="stat-label">{{ t('clicker.stats.income') }}</span>
    </div>
    <div class="stat">
      <span class="stat-value">{{ clickerStore.formattedManualLifetimeClicks }}</span>
      <span class="stat-label">{{ t('clicker.stats.manualLifetimeClicks') }}</span>
    </div>
    <div class="stat">
      <span class="stat-value">{{ clickerStore.formattedPassiveLifetimeClicks }}</span>
      <span class="stat-label">{{ t('clicker.stats.passiveEarnings') }}</span>
    </div>
  </div>
</template>

<style scoped>
.stats-strip {
  flex: 0 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: .2rem .75rem;
  padding: .5rem .75rem;
  border-radius: 10px;
  background: rgba(0, 0, 0, .28);
  border: 1px solid rgba(225, 178, 90, .16);
}

.stat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 36px;
  min-width: 0;
}

.stat-value {
  color: var(--pp-cream);
  font-weight: 700;
  font-size: .85rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-primary .stat-value {
  font-family: var(--pp-font-display);
  color: var(--pp-gold);
  font-size: 1.2rem;
}

.stat-label {
  color: var(--pp-cream-dim);
  font-size: .68rem;
  letter-spacing: .02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (min-width: 576px) {
  .stats-strip {
    grid-template-columns: repeat(4, auto);
    justify-content: space-between;
    gap: 1rem;
  }
}
</style>
