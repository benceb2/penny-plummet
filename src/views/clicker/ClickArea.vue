<script setup lang="ts">
/**
 * Coin click area: sits inside ClickerView's felt, below the stats band. It
 * no longer paints its own felt background (the parent .felt does that) so
 * it can be stacked with StatsHeader inside a single felt stage; GameScreen
 * already provides the stage's aria-label region, so this stays unlabelled.
 */
import { useI18n } from 'vue-i18n'
import { useClickerStore } from '@/stores/clickerStore'
import { computed, ref } from 'vue'

const clickerStore = useClickerStore()
const { t } = useI18n()

const buttonScale = computed(() => {
  const baseScale = 1
  const comboEffect = Math.min(clickerStore.comboCount * 0.005, 0.08)
  return baseScale + comboEffect
})

const glowIntensity = computed(() => {
  if (clickerStore.comboCount <= 5) return 0
  if (clickerStore.comboCount <= 15) return 0.3
  if (clickerStore.comboCount <= 30) return 0.6
  return 1
})

const clickScale = ref(1)

const handleClickWithAnimation = () => {
  clickerStore.handleClick()

  // Quick click animation
  clickScale.value = 0.95
  setTimeout(() => {
    clickScale.value = 1
  }, 100)
}
</script>

<template>
  <div class="click-stage">
    <div
      v-if="clickerStore.comboCount > 1"
      class="combo-badge">
      <i class="bi bi-lightning-fill" aria-hidden="true"></i>
      {{ t('clicker.combo.label', { count: clickerStore.comboCount }) }}
      <span class="combo-bonus">
        {{ t('clicker.combo.bonus', { percent: (clickerStore.comboMultiplier * 100 - 100).toFixed(0) }) }}
      </span>
    </div>

    <div class="coin-wrap">
      <button
        type="button"
        class="coin-btn"
        :style="{
          transform: `scale(${buttonScale * clickScale})`,
          '--glow': glowIntensity
        }"
        :aria-label="t('clicker.click.ariaLabel', { value: clickerStore.formattedClickValue })"
        @click="handleClickWithAnimation">
        <i class="bi bi-coin coin-icon" aria-hidden="true"></i>
        <span class="coin-value">+{{ clickerStore.formattedClickValue }}</span>
        <span v-if="clickerStore.criticalChance > 0.1" class="coin-crit">
          {{ t('clicker.combo.critical', { percent: (clickerStore.criticalChance * 100).toFixed(0) }) }}
        </span>
      </button>

      <div class="floating-animations-container" aria-hidden="true">
        <div
          v-for="animation in clickerStore.clickAnimations"
          :key="animation.id"
          class="floating-number"
          :class="{ 'floating-critical': animation.isCritical }"
          :style="{
            left: `${animation.x}px`,
            top: `${animation.y}px`
          }">
          +{{ animation.value.toLocaleString() }}
          <i v-if="animation.isCritical" class="bi bi-exclamation-diamond-fill ms-1" aria-hidden="true"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.click-stage {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow: hidden;
}

.combo-badge {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .3rem .75rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, .35);
  border: 1px solid rgba(225, 178, 90, .5);
  color: var(--pp-gold-bright);
  font-size: .8rem;
  font-weight: 700;
  white-space: nowrap;
}

.combo-bonus {
  opacity: .8;
  font-weight: 600;
}

.coin-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.coin-btn {
  width: clamp(170px, min(46vw, 34vh), 250px);
  height: clamp(170px, min(46vw, 34vh), 250px);
  border-radius: 50%;
  border: 3px solid var(--pp-cream);
  background: linear-gradient(135deg, var(--pp-gold-bright) 0%, var(--pp-gold) 55%, var(--pp-gold-deep) 100%);
  color: #1E1607;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .25rem;
  box-shadow:
    0 12px 32px rgba(0, 0, 0, .45),
    0 0 calc(20px + var(--glow, 0) * 30px) rgba(225, 178, 90, calc(.35 + var(--glow, 0) * .45));
  transition: transform .15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow .2s ease;
  touch-action: manipulation;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  -webkit-user-select: none;
}

.coin-btn:active {
  transform: scale(0.94) !important;
}

@media (hover: hover) {
  .coin-btn:hover {
    box-shadow:
      0 14px 36px rgba(0, 0, 0, .5),
      0 0 calc(28px + var(--glow, 0) * 30px) rgba(225, 178, 90, calc(.45 + var(--glow, 0) * .45));
  }
}

.coin-icon {
  font-size: clamp(2rem, 8vw, 3.25rem);
}

.coin-value {
  font-weight: 800;
  font-size: clamp(1.1rem, 4vw, 1.5rem);
  font-variant-numeric: tabular-nums;
}

.coin-crit {
  font-size: .7rem;
  font-weight: 700;
  opacity: .85;
}

.floating-animations-container {
  position: absolute;
  top: 50%;
  left: 50%;
  pointer-events: none;
}

.floating-number {
  position: absolute;
  transform: translate(-50%, -50%);
  font-weight: 700;
  font-size: 1.3rem;
  color: var(--pp-cream);
  text-shadow: 0 2px 4px rgba(0, 0, 0, .8);
  white-space: nowrap;
  user-select: none;
  animation: floatUp 2s ease-out forwards;
}

.floating-critical {
  color: var(--pp-gold-bright);
  font-size: 1.6rem;
  text-shadow: 0 0 12px rgba(225, 178, 90, .8), 0 2px 4px rgba(0, 0, 0, .8);
  animation-duration: 2.2s;
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(0) scale(1);
  }

  30% {
    opacity: .9;
    transform: translate(-50%, -50%) translateY(-35px) scale(1.05);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -50%) translateY(-100px) scale(0.7);
  }
}

@media (prefers-reduced-motion: reduce) {
  .coin-btn {
    transition: none;
  }

  .floating-number {
    animation: none;
    opacity: 0;
  }
}
</style>
