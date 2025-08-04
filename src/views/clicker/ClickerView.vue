<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'
import { useClickerStore } from '@/stores/clickerStore'
import BaseLayout from '@/components/layout/BaseLayout.vue'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'

const { t } = useI18n()
const userStore = useUserStore()
const clickerStore = useClickerStore()

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

const comboColor = computed(() => {
  if (clickerStore.comboCount > 20) return 'text-danger'
  if (clickerStore.comboCount > 10) return 'text-warning'
  if (clickerStore.comboCount > 5) return 'text-info'
  return 'text-primary'
})

const clickScale = ref(1)
const collectButtonScale = ref(1)

const handleClickWithAnimation = () => {
  clickerStore.handleClick()

  // Quick click animation
  clickScale.value = 0.95
  setTimeout(() => {
    clickScale.value = 1
  }, 100)
}

const handleCollectWithAnimation = () => {
  clickerStore.collectChips(userStore)

  // Collect button animation
  collectButtonScale.value = 0.9
  setTimeout(() => {
    collectButtonScale.value = 1.1
    setTimeout(() => {
      collectButtonScale.value = 1
    }, 200)
  }, 100)
}
</script>

<template>
  <BaseLayout
    :title="t('clicker.title')"
    bootstrapIcon="coin"
    :showBalance="true">

    <div class="container-fluid px-0">
      <!-- Stats Header - Compact and Modern -->
      <div class="row g-2 mb-3">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center py-2">
              <div class="d-flex align-items-center justify-content-center">
                <i class="bi bi-piggy-bank text-primary me-4 fs-5"></i>
                <div>
                  <div class="h5 mb-0 text-primary">{{ clickerStore.formattedClicks }}</div>
                  <small class="text-muted">Available To Collect</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center py-2">
              <div class="d-flex align-items-center justify-content-center">
                <i class="bi bi-clock text-success me-4 fs-5"></i>
                <div>
                  <div class="h5 mb-0 text-success">{{ clickerStore.formattedIncome }}/s</div>
                  <small class="text-muted">Income</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center py-2">
              <div class="d-flex align-items-center justify-content-center">
                <i class="bi bi-infinity text-info me-4 fs-5"></i>
                <div>
                  <div class="h5 mb-0 text-info">{{ clickerStore.formattedLifetimeClicks }}</div>
                  <small class="text-muted">Lifetime Clicks</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-3" v-if="clickerStore.prestigeLevel > 0">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center py-2">
              <div class="d-flex align-items-center justify-content-center">
                <i class="bi bi-star-fill text-warning me-4 fs-5"></i>
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
      <div class="row">
        <!-- Left Side - Click Area -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm h-100 rounded-4">
            <div class="card-body d-flex flex-column justify-content-center align-items-center p-3"
              style="min-height: 600px;">

              <!-- Combo Display - only takes space when active -->
              <div class="d-flex justify-content-center align-items-center"
                :class="clickerStore.comboCount > 1 ? 'mb-3' : 'mb-1'">
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

              <!-- Main Click Area -->
              <div class="position-relative mb-4 p-3 d-flex justify-content-center align-items-center flex-grow-1">
                <button
                  class="main-click-btn btn rounded-circle p-0 position-relative"
                  :style="{
                    transform: `scale(${buttonScale * clickScale})`,
                    boxShadow: glowIntensity > 0 ?
                      `0 12px 40px rgba(255, 215, 0, ${0.4 + glowIntensity * 0.4}),
       0 0 ${30 + glowIntensity * 20}px rgba(255, 193, 7, ${glowIntensity * 0.6})` :
                      '0 12px 40px rgba(255, 215, 0, 0.3)'
                  }"
                  @click="handleClickWithAnimation">

                  <div class="click-content text-white">
                    <i class="bi bi-coin click-icon d-block mb-2"></i>
                    <div class="fw-bold fs-5 mb-1">+{{ clickerStore.formattedClickValue }}</div>
                    <div class="small opacity-90" v-if="clickerStore.criticalChance > 0.1">
                      {{ (clickerStore.criticalChance * 100).toFixed(0) }}% Crit
                    </div>
                  </div>

                  <!-- Click ripple effect -->
                  <div class="click-ripple"></div>
                </button>

                <!-- Floating Click Animations -->
                <div class="floating-animations-container position-absolute"
                  style="top: 50%; left: 50%; pointer-events: none; z-index: 15;">
                  <div
                    v-for="animation in clickerStore.clickAnimations"
                    :key="animation.id"
                    class="floating-number position-absolute fw-bold"
                    :class="animation.isCritical ? 'text-warning floating-critical' : 'text-success floating-normal'"
                    :style="{
                      left: `${animation.x}px`,
                      top: `${animation.y}px`,
                      transform: 'translate(-50%, -50%)',
                      fontSize: animation.isCritical ? '1.6rem' : '1.3rem',
                      textShadow: animation.isCritical ?
                        '0 0 15px rgba(255, 193, 7, 1), 0 2px 4px rgba(0, 0, 0, 0.8)' :
                        '0 0 10px rgba(40, 167, 69, 0.8), 0 2px 4px rgba(0, 0, 0, 0.8)'
                    }">
                    +{{ animation.value.toLocaleString() }}
                    <i v-if="animation.isCritical" class="bi bi-exclamation-diamond-fill ms-1"></i>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="d-flex gap-5 w-75 mx-auto">
                <button
                  class="collect-btn btn flex-fill position-relative overflow-hidden"
                  :style="{ transform: `scale(${collectButtonScale})` }"
                  @click="handleCollectWithAnimation"
                  :disabled="clickerStore.clicks < 10">

                  <!-- Animated background gradient -->
                  <div class="collect-bg-animation"></div>

                  <!-- Content -->
                  <div class="position-relative z-2 d-flex align-items-center justify-content-center">
                    <i class="bi bi-gem me-2 collect-icon"></i>
                    <div>
                      <div class="fw-bold">Collect Chips</div>
                      <small class="opacity-90">(Min: 10)</small>
                    </div>

                    <!-- Sparkle effects -->
                    <div class="sparkles position-absolute">
                      <div class="sparkle sparkle-1">✨</div>
                      <div class="sparkle sparkle-2">💎</div>
                      <div class="sparkle sparkle-3">⭐</div>
                    </div>
                  </div>
                </button>

                <button
                  v-if="clickerStore.canPrestige"
                  class="btn btn-warning btn-lg flex-fill"
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

        <!-- Right Side - Upgrades -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm h-100 rounded-4">
            <div class="card-header border-1 rounded-top-4">
              <h6 class="mb-0 text-center fw-bold">
                <i class="bi bi-arrow-up-circle me-2"></i>Upgrades
              </h6>
            </div>
            <div class="card-body p-3">

              <!-- Auto-Clicker -->
              <div class="bg-light border rounded-3 p-3 mb-3 upgrade-item">
                <div class="mb-3">
                  <div class="fw-semibold mb-1">
                    <i class="bi bi-lightning text-primary me-2"></i>Auto-Clickers
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">Owned: {{ clickerStore.autoClickersCount }}</small>
                    <small class="text-success">+{{ clickerStore.formattedClickValue }}/sec</small>
                  </div>
                </div>
                <button
                  class="btn btn-outline-primary w-100 rounded-2 fw-medium upgrade-btn"
                  @click="clickerStore.buyAutoClicker(userStore)"
                  :disabled="userStore.chips < clickerStore.autoClickerCost">
                  Buy {{ clickerStore.formattedAutoClickerCost }}
                </button>
              </div>

              <!-- Multiplier -->
              <div class="bg-light border rounded-3 p-3 mb-3 upgrade-item">
                <div class="mb-3">
                  <div class="fw-semibold mb-1">
                    <i class="bi bi-stars text-danger me-2"></i>Click Multiplier
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">Current: {{ clickerStore.multiplierLevel }}x</small>
                  </div>
                </div>
                <button
                  class="btn btn-outline-danger w-100 rounded-2 fw-medium upgrade-btn"
                  @click="clickerStore.buyMultiplier(userStore)"
                  :disabled="userStore.chips < clickerStore.multiplierCost">
                  Upgrade {{ clickerStore.formattedMultiplierCost }}
                </button>
              </div>

              <!-- Critical Hit Upgrade -->
              <div class="bg-light border rounded-3 p-3 mb-3 upgrade-item">
                <div class="mb-3">
                  <div class="fw-semibold mb-1">
                    <i class="bi bi-bullseye text-warning me-2"></i>Critical Hits
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">{{ (clickerStore.criticalChance * 100).toFixed(1) }}% chance</small>
                    <small class="text-warning">2x damage</small>
                  </div>
                </div>
                <button
                  class="btn btn-outline-warning w-100 rounded-2 fw-medium upgrade-btn"
                  @click="clickerStore.buyCriticalUpgrade(userStore)"
                  :disabled="userStore.chips < clickerStore.criticalCost">
                  Upgrade {{ clickerStore.formattedCriticalCost }}
                </button>
              </div>

              <!-- Auto-Clicker Speed -->
              <div class="bg-light border rounded-3 p-3 mb-3 upgrade-item" v-if="clickerStore.autoClickersCount > 0">
                <div class="mb-3">
                  <div class="fw-semibold mb-1">
                    <i class="bi bi-speedometer2 text-info me-2"></i>Auto-Click Speed
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">{{ clickerStore.autoClickerSpeed }}ms interval</small>
                  </div>
                </div>
                <button
                  class="btn btn-outline-info w-100 rounded-2 fw-medium upgrade-btn"
                  @click="clickerStore.buyAutoClickerSpeed(userStore)"
                  :disabled="userStore.chips < clickerStore.autoClickerSpeedCost">
                  Upgrade {{ clickerStore.formattedAutoClickerSpeedCost }}
                </button>
              </div>

              <!-- Prestige Info -->
              <div v-if="!clickerStore.canPrestige && clickerStore.totalLifetimeClicks > 0"
                class="mt-4 p-3 rounded-3 bg-warning bg-opacity-10 border border-warning border-opacity-25">
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
/* Main click button - improved with better contrast */
.main-click-btn {
  width: 240px;
  height: 240px;
  border: 4px solid rgba(255, 255, 255, 0.9) !important;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%) !important;
  box-shadow: 0 12px 40px rgba(255, 215, 0, 0.3);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.main-click-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(255, 215, 0, 0.5);
  border-color: rgba(255, 255, 255, 1) !important;
  background: linear-gradient(135deg, #FFE55C 0%, #FFB84D 50%, #FF9500 100%) !important;
}

