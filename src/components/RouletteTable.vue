<script setup lang="ts">
import { computed } from 'vue'
import type { BetType } from '@/stores/rouletteStore'

interface Bet {
  type: BetType
  numbers: number[]
  amount: number
}

interface Props {
  currentBets: Bet[]
  currentBetAmount: number
  onPlaceBet: (type: BetType, numbers: number[], amount: number) => void
  formatCurrency: (amount: number) => string
}

const props = defineProps<Props>()

// Utility functions
const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

const getNumberButtonClass = (num: number): Record<string, boolean> => {
  const hasActiveBet = getBetAmount(num) > 0
  return {
    'btn-danger': redNumbers.includes(num),
    'btn-dark': !redNumbers.includes(num),
    'active': hasActiveBet,
    'position-relative': true
  }
}

const getBetAmount = (num: number): number => {
  return props.currentBets
    .filter(bet => bet.numbers.includes(num))
    .reduce((total, bet) => total + bet.amount, 0)
}

// Generate number grid
const numberGrid = computed(() => {
  return [
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
  ]
})

// Outside bets configuration
const outsideBets = [
  {
    type: 'dozen' as BetType,
    label: '1st 12',
    numbers: Array.from({ length: 12 }, (_, i) => i + 1),
    class: 'btn-success'
  },
  {
    type: 'dozen' as BetType,
    label: '2nd 12',
    numbers: Array.from({ length: 12 }, (_, i) => i + 13),
    class: 'btn-success'
  },
  {
    type: 'dozen' as BetType,
    label: '3rd 12',
    numbers: Array.from({ length: 12 }, (_, i) => i + 25),
    class: 'btn-success'
  }
]

const bottomBets = [
  {
    type: 'low' as BetType,
    label: '1-18',
    numbers: Array.from({ length: 18 }, (_, i) => i + 1),
    class: 'btn-success'
  },
  {
    type: 'even' as BetType,
    label: 'EVEN',
    numbers: Array.from({ length: 18 }, (_, i) => (i + 1) * 2),
    class: 'btn-success'
  },
  {
    type: 'red' as BetType,
    label: 'RED',
    numbers: redNumbers,
    class: 'btn-danger'
  },
  {
    type: 'black' as BetType,
    label: 'BLACK',
    numbers: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
    class: 'btn-dark'
  },
  {
    type: 'odd' as BetType,
    label: 'ODD',
    numbers: Array.from({ length: 18 }, (_, i) => i * 2 + 1),
    class: 'btn-success'
  },
  {
    type: 'high' as BetType,
    label: '19-36',
    numbers: Array.from({ length: 18 }, (_, i) => i + 19),
    class: 'btn-success'
  }
]
</script>

<template>
  <div class="roulette-table bg-success p-4 rounded">
    <!-- Dozen Bets -->
    <div class="row g-2 mb-3">
      <div v-for="bet in outsideBets" :key="bet.label" class="col-4">
        <button
          :class="['btn border w-100', bet.class]"
          @click="onPlaceBet(bet.type, bet.numbers, currentBetAmount)">
          {{ bet.label }}
        </button>
      </div>
    </div>

    <!-- Numbers Grid -->
    <div class="row g-2 mb-3">
      <template v-for="(row, rowIndex) in numberGrid" :key="rowIndex">
        <div v-for="num in row" :key="num" class="col-1">
          <button
            :class="['btn w-100', getNumberButtonClass(num)]"
            style="aspect-ratio: 1;"
            @click="onPlaceBet('straight', [num], currentBetAmount)">
            {{ num }}
            <span
              v-if="getBetAmount(num)"
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark"
              style="font-size: 0.65rem; z-index: 1;">
              {{ formatCurrency(getBetAmount(num)) }}
            </span>
          </button>
        </div>
      </template>
    </div>

    <!-- Bottom Bets -->
    <div class="row g-2">
      <div v-for="bet in bottomBets" :key="bet.label" class="col-2">
        <button :class="['btn border w-100', bet.class]" @click="onPlaceBet(bet.type, bet.numbers, currentBetAmount)">
          {{ bet.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn {
  font-size: 0.875rem;
  padding: 0.375rem 0.5rem;
}

@media (min-width: 768px) {
  .btn {
    font-size: 1rem;
    padding: 0.5rem 0.75rem;
  }
}

/* Ensure bet amount badges don't get cut off */
.position-relative {
  z-index: 0;
}

.badge {
  z-index: 1;
}
</style>
