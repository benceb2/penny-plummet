<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onBeforeUnmount, onMounted } from 'vue'
import { useClickerStore } from '@/stores/clickerStore'
import StatsHeader from '@/views/clicker/StatsHeader.vue'
import ClickArea from '@/views/clicker/ClickArea.vue'
import UpgradesPanel from '@/views/clicker/UpgradesPanel.vue'

const { t } = useI18n()
const clickerStore = useClickerStore()

onMounted(() => {
  clickerStore.setClickerActive(true)
})

onBeforeUnmount(() => {
  clickerStore.setClickerActive(false)
})
</script>

<template>
  <div class="clicker-view d-flex flex-column flex-grow-1">
    <h1 class="visually-hidden">{{ t('clicker.title') }}</h1>

    <StatsHeader />

    <div class="clicker-body d-flex flex-grow-1">
      <ClickArea />
      <UpgradesPanel />
    </div>

    <div class="clicker-tray">
      <button
        type="button"
        class="btn btn-primary tray-btn tray-collect"
        :disabled="clickerStore.clicks < 10"
        @click="clickerStore.collectChips()">
        {{ t('clicker.collect.button') }}
        <span class="tray-collect-amount">&middot; {{ clickerStore.formattedClicks }}</span>
        <span class="visually-hidden">{{ t('clicker.collect.minimum') }}</span>
      </button>
      <button
        type="button"
        class="btn btn-outline-light tray-btn tray-upgrades d-lg-none"
        data-bs-toggle="offcanvas"
        data-bs-target="#clickerUpgrades"
        aria-controls="clickerUpgrades">
        <i class="bi bi-arrow-up-circle" aria-hidden="true"></i>
        {{ t('clicker.upgrades.title') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.clicker-view {
  min-height: 0;
  padding: .75rem 1rem 1rem;
  gap: .75rem;
}

.clicker-body {
  min-height: 0;
  gap: .75rem;
}

.clicker-tray {
  flex: 0 0 auto;
  display: flex;
  gap: .75rem;
  padding: .75rem;
  border-radius: var(--pp-radius);
  background: var(--pp-surface);
  border: 1px solid var(--pp-line);
}

.tray-btn {
  min-height: 52px;
  font-size: .85rem;
  font-weight: 800;
  letter-spacing: .05em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  touch-action: manipulation;
  transition: transform .1s ease;
}

@media (min-width: 400px) {
  .tray-btn {
    font-size: 1rem;
    letter-spacing: .08em;
  }
}

.tray-btn:active:not(:disabled) {
  transform: scale(.97);
}

.tray-collect {
  flex: 1 1 auto;
}

.tray-collect-amount {
  opacity: .82;
  font-weight: 700;
  margin-left: .25rem;
}

.tray-upgrades {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: .4rem;
}
</style>
