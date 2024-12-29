<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { formatIntAsCurrency } from '@/utils/currency'

const userStore = useUserStore()

// Base game state
const clicks = ref(0)
const baseClickValue = ref(1)
const autoClickersCount = ref(0)
const autoClickerCost = ref(50)
const multiplierLevel = ref(1)
const multiplierCost = ref(100)

// Computed values
const clickValue = computed(() => baseClickValue.value * multiplierLevel.value)
const formattedClickValue = computed(() => formatIntAsCurrency(clickValue.value))
const formattedAutoClickerCost = computed(() => formatIntAsCurrency(autoClickerCost.value))
const formattedMultiplierCost = computed(() => formatIntAsCurrency(multiplierCost.value))
const formattedClicks = computed(() => formatIntAsCurrency(clicks.value))

// Click handling
function handleClick() {
  clicks.value += clickValue.value
}

function collectChips() {
  if (clicks.value >= 10) {
    userStore.updateChips(clicks.value)
    clicks.value = 0
  }
}

// Upgrades
function buyAutoClicker() {
  if (clicks.value >= autoClickerCost.value) {
    clicks.value -= autoClickerCost.value
    autoClickersCount.value++
    autoClickerCost.value = Math.floor(autoClickerCost.value * 1.5)
  }
}

function buyMultiplier() {
  if (clicks.value >= multiplierCost.value) {
    clicks.value -= multiplierCost.value
    multiplierLevel.value++
    multiplierCost.value = Math.floor(multiplierCost.value * 2)
  }
}

// Auto-clickers
setInterval(() => {
  clicks.value += autoClickersCount.value * clickValue.value
}, 1000)
</script>

<template>
  <main class="container-fluid py-4">
    <!-- Header Section -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h5 class="mb-0">
        <i class="bi bi-coin me-2"></i>Earn Chips
      </h5>
      <div class="text-muted">
        <i class="bi bi-wallet2 me-1"></i>Balance: {{ userStore.formattedChips }}
      </div>
    </div>

    <div class="row g-4">
      <!-- Main Clicker Area -->
      <div class="col-lg-8">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-body text-center p-5">
            <div class="mb-4">
              <h3 class="text-primary mb-1">
                <i class="bi bi-piggy-bank me-2"></i>
                {{ formattedClicks }}
              </h3>
              <div class="text-muted small">Current Earnings</div>
            </div>

            <div class="d-flex flex-column align-items-center">
              <button
                class="btn btn-primary rounded-circle mb-4 p-0 d-flex align-items-center justify-content-center"
                style="width: 160px; height: 160px"
                @click="handleClick">
                <div>
                  <i class="bi bi-coin display-3"></i>
                  <div class="small mt-2">
                    +{{ formattedClickValue }}
                  </div>
                </div>
              </button>

              <button
                class="btn btn-success px-4 py-2"
                @click="collectChips"
                :disabled="clicks < 10">
                <i class="bi bi-check-circle me-2"></i>
                Collect Chips
                <small class="ms-1 opacity-75">(Min. 10 required)</small>
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
              <i class="bi bi-arrow-up-circle me-2"></i>Upgrades
            </h6>
          </div>
          <div class="card-body">
            <!-- Auto-Clicker -->
            <div class="mb-4">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div class="fw-medium">
                    <i class="bi bi-lightning me-1"></i>Auto-Clickers
                  </div>
                  <div class="small text-muted">
                    Owned: {{ autoClickersCount }}
                  </div>
                </div>
                <small class="text-success">
                  +{{ formattedClickValue }}/sec each
                </small>
              </div>
              <button
                class="btn btn-outline-primary w-100"
                @click="buyAutoClicker"
                :disabled="clicks < autoClickerCost">
                Buy Auto-Clicker ({{ formattedAutoClickerCost }})
              </button>
            </div>

            <!-- Multiplier -->
            <div>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <div class="fw-medium">
                    <i class="bi bi-stars me-1"></i>Click Multiplier
                  </div>
                  <div class="small text-muted">
                    Current: {{ multiplierLevel }}x
                  </div>
                </div>
              </div>
              <button
                class="btn btn-outline-warning w-100"
                @click="buyMultiplier"
                :disabled="clicks < multiplierCost">
                Upgrade Multiplier ({{ formattedMultiplierCost }})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
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
