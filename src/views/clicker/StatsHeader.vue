<script setup lang="ts">
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
  gap: .25rem .75rem;
  padding: .6rem .9rem;
  border-radius: var(--pp-radius);
  background: var(--pp-surface);
  border: 1px solid var(--pp-line);
}

.stat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 44px;
  min-width: 0;
}

.stat-value {
  color: var(--pp-cream);
  font-weight: 700;
  font-size: .95rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-primary .stat-value {
  font-family: var(--pp-font-display);
  color: var(--pp-gold);
  font-size: 1.4rem;
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
