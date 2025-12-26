<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

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
  size: 'md'
})

const emit = defineEmits<Emits>()
const { t } = useI18n()

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

// Check if component should be disabled due to insufficient funds
const isDisabled = computed(() => props.maxAmount <= 0)

// Computed quick bet amounts from percentages
const percentageBasedBets = computed(() => {
  if (props.maxAmount <= 0) return []
  return props.quickBetPercentages.map(percentage => {
    const amount = Math.floor(props.maxAmount * percentage)
    return Math.max(props.minAmount, amount)
  })
})

// Combined quick bet options (percentages + fixed amounts)
const quickBetOptions = computed(() => {
  if (props.maxAmount <= 0) return []
  const combined = [...percentageBasedBets.value, ...props.quickBetAmounts]
  // Remove duplicates and sort, filter out amounts that exceed max
  return [...new Set(combined)]
    .filter(amount => amount <= props.maxAmount)
    .sort((a, b) => a - b)
})

// Get percentage for display
function getPercentage(amount: number): string | null {
  if (props.maxAmount <= 0) return null
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
    <!-- Insufficient Funds Alert -->
    <div v-if="isDisabled" class="alert alert-danger d-flex align-items-center mb-3">
      <i class="bi bi-exclamation-triangle-fill me-2" aria-hidden="true"></i>
      <div>
        <strong>{{ t('betAmountSelector.insufficientFunds.title') }}</strong><br>
        <small>{{ t('betAmountSelector.insufficientFunds.description') }}</small>
      </div>
    </div>

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
          :disabled="isDisabled"
          :placeholder="minAmount.toString()">
        <label for="betAmount" class="d-flex align-items-center">
          <i class="bi bi-cash me-2" aria-hidden="true"></i>{{ label ?? t('betAmountSelector.label') }}
        </label>
      </div>
    </div>

    <!-- Quick Bet Options -->
    <div v-if="!isDisabled" class="mb-3">
      <div class="d-flex align-items-center gap-2 mb-2">
        <h3 class="mb-0 text-muted subsection-title">
          <i class="bi bi-lightning-fill me-1" aria-hidden="true"></i>{{ t('betAmountSelector.quickBet') }}
        </h3>
      </div>
      <div class="row g-2">
        <div
          v-for="amount in quickBetOptions"
          :key="amount"
          class="col-6 col-lg-3">
          <button
            :class="[
              'btn w-100 text-start',
              buttonSizeClass,
              { 'btn-primary': localValue === amount, 'btn-outline-dark': localValue !== amount }
            ]"
            :disabled="amount > maxAmount"
            @click="setPresetBet(amount)">
            <div class="d-flex justify-content-between align-items-center">
              <span class="fw-semibold">{{ formatIntAsCurrency(amount) }}</span>
              <small v-if="getPercentage(amount)" class="text-body">
                {{ getPercentage(amount) }}
              </small>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Current Selection Display -->
    <div v-if="!isDisabled" class="alert alert-info d-flex justify-content-between align-items-center mb-0">
      <span>
        <i class="bi bi-info-circle-fill me-2" aria-hidden="true"></i>
        <strong>{{ t('betAmountSelector.selected') }}:</strong> {{ formatIntAsCurrency(localValue) }}
      </span>
      <small v-if="getPercentage(localValue)" class="text-muted">
        {{ getPercentage(localValue) }} {{ t('betAmountSelector.ofChips') }}
      </small>
    </div>
  </div>
</template>
