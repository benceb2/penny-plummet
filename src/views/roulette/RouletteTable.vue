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

const getNumberButtonClass = (num: number): string => {
  const hasActiveBet = getBetAmount(num) > 0
  const isRed = redNumbers.includes(num)
  return `btn ${isRed ? 'btn-danger' : 'btn-dark'} ${hasActiveBet ? 'active position-relative' : ''}`
}

const getBetAmount = (num: number): number => {
  return props.currentBets
    .filter(bet =>
      bet.numbers.includes(num) &&
      (bet.type === 'straight' || bet.numbers.length === 1)
    )
    .reduce((total, bet) => total + bet.amount, 0)
}

const getOutsideBetAmount = (betNumbers: number[]): number => {
  return props.currentBets
    .filter(bet =>
      bet.numbers.length === betNumbers.length &&
      bet.numbers.every(num => betNumbers.includes(num))
    )
    .reduce((total, bet) => total + bet.amount, 0)
}

// Generate number grid (European style)
const numberGrid = computed(() => {
  const grid = []
  // Create 3 rows
  for (let row = 1; row <= 3; row++) {
    const rowNumbers = []
    for (let col = 0; col < 12; col++) {
      rowNumbers.push(row + (col * 3))
    }
    grid.push(rowNumbers)
  }
  return grid
})

const outsideBets = {
  dozens: [
    { type: 'dozen' as BetType, label: '1st 12', numbers: Array.from({ length: 12 }, (_, i) => i + 1) },
    { type: 'dozen' as BetType, label: '2nd 12', numbers: Array.from({ length: 12 }, (_, i) => i + 13) },
    { type: 'dozen' as BetType, label: '3rd 12', numbers: Array.from({ length: 12 }, (_, i) => i + 25) }
  ],
  even_money: [
    { type: 'low' as BetType, label: '1-18', numbers: Array.from({ length: 18 }, (_, i) => i + 1) },
    { type: 'even' as BetType, label: 'EVEN', numbers: Array.from({ length: 18 }, (_, i) => (i + 1) * 2) },
    { type: 'red' as BetType, label: 'RED', numbers: redNumbers, btnClass: 'btn-danger' },
    { type: 'black' as BetType, label: 'BLACK', numbers: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35], btnClass: 'btn-dark' },
    { type: 'odd' as BetType, label: 'ODD', numbers: Array.from({ length: 18 }, (_, i) => i * 2 + 1) },
    { type: 'high' as BetType, label: '19-36', numbers: Array.from({ length: 18 }, (_, i) => i + 19) }
  ]
}
</script>

<template>
  <div class="bg-success p-3 rounded">
    <!-- Zero -->
    <div class="text-center mb-3">
      <button
        :class="`btn btn-success ${getBetAmount(0) > 0 ? 'active position-relative' : ''}`"
        style="width: 60px; height: 60px; font-size: 1.5rem; font-weight: bold;"
        @click="onPlaceBet('straight', [0], currentBetAmount)">
        0
        <span
          v-if="getBetAmount(0) > 0"
          class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
          {{ formatCurrency(getBetAmount(0)) }}
        </span>
      </button>
    </div>

    <!-- Dozens -->
    <div class="row g-2 mb-2">
      <div v-for="bet in outsideBets.dozens" :key="bet.label" class="col-4">
        <button
          :class="`btn btn-outline-light w-100 ${getOutsideBetAmount(bet.numbers) > 0 ? 'active position-relative' : ''}`"
          @click="onPlaceBet(bet.type, bet.numbers, currentBetAmount)">
          {{ bet.label }}
          <span
            v-if="getOutsideBetAmount(bet.numbers) > 0"
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
            {{ formatCurrency(getOutsideBetAmount(bet.numbers)) }}
          </span>
        </button>
      </div>
    </div>

    <!-- Number Grid -->
    <div class="table-responsive mb-2">
      <table class="table table-borderless mb-0">
        <tbody>
          <tr v-for="(row, rowIndex) in numberGrid" :key="rowIndex">
            <td v-for="num in row" :key="num" class="p-1">
              <button
                :class="getNumberButtonClass(num)"
                style="width: 100%; height: 40px; font-weight: bold;"
                @click="onPlaceBet('straight', [num], currentBetAmount)">
                {{ num }}
                <span
                  v-if="getBetAmount(num) > 0"
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark"
                  style="font-size: 0.65rem;">
                  {{ formatCurrency(getBetAmount(num)) }}
                </span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Even Money Bets -->
    <div class="row g-2">
      <div v-for="bet in outsideBets.even_money" :key="bet.label" class="col-6 col-md-2">
        <button
          :class="`btn w-100 ${bet.btnClass || 'btn-outline-light'} ${getOutsideBetAmount(bet.numbers) > 0 ? 'active position-relative' : ''}`"
          @click="onPlaceBet(bet.type, bet.numbers, currentBetAmount)">
          {{ bet.label }}
          <span
            v-if="getOutsideBetAmount(bet.numbers) > 0"
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
            {{ formatCurrency(getOutsideBetAmount(bet.numbers)) }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
