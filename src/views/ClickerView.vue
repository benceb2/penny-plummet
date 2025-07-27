<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'
import { useClickerStore } from '@/stores/clickerStore'
import BaseLayout from '@/components/layout/BaseLayout.vue'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const { t } = useI18n()
const userStore = useUserStore()
const clickerStore = useClickerStore()

// Computed for dynamic styling
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

    <div class="container-fluid px-0">
      <!-- Stats Header - Full Width -->
      <div class="row g-3 mb-3">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm stat-card">
            <div class="card-body text-center py-3">
              <h4 class="text-primary mb-1">
                <i class="bi bi-piggy-bank me-2"></i>
                {{ clickerStore.formattedClicks }}
              </h4>
              <div class="text-muted small">Current Earnings</div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm stat-card">
            <div class="card-body text-center py-3">
              <h4 class="text-info mb-1">
                <i class="bi bi-infinity me-2"></i>
                {{ clickerStore.formattedLifetimeClicks }}
              </h4>
              <div class="text-muted small">Lifetime Clicks</div>
            </div>
          </div>
        </div>
        <div class="col-md-4" v-if="clickerStore.prestigeLevel > 0">
          <div class="card border-0 shadow-sm stat-card">
            <div class="card-body text-center py-3">
              <h4 class="text-warning mb-1">
                <i class="bi bi-star-fill me-2"></i>
                {{ clickerStore.prestigeLevel }}
              </h4>
              <div class="text-muted small">Prestige Level</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Game Area -->
      <div class="row ">
        <!-- Left Side - Click Area -->
        <div class="col-xl-8 col-lg-7">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-body d-flex flex-column align-items-center position-relative pt-5">

              <!-- Combo Display - Absolute positioned to not affect layout -->
              <div v-if="clickerStore.comboCount > 1" class="position-absolute top-0 start-50 translate-middle-x mt-3">
                <span :class="`badge ${comboColor} fs-6 pulse px-3 py-2`">
                  <i class="bi bi-lightning-fill me-1"></i>
                  {{ clickerStore.comboCount }}x COMBO!
                  <span class="ms-1 opacity-75">
                    ({{ (clickerStore.comboMultiplier * 100 - 100).toFixed(0) }}% bonus)
                  </span>
                </span>
              </div>

              <!-- Click Button - Centered -->
              <div class="position-relative mb-5 mt-5">
                <button
                  class="btn btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center main-click-btn"
                  :style="{
                    width: '200px',
                    height: '200px',
                    transform: buttonScale,
                    filter: clickerStore.comboCount > 10 ? 'drop-shadow(0 0 30px rgba(13, 110, 253, 0.8))' : 'none'
                  }"
                  @click="clickerStore.handleClick">
                  <div class="text-center">
                    <i class="bi bi-coin display-4"></i>
                    <div class="fs-5 mt-2 fw-bold">
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
                  class="floating-number position-absolute"
                  :class="{ 'critical': animation.isCritical }"
                  :style="{
                    left: `${animation.x}px`,
                    top: `${animation.y}px`
                  }">
                  +{{ animation.value.toLocaleString() }}
                  <i v-if="animation.isCritical" class="bi bi-exclamation-circle ms-1"></i>
                </div>
              </div>

              <!-- Action Buttons - Bottom section -->
              <div class="d-flex gap-3 flex-wrap justify-content-center mt-5">
                <button
                  class="btn btn-success btn-lg px-4 py-2"
                  @click="clickerStore.collectChips(userStore)"
                  :disabled="clickerStore.clicks < 10">
                  <i class="bi bi-check-circle me-2"></i>
                  Collect Chips
                  <small class="ms-1 opacity-75">(Min: 10)</small>
                </button>

                <button
                  v-if="clickerStore.canPrestige"
                  class="btn btn-warning btn-lg px-4 py-2"
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

        <!-- Right Side - Upgrades -->
        <div class="col-xl-4 col-lg-5">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-header bg-transparent border-0 py-2">
              <h6 class="mb-0 text-center">
                <i class="bi bi-arrow-up-circle me-2"></i>Upgrades
              </h6>
            </div>
            <div class="card-body p-3 overflow-auto">
              <!-- Auto-Clicker -->
              <div class="mb-3 p-3 bg-light rounded border">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div class="flex-grow-1">
                    <div class="fw-medium">
                      <i class="bi bi-lightning me-2 text-primary"></i>Auto-Clickers
                    </div>
                    <div class="small text-muted">
                      Owned: {{ clickerStore.autoClickersCount }}
                    </div>
                  </div>
                  <div class="text-end">
                    <small class="text-success fw-medium">
                      +{{ clickerStore.formattedClickValue }}/sec
                    </small>
                  </div>
                </div>
                <button
                  class="btn btn-outline-primary w-100"
                  @click="clickerStore.buyAutoClicker(userStore)"
                  :disabled="userStore.chips < clickerStore.autoClickerCost">
                  Buy ({{ clickerStore.formattedAutoClickerCost }})
                </button>
              </div>

              <!-- Multiplier -->
              <div class="mb-3 p-3 bg-light rounded border">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div class="flex-grow-1">
                    <div class="fw-medium">
                      <i class="bi bi-stars me-2 text-danger"></i>Click Multiplier
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
              <div class="mb-3 p-3 bg-light rounded border">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div class="flex-grow-1">
                    <div class="fw-medium">
                      <i class="bi bi-bullseye me-2 text-warning"></i>Critical Hits
                    </div>
                    <div class="small text-muted">
                      Chance: {{ (clickerStore.criticalChance * 100).toFixed(1) }}%
                    </div>
                  </div>
                  <div class="text-end">
                    <small class="text-warning fw-medium">2x damage</small>
                  </div>
                </div>
                <button
                  class="btn btn-outline-warning w-100"
                  @click="clickerStore.buyCriticalUpgrade(userStore)"
                  :disabled="userStore.chips < clickerStore.criticalCost">
                  Upgrade ({{ clickerStore.formattedCriticalCost }})
                </button>
              </div>

              <!-- Auto-Clicker Speed -->
              <div class="mb-3 p-3 bg-light rounded border" v-if="clickerStore.autoClickersCount > 0">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div class="flex-grow-1">
                    <div class="fw-medium">
                      <i class="bi bi-speedometer2 me-2 text-info"></i>Auto-Click Speed
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
                class="mt-3 p-3 bg-warning bg-opacity-10 rounded border border-warning border-opacity-25">
                <div class="text-center">
                  <i class="bi bi-star text-warning me-2"></i>
                  <strong class="text-warning">Prestige Progress</strong>
                  <div class="progress mt-2 mb-2">
                    <div
                      class="progress-bar bg-warning"
                      :style="{ width: Math.min(clickerStore.totalLifetimeClicks / 1000000 * 100, 100) + '%' }">
                    </div>
                  </div>
                  <small class="text-muted">
                    {{ clickerStore.formattedLifetimeClicks }} / 1,000,000 clicks
                    <br>
                    <em>Prestige resets progress but gives permanent bonuses!</em>
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<style scoped>
/* Minimal custom CSS - mostly Bootstrap classes used */
.stat-card:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}

.main-click-btn {
  transition: all 0.1s ease-in-out;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.main-click-btn:active {
  transform: scale(0.95) !important;
}

.main-click-btn:hover {
  box-shadow: 0 0 30px rgba(13, 110, 253, 0.4);
}

.floating-number {
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
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0px);
  }

  100% {
    opacity: 0;
    transform: translateY(-60px);
  }
}

.pulse {
  animation: pulse 0.8s ease-in-out infinite alternate;
}

@keyframes pulse {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(1.05);
  }
}

/* Mobile responsive adjustments */
@media (max-width: 768px) {
  .main-click-btn {
    width: 160px !important;
    height: 160px !important;
  }

  .main-click-btn .display-4 {
    font-size: 2.5rem !important;
  }
}

@media (min-width: 1200px) {
  .main-click-btn {
    width: 220px !important;
    height: 220px !important;
  }
}
</style>
