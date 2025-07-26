<script setup lang="ts">
import { ref, computed, watch } from 'vue'

import { formatIntAsCurrency } from '@/utils/numberFormatUtil'

interface Props {
  modelValue: number
  maxAmount: number
  minAmount?: number
  quickBetPercentages?: number[]
  quickBetAmounts?: number[]
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

interface Emits {
  (e: 'update:modelValue', value: number): void
}

const props = withDefaults(defineProps<Props>(), {
  minAmount: 1,
  quickBetPercentages: () => [0.05, 0.10, 0.25, 0.50], // 5%, 10%, 25%, 50%
  quickBetAmounts: () => [100, 500, 1000, 5000],
  label: 'Bet Amount',
  size: 'md'
})

const emit = defineEmits<Emits>()

const localValue = ref(props.modelValue)

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue
})

// Watch local changes and emit
watch(localValue, (newValue) => {
  // Ensure value is within bounds
  const clampedValue = Math.max(props.minAmount, Math.min(newValue, props.maxAmount))
  if (clampedValue !== newValue) {
    localValue.value = clampedValue
  }
  emit('update:modelValue', clampedValue)
})

// Computed quick bet amounts from percentages
const percentageBasedBets = computed(() => {
  return props.quickBetPercentages.map(percentage => {
    const amount = Math.floor(props.maxAmount * percentage)
    return Math.max(props.minAmount, amount)
  })
})

// Combined quick bet options (percentages + fixed amounts)
const quickBetOptions = computed(() => {
  const combined = [...percentageBasedBets.value, ...props.quickBetAmounts]
  // Remove duplicates and sort, filter out amounts that exceed max
  return [...new Set(combined)]
    .filter(amount => amount <= props.maxAmount)
    .sort((a, b) => a - b)
})

// Get percentage for display
function getPercentage(amount: number): string | null {
  const percentage = (amount / props.maxAmount) * 100
  if (percentage < 1) return null
  return `${Math.round(percentage)}%`
}

// Set preset bet amount
function setPresetBet(amount: number) {
  if (amount <= props.maxAmount) {
    localValue.value = amount
  }
}

// Size classes
const inputSizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'form-control-sm'
    case 'lg': return 'form-control-lg'
    default: return ''
  }
})

const buttonSizeClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'btn-sm'
    case 'lg': return 'btn-lg'
    default: return ''
  }
})
</script>

<template>
  <div class="bet-amount-selector">
    <!-- Custom Bet Input -->
    <div class="mb-3">
      <div class="form-floating">
        <input
          type="number"
          :class="['form-control', inputSizeClass]"
          id="betAmount"
          v-model="localValue"
          :max="maxAmount"
          :min="minAmount"
          :placeholder="minAmount.toString()">
        <label for="betAmount" class="d-flex align-items-center">
          <i class="bi bi-cash me-2"></i>{{ label }}
        </label>
      </div>
    </div>

    <!-- Quick Bet Options -->
    <div class="mb-3">
      <div class="d-flex align-items-center gap-2 mb-2">
        <h6 class="mb-0 text-muted">
          <i class="bi bi-lightning-fill me-1"></i>Quick Bet
        </h6>
      </div>
      <div class="d-grid gap-2" style="grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));">
        <button
          v-for="amount in quickBetOptions"
          :key="amount"
          :class="['btn btn-outline-primary text-start', buttonSizeClass, { 'active': localValue === amount }]"
          :disabled="amount > maxAmount"
          @click="setPresetBet(amount)">
          <div class="d-flex justify-content-between align-items-center">
            <span>{{ formatIntAsCurrency(amount) }}</span>
            <small v-if="getPercentage(amount)" class="text-muted">
              {{ getPercentage(amount) }}
            </small>
          </div>
        </button>
      </div>
    </div>

    <!-- Current Selection Display -->
    <div class="alert alert-info d-flex justify-content-between align-items-center mb-0">
      <span>
        <i class="bi bi-info-circle me-2"></i>
        <strong>Selected:</strong> {{ formatIntAsCurrency(localValue) }}
      </span>
      <small v-if="getPercentage(localValue)" class="text-muted">
        {{ getPercentage(localValue) }} of chips
      </small>
    </div>
  </div>
</template>

<style scoped>
.bet-amount-selector .btn.active {
  background-color: var(--bs-primary);
  border-color: var(--bs-primary);
  color: white;
}

.bet-amount-selector .btn:disabled {
  opacity: 0.4;
}

@media (max-width: 576px) {
  .bet-amount-selector .d-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
