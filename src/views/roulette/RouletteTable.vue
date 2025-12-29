<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n()

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

// Mobile-friendly grid (4 columns x 9 rows)
const mobileGrid = computed(() => {
  const grid = []
  for (let i = 1; i <= 36; i += 4) {
    grid.push([i, i + 1, i + 2, i + 3].filter(n => n <= 36))
  }
  return grid
})

const outsideBets = computed(() => {
  return {
    dozens: [
      { type: 'dozen' as BetType, label: t('roulette.table.bets.dozen1'), numbers: Array.from({ length: 12 }, (_, i) => i + 1) },
      { type: 'dozen' as BetType, label: t('roulette.table.bets.dozen2'), numbers: Array.from({ length: 12 }, (_, i) => i + 13) },
      { type: 'dozen' as BetType, label: t('roulette.table.bets.dozen3'), numbers: Array.from({ length: 12 }, (_, i) => i + 25) }
    ],
    even_money: [
      { type: 'low' as BetType, label: t('roulette.table.bets.low'), numbers: Array.from({ length: 18 }, (_, i) => i + 1) },
      { type: 'even' as BetType, label: t('roulette.table.bets.even'), numbers: Array.from({ length: 18 }, (_, i) => (i + 1) * 2) },
      { type: 'red' as BetType, label: t('roulette.table.bets.red'), numbers: redNumbers, btnClass: 'btn-danger' },
      { type: 'black' as BetType, label: t('roulette.table.bets.black'), numbers: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35], btnClass: 'btn-dark' },
      { type: 'odd' as BetType, label: t('roulette.table.bets.odd'), numbers: Array.from({ length: 18 }, (_, i) => i * 2 + 1) },
      { type: 'high' as BetType, label: t('roulette.table.bets.high'), numbers: Array.from({ length: 18 }, (_, i) => i + 19) }
    ]
  }
})
</script>

