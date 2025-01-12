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
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
  ]
})

const mobileNumberGrid = computed(() => [
  [1, 10, 19, 28],
  [2, 11, 20, 29],
  [3, 12, 21, 30],

  [4, 13, 22, 31],
  [5, 14, 23, 32],
  [6, 15, 24, 33],

  [7, 16, 25, 34],
  [8, 17, 26, 35],
  [9, 18, 27, 36]
])

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
    type: 'straight' as BetType,
    label: '0',
    numbers: [0],
    class: 'btn-success'
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
  <div class="bg-success p-2 p-md-3 rounded">
    <!-- Desktop Layout -->
    <div class="d-none d-md-block">
      <!-- Dozen Bets -->
      <div class="row g-2 mb-2">
        <div v-for="bet in outsideBets" :key="bet.label" class="col-4">
          <button
            :class="['btn border w-100', bet.class]"
            style="height: 3.5rem"
            @click="onPlaceBet(bet.type, bet.numbers, currentBetAmount)">
            {{ bet.label }}
          </button>
        </div>
      </div>

      <!-- Numbers Grid -->
      <div class="row g-2 mb-2">
        <template v-for="(row, rowIndex) in numberGrid" :key="rowIndex">
          <template v-for="num in row" :key="num">
            <div class="col-1">
              <div class="position-relative">
                <button
                  :class="['btn w-100 aspect-square', getNumberButtonClass(num)]"
                  @click="onPlaceBet('straight', [num], currentBetAmount)">
                  {{ num }}
                  <span
                    v-if="getBetAmount(num)"
                    class="bet-amount-badge">
                    {{ formatCurrency(getBetAmount(num)) }}
                  </span>
                </button>
              </div>
            </div>
          </template>
        </template>
      </div>

      <!-- Bottom Bets -->
      <div class="row g-2">
        <div v-for="bet in bottomBets" :key="bet.label" class="col-1">
          <button :class="['btn border w-100', bet.class]" style="height: 3.5rem"
            @click="onPlaceBet(bet.type, bet.numbers, currentBetAmount)">
            {{ bet.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Layout -->
    <div class="d-md-none">
      <!-- Dozen Bets -->
      <div class="row g-2 mb-2">
        <div v-for="bet in outsideBets" :key="bet.label" class="col-4">
          <button :class="['btn border w-100 py-2', bet.class]"
            @click="onPlaceBet(bet.type, bet.numbers, currentBetAmount)">
            {{ bet.label }}
          </button>
        </div>
      </div>

      <!-- Mobile Numbers Grid -->
      <div class="row g-2 mb-2">
        <template v-for="(row, rowIndex) in mobileNumberGrid" :key="rowIndex">
          <div class="row g-2 mb-2">
            <template v-for="num in row" :key="num">
              <div class="col-3">
                <div class="position-relative">
                  <button
                    :class="['btn w-100 aspect-square', getNumberButtonClass(num)]"
                    @click="onPlaceBet('straight', [num], currentBetAmount)">
                    {{ num }}
                    <span
                      v-if="getBetAmount(num)"
                      class="bet-amount-badge">
                      {{ formatCurrency(getBetAmount(num)) }}
                    </span>
                  </button>
                </div>
              </div>
            </template>
          </div>
        </template>
      </div>

      <!-- Bottom Bets -->
      <div class="row g-2">
        <template v-for="(bet) in bottomBets" :key="bet.label">
          <div class="col-4">
            <button
              :class="['btn border w-100 py-2', bet.class]"
              @click="onPlaceBet(bet.type, bet.numbers, currentBetAmount)">
              {{ bet.label }}
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.btn {
  --bs-btn-padding-x: 0.25rem;
  --bs-btn-padding-y: 0.25rem;
  font-weight: 500;
  position: relative;
}

.bet-amount-badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(35%, -35%);
  background-color: #ffc107;
  color: #000;
  border-radius: 9999px;
  padding: 0.25rem 0.4rem;
  font-weight: normal;
  white-space: nowrap;
  z-index: 5;
}

@media (max-width: 768px) {
  .btn {
    font-size: 0.875rem;
  }

  .bet-amount-badge {
    font-size: 0.65rem;
    padding: 0.2rem 0.35rem;
  }
}

@media (min-width: 769px) {
  .btn {
    font-size: 1rem;
  }

  .bet-amount-badge {
    font-size: 0.75rem;
  }
}
</style>
