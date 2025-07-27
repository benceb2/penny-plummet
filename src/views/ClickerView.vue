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
      <div class="row g-3 mb-4">
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
      <div class="row g-4">
        <!-- Left Side - Click Area -->
        <div class="col-xl-8 col-lg-7">
          <div class="card h-100 border-0 shadow-sm main-game-card">
            <div class="card-body d-flex flex-column justify-content-center align-items-center position-relative p-4">

              <!-- Combo Display -->
              <div v-if="clickerStore.comboCount > 1" class="combo-display mb-4">
                <span :class="`badge ${comboColor} fs-5 pulse px-4 py-2`">
                  <i class="bi bi-lightning-fill me-2"></i>
                  {{ clickerStore.comboCount }}x COMBO!
                  <span class="ms-2 opacity-75">
                    ({{ (clickerStore.comboMultiplier * 100 - 100).toFixed(0) }}% bonus)
                  </span>
                </span>
              </div>

              <!-- Click Button Area - Centered and Larger -->
              <div class="click-area d-flex flex-column align-items-center">
                <div class="position-relative mb-4">
                  <!-- Main Click Button - Larger on Desktop -->
                  <button
                    class="btn btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center main-click-btn"
                    :style="{
                      width: '220px',
                      height: '220px',
                      transform: buttonScale,
                      filter: clickerStore.comboCount > 10 ? 'drop-shadow(0 0 30px rgba(13, 110, 253, 0.8))' : 'none'
                    }"
                    @click="clickerStore.handleClick">
                    <div class="text-center">
                      <i class="bi bi-coin" style="font-size: 4rem;"></i>
                      <div class="fs-5 mt-3 fw-bold">
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

                <!-- Action Buttons - Better Spacing -->
                <div class="d-flex gap-3 flex-wrap justify-content-center action-buttons">
                  <button
                    class="btn btn-success btn-lg px-5 py-3"
                    @click="clickerStore.collectChips(userStore)"
                    :disabled="clickerStore.clicks < 10">
                    <i class="bi bi-check-circle me-2"></i>
                    Collect Chips
                    <small class="ms-2 opacity-75">(Min: 10)</small>
                  </button>

                  <button
                    v-if="clickerStore.canPrestige"
                    class="btn btn-warning btn-lg px-5 py-3"
                    @click="clickerStore.prestige()">
                    <i class="bi bi-star-fill me-2"></i>
                    Prestige
                    <small class="ms-2 opacity-75">
                      (+{{ clickerStore.prestigePointsGain - clickerStore.prestigePoints }} pts)
                    </small>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Upgrades -->
        <div class="col-xl-4 col-lg-5">
          <div class="card h-100 border-0 shadow-sm upgrades-card">
            <div class="card-header bg-transparent border-0 py-3">
              <h5 class="mb-0 text-center">
                <i class="bi bi-arrow-up-circle me-2"></i>Upgrades
              </h5>
            </div>
            <div class="card-body p-3">
              <!-- Auto-Clicker -->
              <div class="upgrade-section mb-3">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div class="flex-grow-1">
                    <div class="fw-medium fs-6">
                      <i class="bi bi-lightning me-2 text-primary"></i>Auto-Clickers
                    </div>
                    <div class="small text-muted mt-1">
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
                  class="btn btn-outline-primary w-100 py-2"
                  @click="clickerStore.buyAutoClicker(userStore)"
                  :disabled="userStore.chips < clickerStore.autoClickerCost">
                  Buy ({{ clickerStore.formattedAutoClickerCost }})
                </button>
              </div>

              <!-- Multiplier -->
              <div class="upgrade-section mb-3">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div class="flex-grow-1">
                    <div class="fw-medium fs-6">
                      <i class="bi bi-stars me-2 text-danger"></i>Click Multiplier
                    </div>
                    <div class="small text-muted mt-1">
                      Current: {{ clickerStore.multiplierLevel }}x
                    </div>
                  </div>
                </div>
                <button
                  class="btn btn-outline-danger w-100 py-2"
                  @click="clickerStore.buyMultiplier(userStore)"
                  :disabled="userStore.chips < clickerStore.multiplierCost">
                  Upgrade ({{ clickerStore.formattedMultiplierCost }})
                </button>
              </div>

              <!-- Critical Hit Upgrade -->
              <div class="upgrade-section mb-3">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div class="flex-grow-1">
                    <div class="fw-medium fs-6">
                      <i class="bi bi-bullseye me-2 text-warning"></i>Critical Hits
                    </div>
                    <div class="small text-muted mt-1">
                      Chance: {{ (clickerStore.criticalChance * 100).toFixed(1) }}%
                    </div>
                  </div>
                  <div class="text-end">
                    <small class="text-warning fw-medium">2x damage</small>
                  </div>
                </div>
                <button
                  class="btn btn-outline-warning w-100 py-2"
                  @click="clickerStore.buyCriticalUpgrade(userStore)"
                  :disabled="userStore.chips < clickerStore.criticalCost">
                  Upgrade ({{ clickerStore.formattedCriticalCost }})
                </button>
              </div>

              <!-- Auto-Clicker Speed -->
              <div class="upgrade-section mb-3" v-if="clickerStore.autoClickersCount > 0">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <div class="flex-grow-1">
                    <div class="fw-medium fs-6">
                      <i class="bi bi-speedometer2 me-2 text-info"></i>Auto-Click Speed
                    </div>
                    <div class="small text-muted mt-1">
                      Interval: {{ clickerStore.autoClickerSpeed }}ms
                    </div>
                  </div>
                </div>
                <button
                  class="btn btn-outline-info w-100 py-2"
                  @click="clickerStore.buyAutoClickerSpeed(userStore)"
                  :disabled="userStore.chips < clickerStore.autoClickerSpeedCost">
                  Upgrade ({{ clickerStore.formattedAutoClickerSpeedCost }})
                </button>
              </div>

              <!-- Prestige Info -->
              <div v-if="!clickerStore.canPrestige && clickerStore.totalLifetimeClicks > 0"
                class="prestige-info mt-4 p-3">
                <div class="text-center">
                  <i class="bi bi-star text-warning me-2"></i>
                  <strong class="text-warning">Prestige Progress</strong>
                  <div class="progress mt-3 mb-2" style="height: 8px;">
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
/* Improved responsive design */
.main-game-card {
  min-height: 70vh;
}