<template>
  <div class="roulette-felt p-2 p-md-3 rounded" style="overflow: visible;">

    <!-- Desktop Layout -->
    <div class="d-none d-md-block">
      <!-- Dozens -->
      <div class="row g-2 mb-2" style="padding-top: 10px;">
        <div v-for="bet in outsideBets.dozens" :key="bet.label" class="col-4">
          <button
            :class="`btn btn-outline-light w-100 ${getOutsideBetAmount(bet.numbers) > 0 ? 'active position-relative' : ''}`"
            @click="onPlaceBet(bet.type, bet.numbers, currentBetAmount)">
            {{ bet.label }}
            <span
              v-if="getOutsideBetAmount(bet.numbers) > 0"
              class="position-absolute badge rounded-pill bg-warning text-dark bet-badge">
              {{ formatCurrency(getOutsideBetAmount(bet.numbers)) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Numbers with Zero on the side -->
      <div class="d-flex gap-2">
        <!-- Zero -->
        <div class="d-flex align-items-center">
          <button
            :class="`btn btn-outline-light ${getBetAmount(0) > 0 ? 'active position-relative' : ''}`"
            style="width: 50px; height: 120px; font-size: 1.5rem; font-weight: bold; writing-mode: vertical-lr; display: flex; align-items: center; justify-content: center;"
            @click="onPlaceBet('straight', [0], currentBetAmount)">
            0
            <span
              v-if="getBetAmount(0) > 0"
              class="position-absolute badge rounded-pill bg-warning text-dark bet-badge">
              {{ formatCurrency(getBetAmount(0)) }}
            </span>
          </button>
        </div>

        <!-- Number Grid -->
        <div class="flex-grow-1" style="padding-top: 10px;">
          <table class="table table-borderless mb-0 roulette-table">
            <tbody>
              <tr v-for="(row, rowIndex) in numberGrid" :key="rowIndex">
                <td v-for="num in row" :key="num" class="p-1">
                  <button
                    :class="getNumberButtonClass(num)"
                    class="number-btn"
                    @click="onPlaceBet('straight', [num], currentBetAmount)">
                    {{ num }}
                    <span
                      v-if="getBetAmount(num) > 0"
                      class="position-absolute badge rounded-pill bg-warning text-dark bet-badge">
                      {{ formatCurrency(getBetAmount(num)) }}
                    </span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Even Money Bets -->
      <div class="row g-2 mt-2" style="padding-top: 10px;">
        <div v-for="bet in outsideBets.even_money" :key="bet.label" class="col-2">
          <button
            :class="`btn w-100 ${bet.btnClass || 'btn-outline-light'} ${getOutsideBetAmount(bet.numbers) > 0 ? 'active position-relative' : ''}`"
            @click="onPlaceBet(bet.type, bet.numbers, currentBetAmount)">
            {{ bet.label }}
            <span
              v-if="getOutsideBetAmount(bet.numbers) > 0"
              class="position-absolute badge rounded-pill bg-warning text-dark bet-badge">
              {{ formatCurrency(getOutsideBetAmount(bet.numbers)) }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Layout -->
    <div class="d-md-none">
      <!-- Zero and Dozens in one row -->
      <div class="row g-1 mb-2" style="padding-top: 6px;">
        <div class="col-3">
          <button
            :class="`btn btn-outline-light w-100 ${getBetAmount(0) > 0 ? 'active position-relative' : ''}`"
            style="height: 40px; font-size: 1.1rem; font-weight: bold;"
            @click="onPlaceBet('straight', [0], currentBetAmount)">
            0
            <span
              v-if="getBetAmount(0) > 0"
              class="position-absolute badge rounded-pill bg-warning text-dark bet-badge-sm">
              {{ formatCurrency(getBetAmount(0)) }}
            </span>
          </button>
        </div>
        <div v-for="bet in outsideBets.dozens" :key="bet.label" class="col-3">
          <button
            :class="`btn btn-outline-light w-100 ${getOutsideBetAmount(bet.numbers) > 0 ? 'active position-relative' : ''}`"
            style="height: 40px; font-size: 0.7rem;"
            @click="onPlaceBet(bet.type, bet.numbers, currentBetAmount)">
            {{ bet.label }}
            <span
              v-if="getOutsideBetAmount(bet.numbers) > 0"
              class="position-absolute badge rounded-pill bg-warning text-dark bet-badge-sm">
              {{ formatCurrency(getOutsideBetAmount(bet.numbers)) }}
            </span>
          </button>
        </div>
      </div>

      <!-- Mobile Number Grid (4 columns) -->
      <div class="mb-2" style="padding-top: 6px;">
        <div class="row g-1">
          <div v-for="row in mobileGrid" :key="row[0]" class="col-12 mb-1">
            <div class="d-flex gap-1">
              <button
                v-for="num in row"
                :key="num"
                :class="getNumberButtonClass(num)"
                class="flex-fill mobile-number-btn"
                @click="onPlaceBet('straight', [num], currentBetAmount)">
                {{ num }}
                <span
                  v-if="getBetAmount(num) > 0"
                  class="position-absolute badge rounded-pill bg-warning text-dark bet-badge-sm">
                  {{ formatCurrency(getBetAmount(num)) }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Even Money Bets (2x3 grid) -->
      <div class="row g-1" style="padding-top: 6px;">
        <div v-for="bet in outsideBets.even_money" :key="bet.label" class="col-4">
          <button
            :class="`btn w-100 ${bet.btnClass || 'btn-outline-light'} ${getOutsideBetAmount(bet.numbers) > 0 ? 'active position-relative' : ''}`"
            style="font-size: 0.7rem; padding: 0.4rem 0.2rem;"
            @click="onPlaceBet(bet.type, bet.numbers, currentBetAmount)">
            {{ bet.label }}
            <span
              v-if="getOutsideBetAmount(bet.numbers) > 0"
              class="position-absolute badge rounded-pill bg-warning text-dark bet-badge-sm">
              {{ formatCurrency(getOutsideBetAmount(bet.numbers)) }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Table styles */
.roulette-table {
  background-color: transparent !important;
}

.roulette-table td {
  background-color: transparent !important;
  border: none !important;
  overflow: visible;
}

/* Number button styles */
.number-btn {
  width: 100%;
  height: 40px;
  font-weight: bold;
  position: relative;
  overflow: visible !important;
}

.mobile-number-btn {
  height: 34px;
  font-weight: bold;
  position: relative;
  overflow: visible !important;
  font-size: 0.8rem;
}

/* Badge styles */
.bet-badge {
  font-size: 0.65rem;
  z-index: 1000;
  top: -8px;
  right: -8px;
}

.bet-badge-sm {
  font-size: 0.5rem;
  z-index: 1000;
  top: -6px;
  right: -6px;
  padding: 0.125rem 0.25rem;
}

/* Ensure overflow is visible */
.btn {
  overflow: visible !important;
}

.position-relative {
  overflow: visible !important;
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .roulette-felt {
    padding: 0.25rem !important;
  }
}

.roulette-felt {
  background-color: #146c43;
}
</style>
