<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/userStore'
import { useClickerStore } from '@/stores/clickerStore'

const userStore = useUserStore()
const clickerStore = useClickerStore()
const { t } = useI18n()
</script>

<template>
  <div class="card shadow-sm h-100 rounded-4">
    <div class="card-header border-1 rounded-top-4">
      <h2 class="mb-0 text-center fw-bold section-title">
        <i class="bi bi-arrow-up-circle me-2" aria-hidden="true"></i>{{ t('clicker.upgrades.title') }}
      </h2>
    </div>
    <div class="card-body p-3">

      <!-- Auto-Clicker -->
      <div class="bg-white border rounded-3 p-3 mb-3 upgrade-item">
        <div class="mb-3">
          <div class="fw-semibold mb-1">
            <i class="bi bi-lightning text-primary me-2" aria-hidden="true"></i>{{ t('clicker.upgrades.autoClickers.title') }}
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">
              {{ t('clicker.upgrades.autoClickers.owned') }}: {{ clickerStore.autoClickersCount }}
            </small>
            <small class="text-success-emphasis">
              +{{ clickerStore.formattedClickValue }}{{ t('clicker.upgrades.autoClickers.perSecond') }}
            </small>
          </div>
        </div>
        <button
          class="btn btn-primary w-100 rounded-2 fw-medium upgrade-btn"
          @click="clickerStore.buyAutoClicker(userStore)"
          :disabled="userStore.chips < clickerStore.autoClickerCost">
          {{ t('clicker.upgrades.actions.buy', { cost: clickerStore.formattedAutoClickerCost }) }}
        </button>
      </div>

      <!-- Multiplier -->
      <div class="bg-white border rounded-3 p-3 mb-3 upgrade-item">
        <div class="mb-3">
          <div class="fw-semibold mb-1">
            <i class="bi bi-stars text-danger me-2" aria-hidden="true"></i>{{ t('clicker.upgrades.multiplier.title') }}
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">
              {{ t('clicker.upgrades.multiplier.current') }}: {{ clickerStore.multiplierLevel }}x
            </small>
          </div>
        </div>
        <button
          class="btn btn-danger w-100 rounded-2 fw-medium upgrade-btn"
          @click="clickerStore.buyMultiplier(userStore)"
          :disabled="userStore.chips < clickerStore.multiplierCost">
          {{ t('clicker.upgrades.actions.upgrade', { cost: clickerStore.formattedMultiplierCost }) }}
        </button>
      </div>

      <!-- Critical Hit Upgrade -->
      <div class="bg-white border rounded-3 p-3 mb-3 upgrade-item">
        <div class="mb-3">
          <div class="fw-semibold mb-1">
            <i class="bi bi-bullseye text-warning me-2" aria-hidden="true"></i>{{ t('clicker.upgrades.critical.title') }}
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">
              {{ t('clicker.upgrades.critical.chance', { percent: (clickerStore.criticalChance * 100).toFixed(1) }) }}
            </small>
            <small class="text-warning-emphasis">{{ t('clicker.upgrades.critical.damage') }}</small>
          </div>
        </div>
        <button
          class="btn btn-warning w-100 rounded-2 fw-medium upgrade-btn"
          @click="clickerStore.buyCriticalUpgrade(userStore)"
          :disabled="userStore.chips < clickerStore.criticalCost">
          {{ t('clicker.upgrades.actions.upgrade', { cost: clickerStore.formattedCriticalCost }) }}
        </button>
      </div>

      <!-- Auto-Clicker Speed -->
      <div class="bg-white border rounded-3 p-3 mb-3 upgrade-item" v-if="clickerStore.autoClickersCount > 0">
        <div class="mb-3">
          <div class="fw-semibold mb-1">
            <i class="bi bi-speedometer2 text-info me-2" aria-hidden="true"></i>{{ t('clicker.upgrades.speed.title') }}
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">
              {{ t('clicker.upgrades.speed.interval', { ms: clickerStore.autoClickerSpeed }) }}
            </small>
          </div>
        </div>
        <button
          class="btn btn-info w-100 rounded-2 fw-medium upgrade-btn"
          @click="clickerStore.buyAutoClickerSpeed(userStore)"
          :disabled="userStore.chips < clickerStore.autoClickerSpeedCost">
          {{ t('clicker.upgrades.actions.upgrade', { cost: clickerStore.formattedAutoClickerSpeedCost }) }}
        </button>
      </div>
    </div>
  </div>
</template>