.upgrades-card {
  min-height: 70vh;
}

.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
}

.click-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.main-click-btn {
  transition: all 0.1s ease-in-out;
  position: relative;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.main-click-btn:active {
  transform: scale(0.95) !important;
}

.main-click-btn:hover {
  box-shadow: 0 0 40px rgba(13, 110, 253, 0.5);
  border-color: rgba(255, 255, 255, 0.5);
}

.action-buttons {
  margin-top: 2rem;
}

.floating-number {
  position: absolute;
  font-weight: bold;
  color: #28a745;
  font-size: 1.4rem;
  pointer-events: none;
  animation: floatUp 2s ease-out forwards;
  z-index: 10;
  text-shadow: 0 0 10px rgba(40, 167, 69, 0.3);
}

.floating-number.critical {
  color: #dc3545;
  font-size: 1.8rem;
  text-shadow: 0 0 15px rgba(220, 53, 69, 0.5);
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0px) scale(1);
  }

  50% {
    opacity: 1;
    transform: translateY(-40px) scale(1.1);
  }

  100% {
    opacity: 0;
    transform: translateY(-80px) scale(0.8);
  }
}

.combo-display {
  animation: bounceIn 0.5s ease-out;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }

  50% {
    transform: scale(1.05);
  }

  70% {
    transform: scale(0.9);
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.pulse {
  animation: pulse 0.8s ease-in-out infinite alternate;
}

@keyframes pulse {
  from {
    transform: scale(1);
    box-shadow: 0 0 5px currentColor;
  }

  to {
    transform: scale(1.05);
    box-shadow: 0 0 20px currentColor;
  }
}

.upgrade-section {
  padding: 16px;
  background: linear-gradient(145deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.05));
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.upgrade-section:hover {
  background: linear-gradient(145deg, rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.08));
  border-color: rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.prestige-info {
  background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 193, 7, 0.05));
  border-radius: 12px;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.progress {
  height: 8px;
  border-radius: 4px;
}

.badge {
  border-radius: 25px;
  font-weight: 600;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .main-click-btn {
    width: 180px !important;
    height: 180px !important;
  }

  .main-click-btn i {
    font-size: 3rem !important;
  }

  .action-buttons {
    margin-top: 1.5rem;
  }

  .action-buttons .btn {
    padding: 12px 20px !important;
    font-size: 0.9rem;
  }

  .upgrade-section {
    padding: 12px;
    margin-bottom: 12px !important;
  }

  .stat-card .card-body {
    padding: 1rem !important;
  }

  .main-game-card {
    min-height: 60vh;
  }
}

@media (max-width: 576px) {
  .main-click-btn {
    width: 160px !important;
    height: 160px !important;
  }

  .main-click-btn i {
    font-size: 2.5rem !important;
  }

  .combo-display .badge {
    font-size: 0.9rem !important;
    padding: 8px 16px !important;
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
  }

  .action-buttons .btn {
    width: 100%;
    margin-bottom: 8px;
  }
}

/* Desktop enhancements */
@media (min-width: 1200px) {
  .main-click-btn {
    width: 250px !important;
    height: 250px !important;
  }

  .main-click-btn i {
    font-size: 5rem !important;
  }

  .main-game-card {
    min-height: 75vh;
  }

  .upgrades-card {
    min-height: 75vh;
  }
}
</style>
