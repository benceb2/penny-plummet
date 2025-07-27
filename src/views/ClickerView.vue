<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'
import { useClickerStore } from '@/stores/clickerStore'
import BaseLayout from '@/components/layout/BaseLayout.vue'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { t } = useI18n()
const userStore = useUserStore()
const clickerStore = useClickerStore()

const buttonScale = computed(() => {
  const scale = Math.min(1 + (clickerStore.comboCount * 0.02), 1.2)
  return `scale(${scale})`
})

const comboColor = computed(() => {
  if (clickerStore.comboCount > 20) return 'text-danger'
  if (clickerStore.comboCount > 10) return 'text-warning'
  if (clickerStore.comboCount > 5) return 'text-info'
  return 'text-primary'
})
</script>

<template>
  <BaseLayout
    :title="t('clicker.title')"
    bootstrapIcon="coin"
    :showBalance="true">
    <div class="row g-4">
      <!-- Main Clicker Area -->
      <div class="col-lg-8">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body text-center p-5 position-relative">
            <!-- Stats Header -->
            <div class="row mb-4">
              <div class="col-4">
                <h5 class="text-primary mb-1">
                  <i class="bi bi-piggy-bank me-2"></i>
                  {{ clickerStore.formattedClicks }}
                </h5>
                <div class="text-muted small">Current Earnings</div>
              </div>
              <div class="col-4">
                <h5 class="text-info mb-1">
                  <i class="bi bi-infinity me-2"></i>
                  {{ clickerStore.formattedLifetimeClicks }}
                </h5>
                <div class="text-muted small">Lifetime Clicks</div>
              </div>
              <div class="col-4" v-if="clickerStore.prestigeLevel > 0">
                <h5 class="text-warning mb-1">
                  <i class="bi bi-star-fill me-2"></i>
                  {{ clickerStore.prestigeLevel }}
                </h5>
                <div class="text-muted small">Prestige Level</div>
              </div>
            </div>

            <!-- Combo Display -->
            <div v-if="clickerStore.comboCount > 1" class="mb-3">
              <span :class="`badge ${comboColor} fs-6 pulse`">
                <i class="bi bi-lightning-fill me-1"></i>
                {{ clickerStore.comboCount }}x COMBO!
                <span class="ms-1 opacity-75">
                  ({{ (clickerStore.comboMultiplier * 100 - 100).toFixed(0) }}% bonus)
                </span>
              </span>
            </div>

            <!-- Click Button Area -->
            <div class="d-flex flex-column align-items-center">
              <div class="position-relative">
                <!-- Main Click Button -->
                <button
                  class="btn btn-primary rounded-circle mb-4 p-0 d-flex align-items-center justify-content-center main-click-btn"
                  :style="{
                    width: '180px',
                    height: '180px',
                    transform: buttonScale,
                    filter: clickerStore.comboCount > 10 ? 'drop-shadow(0 0 20px rgba(13, 110, 253, 0.8))' : 'none'
                  }"
                  @click="clickerStore.handleClick">
                  <div>
                    <i class="bi bi-coin display-2"></i>
                    <div class="small mt-2">
                      +{{ clickerStore.formattedClickValue }}
                    </div>
                    <div class="small text-light opacity-75" v-if="clickerStore.criticalChance > 0.1">
                      {{ (clickerStore.criticalChance * 100).toFixed(0) }}% Crit
                    </div>
                  </div>
                </button>

                <!-- Floating Click Animations -->
                <div
                  v-for="animation in clickerStore.clickAnimations"
                  :key="animation.id"
                  class="floating-number"
                  :class="{ 'critical': animation.isCritical }"
                  :style="{
                    left: `${animation.x}px`,
                    top: `${animation.y}px`
                  }">
                  +{{ animation.value.toLocaleString() }}
                  <i v-if="animation.isCritical" class="bi bi-exclamation-circle ms-1"></i>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex gap-3 flex-wrap justify-content-center">
                <button
                  class="btn btn-success px-4 py-2"
                  @click="clickerStore.collectChips(userStore)"
                  :disabled="clickerStore.clicks < 10">
                  <i class="bi bi-check-circle me-2"></i>
                  Collect Chips
                  <small class="ms-1 opacity-75">(Min: 10)</small>
                </button>

                <button
                  v-if="clickerStore.canPrestige"
                  class="btn btn-warning px-4 py-2"
                  @click="clickerStore.prestige()">
                  <i class="bi bi-star-fill me-2"></i>
                  Prestige
                  <small class="ms-1 opacity-75">
                    (+{{ clickerStore.prestigePointsGain - clickerStore.prestigePoints }} pts)
                  </small>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Upgrades Area -->
      <div class="col-lg-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-header bg-transparent border-0">
            <h6 class="mb-0">
              <i class="bi bi-arrow-up-circle me-2"></i>Upgrades
            </h6>
          </div>
          <div class="card-body">
            <!-- Auto-Clicker -->
            <div class="upgrade-section mb-4">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div class="fw-medium">
                    <i class="bi bi-lightning me-1"></i>Auto-Clickers
                  </div>
                  <div class="small text-muted">
                    Owned: {{ clickerStore.autoClickersCount }}
                  </div>
                </div>
                <small class="text-success">
                  +{{ clickerStore.formattedClickValue }}/sec
                </small>
              </div>
              <button
                class="btn btn-outline-primary w-100"
                @click="clickerStore.buyAutoClicker(userStore)"
                :disabled="userStore.chips < clickerStore.autoClickerCost">
                Buy ({{ clickerStore.formattedAutoClickerCost }})
              </button>
            </div>

            <!-- Multiplier -->
            <div class="upgrade-section mb-4">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div class="fw-medium">
                    <i class="bi bi-stars me-1"></i>Click Multiplier
                  </div>
                  <div class="small text-muted">
                    Current: {{ clickerStore.multiplierLevel }}x
                  </div>
                </div>
              </div>
              <button
                class="btn btn-outline-danger w-100"
                @click="clickerStore.buyMultiplier(userStore)"
                :disabled="userStore.chips < clickerStore.multiplierCost">
                Upgrade ({{ clickerStore.formattedMultiplierCost }})
              </button>
            </div>

            <!-- Critical Hit Upgrade -->
            <div class="upgrade-section mb-4">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div class="fw-medium">
                    <i class="bi bi-bullseye me-1"></i>Critical Hits
                  </div>
                  <div class="small text-muted">
                    Chance: {{ (clickerStore.criticalChance * 100).toFixed(1) }}%
                  </div>
                </div>
                <small class="text-warning">2x damage</small>
              </div>
              <button
                class="btn btn-outline-warning w-100"
                @click="clickerStore.buyCriticalUpgrade(userStore)"
                :disabled="userStore.chips < clickerStore.criticalCost">
                Upgrade ({{ clickerStore.formattedCriticalCost }})
              </button>
            </div>

            <!-- Auto-Clicker Speed -->
            <div class="upgrade-section mb-4" v-if="clickerStore.autoClickersCount > 0">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div class="fw-medium">
                    <i class="bi bi-speedometer2 me-1"></i>Auto-Click Speed
                  </div>
                  <div class="small text-muted">
                    Interval: {{ clickerStore.autoClickerSpeed }}ms
                  </div>
                </div>
              </div>
              <button
                class="btn btn-outline-info w-100"
                @click="clickerStore.buyAutoClickerSpeed(userStore)"
                :disabled="userStore.chips < clickerStore.autoClickerSpeedCost">
                Upgrade ({{ clickerStore.formattedAutoClickerSpeedCost }})
              </button>
            </div>

            <!-- Prestige Info -->
            <div v-if="!clickerStore.canPrestige && clickerStore.totalLifetimeClicks > 0"
              class="mt-4 p-3 bg-light rounded">
              <div class="text-center">
                <i class="bi bi-star text-warning me-2"></i>
                <strong>Prestige Progress</strong>
                <div class="progress mt-2 mb-2">
                  <div
                    class="progress-bar bg-warning"
                    :style="{ width: (clickerStore.totalLifetimeClicks / 1000000 * 100) + '%' }">
                  </div>
                </div>
                <small class="text-muted">
                  {{ clickerStore.formattedLifetimeClicks }} / 1,000,000 clicks
                  <br>
                  Prestige resets progress but gives permanent bonuses!
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<style scoped>
.main-click-btn {
  transition: all 0.1s ease-in-out;
  position: relative;
}

