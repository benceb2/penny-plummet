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
      <!-- Stats Header - Compact and Modern -->
      <div class="row g-2 mb-3">
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center py-2">
              <div class="d-flex align-items-center justify-content-center">
                <i class="bi bi-piggy-bank text-primary me-2 fs-5"></i>
                <div>
                  <div class="h5 mb-0 text-primary">{{ clickerStore.formattedClicks }}</div>
                  <small class="text-muted">Current Earnings</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center py-2">
              <div class="d-flex align-items-center justify-content-center">
                <i class="bi bi-infinity text-info me-2 fs-5"></i>
                <div>
                  <div class="h5 mb-0 text-info">{{ clickerStore.formattedLifetimeClicks }}</div>
                  <small class="text-muted">Lifetime Clicks</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4" v-if="clickerStore.prestigeLevel > 0">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center py-2">
              <div class="d-flex align-items-center justify-content-center">
                <i class="bi bi-star-fill text-warning me-2 fs-5"></i>
                <div>
                  <div class="h5 mb-0 text-warning">{{ clickerStore.prestigeLevel }}</div>
                  <small class="text-muted">Prestige Level</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Game Area -->
      <div class="row g-3">
        <!-- Left Side - Click Area -->
        <div class="col-lg-8">
          <div class="game-area card border-0 shadow-sm h-100">
            <div class="card-body d-flex flex-column justify-content-center align-items-center p-3">

              <!-- Combo Display -->
              <div class="combo-section mb-5" style="min-height: 40px;">
                <div v-if="clickerStore.comboCount > 1" class="combo-badge">
                  <span :class="`badge ${comboColor} fs-6 pulse px-3 py-1`">
                    <i class="bi bi-lightning-fill me-1"></i>
                    {{ clickerStore.comboCount }}x COMBO!
                    <span class="ms-1 opacity-75">
                      ({{ (clickerStore.comboMultiplier * 100 - 100).toFixed(0) }}% bonus)
                    </span>
                  </span>
                </div>
              </div>

              <!-- Main Click Area with generous spacing -->
              <div class="click-area-container position-relative mb-5">
                <button
                  class="main-click-btn btn btn-primary rounded-circle p-0 position-relative"
                  :style="{
                    transform: buttonScale,
                    filter: clickerStore.comboCount > 10 ? 'drop-shadow(0 0 30px rgba(13, 110, 253, 0.8))' : 'none'
                  }"
                  @click="clickerStore.handleClick">

                  <div class="click-content">
                    <i class="bi bi-coin click-icon"></i>
                    <div class="click-value">+{{ clickerStore.formattedClickValue }}</div>
                    <div class="crit-chance" v-if="clickerStore.criticalChance > 0.1">
                      {{ (clickerStore.criticalChance * 100).toFixed(0) }}% Crit
                    </div>
                  </div>

                  <!-- Click ripple effect -->
                  <div class="click-ripple"></div>
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

              <!-- Action Buttons with proper spacing -->
              <div class="action-section">
                <div class="d-flex gap-3 justify-content-center flex-wrap">
                  <button
                    class="btn btn-success btn-lg action-btn"
                    @click="clickerStore.collectChips(userStore)"
                    :disabled="clickerStore.clicks < 10">
                    <i class="bi bi-check-circle me-2"></i>
                    <div>
                      <div>Collect Chips</div>
                      <small class="opacity-75">(Min: 10)</small>
                    </div>
                  </button>

                  <button
                    v-if="clickerStore.canPrestige"
                    class="btn btn-warning btn-lg action-btn"
                    @click="clickerStore.prestige()">
                    <i class="bi bi-star-fill me-2"></i>
                    <div>
                      <div>Prestige</div>
                      <small class="opacity-75">
                        +{{ clickerStore.prestigePointsGain - clickerStore.prestigePoints }} pts
                      </small>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Upgrades -->
        <div class="col-lg-4">
          <div class="upgrades-panel card border-0 shadow-sm h-100">
            <div class="card-header bg-gradient text-white border-0">
              <h6 class="mb-0 text-center fw-bold">
                <i class="bi bi-arrow-up-circle me-2"></i>Upgrades
              </h6>
            </div>
            <div class="card-body p-3">

              <!-- Auto-Clicker -->
              <div class="upgrade-item mb-3">
                <div class="upgrade-header">
                  <div class="upgrade-info">
                    <div class="upgrade-title">
                      <i class="bi bi-lightning text-primary me-2"></i>Auto-Clickers
                    </div>
                    <div class="upgrade-stats">
                      <small class="text-muted">Owned: {{ clickerStore.autoClickersCount }}</small>
                      <small class="text-success ms-2">+{{ clickerStore.formattedClickValue }}/sec</small>
                    </div>
                  </div>
                </div>
                <button
                  class="btn btn-outline-primary w-100 upgrade-btn"
                  @click="clickerStore.buyAutoClicker(userStore)"
                  :disabled="userStore.chips < clickerStore.autoClickerCost">
                  Buy {{ clickerStore.formattedAutoClickerCost }}
                </button>
              </div>

              <!-- Multiplier -->
              <div class="upgrade-item mb-3">
                <div class="upgrade-header">
                  <div class="upgrade-info">
                    <div class="upgrade-title">
                      <i class="bi bi-stars text-danger me-2"></i>Click Multiplier
                    </div>
                    <div class="upgrade-stats">
                      <small class="text-muted">Current: {{ clickerStore.multiplierLevel }}x</small>
                    </div>
                  </div>
                </div>
                <button
                  class="btn btn-outline-danger w-100 upgrade-btn"
                  @click="clickerStore.buyMultiplier(userStore)"
                  :disabled="userStore.chips < clickerStore.multiplierCost">
                  Upgrade {{ clickerStore.formattedMultiplierCost }}
                </button>
              </div>

              <!-- Critical Hit Upgrade -->
              <div class="upgrade-item mb-3">
                <div class="upgrade-header">
                  <div class="upgrade-info">
                    <div class="upgrade-title">
                      <i class="bi bi-bullseye text-warning me-2"></i>Critical Hits
                    </div>
                    <div class="upgrade-stats">
                      <small class="text-muted">{{ (clickerStore.criticalChance * 100).toFixed(1) }}% chance</small>
                      <small class="text-warning ms-2">2x damage</small>
                    </div>
                  </div>
                </div>
                <button
                  class="btn btn-outline-warning w-100 upgrade-btn"
                  @click="clickerStore.buyCriticalUpgrade(userStore)"
                  :disabled="userStore.chips < clickerStore.criticalCost">
                  Upgrade {{ clickerStore.formattedCriticalCost }}
                </button>
              </div>

              <!-- Auto-Clicker Speed -->
              <div class="upgrade-item mb-3" v-if="clickerStore.autoClickersCount > 0">
                <div class="upgrade-header">
                  <div class="upgrade-info">
                    <div class="upgrade-title">
                      <i class="bi bi-speedometer2 text-info me-2"></i>Auto-Click Speed
                    </div>
                    <div class="upgrade-stats">
                      <small class="text-muted">{{ clickerStore.autoClickerSpeed }}ms interval</small>
                    </div>
                  </div>
                </div>
                <button
                  class="btn btn-outline-info w-100 upgrade-btn"
                  @click="clickerStore.buyAutoClickerSpeed(userStore)"
                  :disabled="userStore.chips < clickerStore.autoClickerSpeedCost">
                  Upgrade {{ clickerStore.formattedAutoClickerSpeedCost }}
                </button>
              </div>

              <!-- Prestige Info -->
              <div v-if="!clickerStore.canPrestige && clickerStore.totalLifetimeClicks > 0"
                class="prestige-progress mt-4 p-3 rounded bg-warning bg-opacity-10 border border-warning border-opacity-25">
                <div class="text-center">
                  <div class="fw-semibold text-warning mb-2">
                    <i class="bi bi-star me-1"></i>Prestige Progress
                  </div>
                  <div class="progress mb-2" style="height: 8px;">
                    <div
                      class="progress-bar bg-warning"
                      :style="{ width: Math.min(clickerStore.totalLifetimeClicks / 1000000 * 100, 100) + '%' }">
                    </div>
                  </div>
                  <small class="text-muted">
                    {{ clickerStore.formattedLifetimeClicks }} / 1M clicks
                    <br><em>Reset for permanent bonuses!</em>
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
/* Game area styling */
.game-area {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16px !important;
  min-height: 600px;
}

