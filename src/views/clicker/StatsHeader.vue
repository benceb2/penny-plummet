<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useClickerStore } from '@/stores/clickerStore'

const clickerStore = useClickerStore()
const { t } = useI18n()
</script>

<template>
  <div class="row g-2 mb-3">
    <div class="col-6 col-lg-3">
      <div class="card shadow-sm h-100">
        <div class="card-body text-center py-2">
          <div class="d-flex align-items-center justify-content-center">
            <i class="bi bi-piggy-bank text-primary me-4 fs-5"></i>
            <div>
              <div class="h5 mb-0 text-primary">{{ clickerStore.formattedClicks }}</div>
              <small class="text-muted">{{ t('clicker.stats.availableToCollect') }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-6 col-lg-3">
      <div class="card shadow-sm h-100">
        <div class="card-body text-center py-2">
          <div class="d-flex align-items-center justify-content-center">
            <i class="bi bi-clock text-success me-4 fs-5"></i>
            <div>
              <div class="h5 mb-0 text-success">
                {{ clickerStore.formattedIncome }}{{ t('clicker.stats.perSecondSuffix') }}
              </div>
              <small class="text-muted">{{ t('clicker.stats.income') }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-6 col-lg-3">
      <div class="card shadow-sm h-100">
        <div class="card-body text-center py-2">
          <div class="d-flex align-items-center justify-content-center">
            <i class="bi bi-infinity text-info me-4 fs-5"></i>
            <div>
              <div class="h5 mb-0 text-info">{{ clickerStore.formattedLifetimeClicks }}</div>
              <small class="text-muted">{{ t('clicker.stats.manualLifetimeClicks') }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-6 col-lg-3">
      <div class="card shadow-sm h-100">
        <div class="card-body text-center py-2">
          <div class="d-flex align-items-center justify-content-center">
            <i class="bi bi-robot text-secondary me-4 fs-5"></i>
            <div>
              <div class="h5 mb-0 text-secondary">{{ clickerStore.formattedPassiveLifetimeClicks }}</div>
              <small class="text-muted">{{ t('clicker.stats.passiveEarnings') }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
