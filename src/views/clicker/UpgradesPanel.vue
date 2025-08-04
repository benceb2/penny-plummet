<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'
import { useClickerStore } from '@/stores/clickerStore'

const userStore = useUserStore()
const clickerStore = useClickerStore()
</script>

<template>
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
    </div>
  </div>
</template>

<style scoped>
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
</style>