.main-click-btn:active {
  transform: scale(0.95);
}

.click-content {
  position: relative;
  z-index: 2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.click-icon {
  font-size: 3.5rem;
}

/* collect button */
.collect-btn {
  border: none !important;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%) !important;
  color: white !important;
  font-size: 1.1rem;
  padding: 1rem 1.5rem;
  border-radius: 12px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
  min-height: 80px;
}

.collect-btn:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 35px rgba(40, 167, 69, 0.4);
  background: linear-gradient(135deg, #32d74b 0%, #17a2b8 100%) !important;
}

.collect-btn:disabled {
  opacity: 0.6;
  transform: none !important;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.2);
}

/* Animated background for collect button */
.collect-bg-animation {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.collect-btn:hover:not(:disabled) .collect-bg-animation {
  left: 100%;
}

/* Sparkle animations */
.sparkles {
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  font-size: 1rem;
  opacity: 0;
  animation: sparkleFloat 2s infinite ease-in-out;
}

.sparkle-1 {
  top: 20%;
  right: 15%;
  animation-delay: 0s;
}

.sparkle-2 {
  bottom: 25%;
  right: 20%;
  animation-delay: 0.7s;
}

.sparkle-3 {
  top: 60%;
  right: 10%;
  animation-delay: 1.4s;
}

.collect-btn:hover:not(:disabled) .sparkle {
  animation: sparkleActive 1.5s infinite ease-in-out;
}

.collect-icon {
  animation: gemGlow 2s ease-in-out infinite alternate;
}

/* Click ripple effect */
.click-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
  pointer-events: none;
}