/* Click area container for better spacing */
.click-area-container {
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.combo-section {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Click button - completely redesigned */
.main-click-btn {
  width: 240px;
  height: 240px;
  border: 4px solid rgba(255, 255, 255, 0.8) !important;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%) !important;
  box-shadow: 0 12px 40px rgba(0, 123, 255, 0.3);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.main-click-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(0, 123, 255, 0.4);
  border-color: rgba(255, 255, 255, 1) !important;
}

.main-click-btn:active {
  transform: scale(0.95);
}

.click-content {
  position: relative;
  z-index: 2;
  color: white;
}

.click-icon {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 8px;
}

.click-value {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.crit-chance {
  font-size: 0.75rem;
  opacity: 0.9;
}

/* Click ripple effect */
.click-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
  pointer-events: none;
}

.main-click-btn:active .click-ripple {
  width: 300px;
  height: 300px;
  opacity: 0;
}

/* Action buttons */
.action-btn {
  min-width: 140px;
  border-radius: 12px !important;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* Upgrades panel */
.upgrades-panel {
  border-radius: 16px !important;
}

.upgrades-panel .card-header {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%) !important;
  border-radius: 16px 16px 0 0 !important;
}

.upgrade-item {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.upgrade-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-color: rgba(0, 0, 0, 0.15);
}

.upgrade-header {
  margin-bottom: 12px;
}

.upgrade-title {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 4px;
}

.upgrade-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upgrade-btn {
  border-radius: 8px !important;
  font-weight: 500;
  transition: all 0.2s ease;
}

.upgrade-btn:hover {
  transform: translateY(-1px);
}

/* Combo and floating animations */
.combo-badge {
  animation: bounceIn 0.5s ease;
}

.floating-number {
  font-weight: bold;
  color: #28a745;
  font-size: 1.2rem;
  pointer-events: none;
  animation: floatUp 2s ease-out forwards;
  z-index: 10;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.floating-number.critical {
  color: #dc3545;
  font-size: 1.5rem;
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0px) scale(1);
  }

  50% {
    transform: translateY(-30px) scale(1.1);
  }

  100% {
    opacity: 0;
    transform: translateY(-60px) scale(0.8);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }

  50% {
    opacity: 1;
    transform: scale(1.05);
  }

  100% {
    opacity: 1;
    transform: scale(1);
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

/* Responsive design */
@media (max-width: 991px) {
  .main-click-btn {
    width: 200px;
    height: 200px;
  }

  .click-icon {
    font-size: 3rem;
  }

  .click-area-container {
    padding: 30px;
  }

  .game-area {
    min-height: 550px;
  }
}

@media (max-width: 768px) {
  .main-click-btn {
    width: 180px;
    height: 180px;
  }

  .click-icon {
    font-size: 2.5rem;
  }

  .action-btn {
    min-width: 120px;
    font-size: 0.9rem;
  }

  .click-area-container {
    padding: 20px;
  }

  .game-area {
    min-height: 500px;
  }

  .card-body {
    padding: 2rem !important;
  }
}

/* Prestige progress */
.prestige-progress {
  border-radius: 12px !important;
}
</style>
