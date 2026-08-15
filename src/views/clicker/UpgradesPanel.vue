<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/userStore'
import { useClickerStore } from '@/stores/clickerStore'

const userStore = useUserStore()
const clickerStore = useClickerStore()
const { t } = useI18n()
</script>

<template>
  <div
    id="clickerUpgrades"
    class="offcanvas-bottom offcanvas-lg upgrades-panel"
    tabindex="-1"
    aria-labelledby="clickerUpgradesLabel">
    <div class="offcanvas-header">
      <h2 id="clickerUpgradesLabel" class="offcanvas-title section-title">{{ t('clicker.upgrades.title') }}</h2>
      <button
        type="button"
        class="btn-close"
        data-bs-dismiss="offcanvas"
        :aria-label="t('clicker.upgrades.close')"></button>
    </div>
    <div class="offcanvas-body">
      <div class="upgrades-surface">
        <h2 class="upgrades-heading d-none d-lg-block section-title">{{ t('clicker.upgrades.title') }}</h2>

        <div class="upgrade-row">
          <div class="upgrade-info">
            <div class="upgrade-name">
              <i class="bi bi-lightning-charge-fill" aria-hidden="true"></i>
              {{ t('clicker.upgrades.autoClickers.title') }}
            </div>
            <div class="upgrade-meta">
              {{ t('clicker.upgrades.autoClickers.owned') }}: {{ clickerStore.autoClickersCount }}
              &middot; +{{ clickerStore.formattedClickValue }}{{ t('clicker.upgrades.autoClickers.perSecond') }}
            </div>
          </div>
          <button
            type="button"
            class="btn btn-outline-primary upgrade-buy-btn"
            @click="clickerStore.buyAutoClicker(userStore)"
            :disabled="userStore.chips < clickerStore.autoClickerCost">
            {{ t('clicker.upgrades.actions.buy', { cost: clickerStore.formattedAutoClickerCost }) }}
          </button>
        </div>

        <div class="upgrade-row">
          <div class="upgrade-info">
            <div class="upgrade-name">
              <i class="bi bi-stars" aria-hidden="true"></i>
              {{ t('clicker.upgrades.multiplier.title') }}
            </div>
            <div class="upgrade-meta">
              {{ t('clicker.upgrades.multiplier.current') }}: {{ clickerStore.multiplierLevel }}x
            </div>
          </div>
          <button
            type="button"
            class="btn btn-outline-primary upgrade-buy-btn"
            @click="clickerStore.buyMultiplier(userStore)"
            :disabled="userStore.chips < clickerStore.multiplierCost">
            {{ t('clicker.upgrades.actions.upgrade', { cost: clickerStore.formattedMultiplierCost }) }}
          </button>
        </div>

        <div class="upgrade-row">
          <div class="upgrade-info">
            <div class="upgrade-name">
              <i class="bi bi-bullseye" aria-hidden="true"></i>
              {{ t('clicker.upgrades.critical.title') }}
            </div>
            <div class="upgrade-meta">
              {{ t('clicker.upgrades.critical.chance', { percent: (clickerStore.criticalChance * 100).toFixed(1) }) }}
              &middot; {{ t('clicker.upgrades.critical.damage') }}
            </div>
          </div>
          <button
            type="button"
            class="btn btn-outline-primary upgrade-buy-btn"
            @click="clickerStore.buyCriticalUpgrade(userStore)"
            :disabled="userStore.chips < clickerStore.criticalCost">
            {{ t('clicker.upgrades.actions.upgrade', { cost: clickerStore.formattedCriticalCost }) }}
          </button>
        </div>

        <div class="upgrade-row" v-if="clickerStore.autoClickersCount > 0">
          <div class="upgrade-info">
            <div class="upgrade-name">
              <i class="bi bi-speedometer2" aria-hidden="true"></i>
              {{ t('clicker.upgrades.speed.title') }}
            </div>
            <div class="upgrade-meta">
              {{ t('clicker.upgrades.speed.interval', { ms: clickerStore.autoClickerSpeed }) }}
            </div>
          </div>
          <button
            type="button"
            class="btn btn-outline-primary upgrade-buy-btn"
            @click="clickerStore.buyAutoClickerSpeed(userStore)"
            :disabled="userStore.chips < clickerStore.autoClickerSpeedCost">
            {{ t('clicker.upgrades.actions.upgrade', { cost: clickerStore.formattedAutoClickerSpeedCost }) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upgrades-panel {
  --bs-offcanvas-height: 70vh;
}

@media (min-width: 992px) {
  .upgrades-panel {
    display: flex;
    flex-direction: column;
    flex: 0 0 300px;
    width: 300px;
  }
}

.upgrades-surface {
  height: 100%;
  padding: 0 0 1rem;
}

.upgrades-heading {
  margin-bottom: .75rem;
}

@media (min-width: 992px) {
  .upgrades-surface {
    padding: 1rem;
    border-radius: var(--pp-radius);
    background: var(--pp-surface);
    border: 1px solid var(--pp-line);
  }
}

.upgrade-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  padding: .85rem 0;
}

.upgrade-row + .upgrade-row {
  border-top: 1px solid var(--pp-line);
}

.upgrade-info {
  min-width: 0;
  flex: 1 1 auto;
}

.upgrade-name {
  color: var(--pp-cream);
  font-weight: 600;
  font-size: .9rem;
}

.upgrade-name i {
  color: var(--pp-gold);
  margin-right: .4rem;
}

.upgrade-meta {
  color: var(--pp-cream-dim);
  font-size: .78rem;
  margin-top: .15rem;
}

.upgrade-buy-btn {
  flex: 0 0 auto;
  min-height: 44px;
  white-space: nowrap;
  font-weight: 700;
}
</style>
