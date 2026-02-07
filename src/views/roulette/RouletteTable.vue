<script setup lang="ts">
import { computed, ref } from 'vue'
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
const activeMobilePanel = ref<'quick' | 'numbers'>('quick')

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

// Mobile-friendly grid (3 columns x 12 rows)
const mobileNumbers = computed(() => Array.from({ length: 36 }, (_, i) => i + 1))

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
  <div class="roulette-felt p-1 p-md-3 rounded overflow-visible">

    
    <div class="d-none d-md-block">
      
      <div class="row g-2 mb-2 pt-2">
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

      
      <div class="d-flex gap-2">
        
        <div class="d-flex align-items-center">
          <button
            :class="`btn btn-outline-light d-flex align-items-center justify-content-center fw-bold fs-4 zero-btn ${getBetAmount(0) > 0 ? 'active position-relative' : ''}`"
            @click="onPlaceBet('straight', [0], currentBetAmount)">
            0
            <span
              v-if="getBetAmount(0) > 0"
              class="position-absolute badge rounded-pill bg-warning text-dark bet-badge">
              {{ formatCurrency(getBetAmount(0)) }}
            </span>
          </button>
        </div>

        
        <div class="flex-grow-1 pt-2">
          <table class="table table-borderless mb-0 number-grid">
            <tbody>
              <tr v-for="(row, rowIndex) in numberGrid" :key="rowIndex">
                <td v-for="num in row" :key="num">
                  <button
                    :class="getNumberButtonClass(num)"
                    class="number-btn w-100 fw-bold"
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

      
      <div class="row g-2 mt-2 pt-2">
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

    
    <div class="d-md-none">
      <div class="btn-group w-100 mb-2 mobile-panel-switch" role="group" aria-label="Roulette mobile panel">
        <button
          type="button"
          class="btn btn-sm"
          :class="activeMobilePanel === 'quick' ? 'btn-light text-success fw-semibold' : 'btn-outline-light'"
          @click="activeMobilePanel = 'quick'">
          {{ t('roulette.ui.quickBets') }}
        </button>
        <button
          type="button"
          class="btn btn-sm"
          :class="activeMobilePanel === 'numbers' ? 'btn-light text-success fw-semibold' : 'btn-outline-light'"
          @click="activeMobilePanel = 'numbers'">
          {{ t('roulette.ui.numberGrid') }}
        </button>
      </div>

      <div v-show="activeMobilePanel === 'quick'">
        <div class="row g-1 mb-1 pt-0">
          <div class="col-3">
            <button
              :class="`btn btn-sm btn-outline-light w-100 fw-bold zero-btn-sm ${getBetAmount(0) > 0 ? 'active position-relative' : ''}`"
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
              :class="`btn btn-sm btn-outline-light w-100 text-nowrap mobile-dozen-btn ${getOutsideBetAmount(bet.numbers) > 0 ? 'active position-relative' : ''}`"
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

        <div class="row g-1 pt-0">
          <div v-for="bet in outsideBets.even_money" :key="bet.label" class="col-4">
            <button
              :class="`btn btn-sm w-100 text-nowrap mobile-even-btn ${bet.btnClass || 'btn-outline-light'} ${getOutsideBetAmount(bet.numbers) > 0 ? 'active position-relative' : ''}`"
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

      <div v-show="activeMobilePanel === 'numbers'" class="pt-0">
        <div class="row g-1 mobile-number-grid">
          <div v-for="num in mobileNumbers" :key="num" class="col-4">
            <button
              :class="getNumberButtonClass(num)"
              class="w-100 btn-sm mobile-number-btn fw-bold"
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
  </div>
</template>

<style scoped>
.number-btn {
  height: 40px;
  overflow: visible !important;
  border: 2px solid #0f5a38;
}

.mobile-number-btn {
  height: 36px;
  overflow: visible !important;
  font-size: 0.8rem;
  padding: 0;
}

.zero-btn {
  width: 50px;
  height: 120px;
  writing-mode: vertical-lr;
}

.zero-btn-sm {
  height: 30px;
  font-size: 0.9rem;
}

.mobile-dozen-btn {
  height: 34px;
  font-size: 0.7rem;
}

.mobile-even-btn {
  font-size: 0.7rem;
  padding: 0.3rem 0.1rem;
}

.bet-badge {
  font-size: 0.65rem;
  z-index: 1000;
  top: -8px;
  right: -8px;
}

.bet-badge-sm {
  font-size: 0.45rem;
  z-index: 1000;
  top: -6px;
  right: -6px;
  padding: 0.125rem 0.25rem;
}


.btn {
  overflow: visible !important;
}

.position-relative {
  overflow: visible !important;
}

.roulette-felt {
  background-color: #146c43;
  border: 1px solid #0f5a38;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.roulette-felt .table {
  background-color: #146c43;
}

.number-grid {
  border-collapse: separate;
  border-spacing: 0.35rem;
}

.number-grid td {
  background-color: #146c43;
  padding: 0;
}
</style>
