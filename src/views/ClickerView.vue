<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'
import { useClickerStore } from '@/stores/clickerStore'
import BaseLayout from '@/components/layout/BaseLayout.vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const userStore = useUserStore()
const clickerStore = useClickerStore()
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
          <div class="card-body text-center p-5">
            <div class="mb-4">
              <h3 class="text-primary mb-1">
                <i class="bi bi-piggy-bank me-2"></i>
                {{ clickerStore.formattedClicks }}
              </h3>
              <div class="text-muted small">{{ t('clicker.earnings.current') }}</div>
            </div>

            <div class="d-flex flex-column align-items-center">
              <button
                class="btn btn-primary rounded-circle mb-4 p-0 d-flex align-items-center justify-content-center"
                style="width: 160px; height: 160px"
                @click="clickerStore.handleClick">
                <div>
                  <i class="bi bi-coin display-3"></i>
                  <div class="small mt-2">
                    {{ t('clicker.earnings.clickValue') }}{{ clickerStore.formattedClickValue }}
                  </div>
                </div>
              </button>

              <button
                class="btn btn-success px-4 py-2"
                @click="clickerStore.collectChips(userStore)"
                :disabled="clickerStore.clicks < 10">
                <i class="bi bi-check-circle me-2"></i>
                {{ t('clicker.collect.button') }}
                <small class="ms-1 opacity-75">{{ t('clicker.collect.minimum') }}</small>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Upgrades Area -->
      <div class="col-lg-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-header bg-transparent border-0">
            <h6 class="mb-0">
              <i class="bi bi-arrow-up-circle me-2"></i>{{ t('clicker.upgrades.title') }}
            </h6>
          </div>
          <div class="card-body">
            <!-- Auto-Clicker -->
            <div class="mb-4">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div class="fw-medium">
                    <i class="bi bi-lightning me-1"></i>{{ t('clicker.upgrades.autoClickers.title') }}
                  </div>
                  <div class="small text-muted">
                    {{ t('clicker.upgrades.autoClickers.owned') }}: {{ clickerStore.autoClickersCount }}
                  </div>
                </div>
                <small class="text-success">
                  +{{ clickerStore.formattedClickValue }}{{ t('clicker.upgrades.autoClickers.perSecond') }}
                </small>
              </div>
              <button
                class="btn btn-outline-primary w-100"
                @click="clickerStore.buyAutoClicker(userStore)"
                :disabled="userStore.chips < clickerStore.autoClickerCost">
                {{ t('clicker.upgrades.autoClickers.buy') }} ({{ clickerStore.formattedAutoClickerCost }})
              </button>
            </div>

            <!-- Multiplier -->
            <div>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div class="fw-medium">
                    <i class="bi bi-stars me-1"></i>{{ t('clicker.upgrades.multiplier.title') }}
                  </div>
                  <div class="small text-muted">
                    {{ t('clicker.upgrades.multiplier.current') }}: {{ clickerStore.multiplierLevel }}x
                  </div>
                </div>
              </div>
              <button
                class="btn btn-outline-danger w-100"
                @click="clickerStore.buyMultiplier(userStore)"
                :disabled="userStore.chips < clickerStore.multiplierCost">
                {{ t('clicker.upgrades.multiplier.upgrade') }} ({{ clickerStore.formattedMultiplierCost }})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<style scoped>
.btn-primary.rounded-circle {
  transition: transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out;
}

.btn-primary.rounded-circle:active {
  transform: scale(0.95);
}

.btn-primary.rounded-circle:hover {
  box-shadow: 0 0 20px rgba(13, 110, 253, 0.2);
}
</style>