.main-click-btn:active .click-ripple {
  width: 300px;
  height: 300px;
  opacity: 0;
}

/* Hover effects for interactive elements */
.upgrade-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.upgrade-btn:hover {
  transform: translateY(-1px);
}

.upgrade-item,
.upgrade-btn {
  transition: all 0.3s ease;
}

/* Game-specific animations */
.combo-badge {
  animation: bounceIn 0.5s ease;
}

.floating-number {
  pointer-events: none;
  font-weight: 700;
  white-space: nowrap;
}

.floating-normal {
  animation: floatUpImproved 2s ease-out forwards;
}

.floating-critical {
  animation: floatUpCritical 2.2s ease-out forwards;
}

.pulse {
  animation: pulse 0.8s ease-in-out infinite alternate;
}

/* Keyframe animations */
@keyframes sparkleFloat {

  0%,
  100% {
    opacity: 0;
    transform: translateY(0px) scale(0.8);
  }

  50% {
    opacity: 0.6;
    transform: translateY(-10px) scale(1);
  }
}

@keyframes sparkleActive {

  0%,
  100% {
    opacity: 0;
    transform: translateY(0px) scale(0.8) rotate(0deg);
  }

  25% {
    opacity: 1;
    transform: translateY(-15px) scale(1.2) rotate(90deg);
  }

  75% {
    opacity: 0.8;
    transform: translateY(-8px) scale(1) rotate(180deg);
  }
}

@keyframes gemGlow {
  from {
    filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));
  }

  to {
    filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.8));
  }
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

@keyframes pulse {
  from {
    transform: scale(1);
  }

  to {
    transform: scale(1.05);
  }
}

/* Responsive adjustments */
@media (max-width: 991px) {
  .main-click-btn {
    width: 200px;
    height: 200px;
  }

  .click-icon {
    font-size: 3rem;
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
}

@keyframes floatUpImproved {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(0px) scale(1) rotate(0deg);
  }

  10% {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(-10px) scale(1.1) rotate(-2deg);
  }

  30% {
    opacity: 0.9;
    transform: translate(-50%, -50%) translateY(-35px) scale(1.05) rotate(1deg);
  }

  70% {
    opacity: 0.4;
    transform: translate(-50%, -50%) translateY(-65px) scale(0.9) rotate(-1deg);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -50%) translateY(-100px) scale(0.7) rotate(0deg);
  }
}

@keyframes floatUpCritical {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(0px) scale(1) rotate(0deg);
  }

  5% {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(-5px) scale(1.3) rotate(-3deg);
  }

  15% {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(-20px) scale(1.2) rotate(2deg);
  }

  35% {
    opacity: 0.9;
    transform: translate(-50%, -50%) translateY(-45px) scale(1.1) rotate(-1deg);
  }

  70% {
    opacity: 0.3;
    transform: translate(-50%, -50%) translateY(-75px) scale(0.95) rotate(1deg);
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -50%) translateY(-120px) scale(0.6) rotate(0deg);
  }
}
</style>
