<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { onBeforeUnmount, onMounted } from 'vue'
import GameScreen from '@/components/game/GameScreen.vue'
import GameTray from '@/components/game/GameTray.vue'
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
  <GameScreen :title="t('clicker.title')" wide>
    <template #stage>
      <div class="clicker-layout">
        <div class="felt">
          <StatsHeader />
          <ClickArea />
        </div>
        <UpgradesPanel />
      </div>
    </template>

    <template #tray>
      <GameTray>
        <div class="cta-row">
          <button
            type="button"
            class="btn btn-primary cta-btn cta-btn--amount"
            :disabled="clickerStore.clicks < 10"
            @click="clickerStore.collectChips()">
            <span class="visually-hidden">{{ t('clicker.collect.button') }}</span>
            <span aria-hidden="true">{{ t('clicker.collect.tray') }} &middot; {{ clickerStore.formattedClicks }}</span>
            <span class="visually-hidden">{{ t('clicker.collect.minimum') }}</span>
          </button>
          <button
            type="button"
            class="btn btn-outline-light cta-btn d-lg-none"
            data-bs-toggle="offcanvas"
            data-bs-target="#clickerUpgrades"
            aria-controls="clickerUpgrades">
            <i class="bi bi-arrow-up-circle" aria-hidden="true"></i>
            {{ t('clicker.upgrades.title') }}
          </button>
        </div>
      </GameTray>
    </template>
  </GameScreen>
</template>

<style scoped>
.clicker-layout {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

@media (min-width: 992px) {
  .clicker-layout {
    flex-direction: row;
    gap: 1rem;
  }
}

.felt {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: .5rem;
  padding: .625rem .75rem .75rem;
  border-radius: 22px;
  background: radial-gradient(120% 90% at 50% 45%, var(--pp-felt) 0%, var(--pp-felt-deep) 78%, #0A2A1E 100%);
  box-shadow: inset 0 0 0 1px rgba(225, 178, 90, .14), inset 0 0 60px rgba(0, 0, 0, .35);
  touch-action: manipulation;
  user-select: none;
}

.felt::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 22px;
  border: 1px solid rgba(225, 178, 90, .16);
  pointer-events: none;
}

.cta-row {
  display: flex;
  gap: .625rem;
}

.cta-btn {
  flex: 1 1 0;
  height: 54px;
  border-radius: 14px;
  font-weight: 800;
  font-size: .875rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
}

/* "Collect · $x" runs noticeably longer than "Upgrades" once a real amount
   is interpolated in; a smaller size keeps it on one line at phone widths
   instead of wrapping inside the 54px button (mirrors blackjack's Deal). */
.cta-btn--amount {
  font-size: .75rem;
  letter-spacing: .06em;
}
</style>