.main-click-btn:active {
  transform: scale(0.95) !important;
}

.main-click-btn:hover {
  box-shadow: 0 0 30px rgba(13, 110, 253, 0.4);
}

.floating-number {
  position: absolute;
  font-weight: bold;
  color: #28a745;
  font-size: 1.2rem;
  pointer-events: none;
  animation: floatUp 2s ease-out forwards;
  z-index: 10;
}

.floating-number.critical {
  color: #dc3545;
  font-size: 1.5rem;
  text-shadow: 0 0 10px rgba(220, 53, 69, 0.5);
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0px) scale(1);
  }

  50% {
    opacity: 1;
    transform: translateY(-30px) scale(1.1);
  }

  100% {
    opacity: 0;
    transform: translateY(-60px) scale(0.8);
  }
}

.pulse {
  animation: pulse 0.5s ease-in-out infinite alternate;
}

@keyframes pulse {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(1.05);
  }
}

.upgrade-section {
  padding: 15px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.upgrade-section:hover {
  background: rgba(0, 0, 0, 0.04);
  border-color: rgba(0, 0, 0, 0.1);
}

.progress {
  height: 6px;
}

.badge {
  animation: glow 1s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 5px currentColor;
  }

  to {
    box-shadow: 0 0 15px currentColor;
  }
}
</style>
