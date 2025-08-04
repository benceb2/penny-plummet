<script setup lang="ts">
import { useClickerStore } from '@/stores/clickerStore'

const clickerStore = useClickerStore()
</script>

<template>
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
</template>
