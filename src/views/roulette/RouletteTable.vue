<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BetType, RouletteBet } from '@/types/RouletteBet'

interface Props {
  currentBets: RouletteBet[]
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

// Mobile-friendly grid (3 columns x 12 rows)
const mobileNumbers = computed(() => Array.from({ length: 36 }, (_, i) => i + 1))

const outsideBets = computed(() => ({
  dozens: [
    { type: 'dozen' as BetType, label: t('roulette.table.bets.dozen1'), numbers: Array.from({ length: 12 }, (_, i) => i + 1), btnClass: 'btn-outline-primary' },
    { type: 'dozen' as BetType, label: t('roulette.table.bets.dozen2'), numbers: Array.from({ length: 12 }, (_, i) => i + 13), btnClass: 'btn-outline-primary' },
    { type: 'dozen' as BetType, label: t('roulette.table.bets.dozen3'), numbers: Array.from({ length: 12 }, (_, i) => i + 25), btnClass: 'btn-outline-primary' }
  ],
  evenMoney: [
    { type: 'low' as BetType, label: t('roulette.table.bets.low'), numbers: Array.from({ length: 18 }, (_, i) => i + 1), btnClass: 'btn-outline-secondary' },
    { type: 'even' as BetType, label: t('roulette.table.bets.even'), numbers: Array.from({ length: 18 }, (_, i) => (i + 1) * 2), btnClass: 'btn-outline-secondary' },
    { type: 'red' as BetType, label: t('roulette.table.bets.red'), numbers: redNumbers, btnClass: 'btn-danger' },
    { type: 'black' as BetType, label: t('roulette.table.bets.black'), numbers: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35], btnClass: 'btn-dark' },
    { type: 'odd' as BetType, label: t('roulette.table.bets.odd'), numbers: Array.from({ length: 18 }, (_, i) => i * 2 + 1), btnClass: 'btn-outline-secondary' },
    { type: 'high' as BetType, label: t('roulette.table.bets.high'), numbers: Array.from({ length: 18 }, (_, i) => i + 19), btnClass: 'btn-outline-secondary' }
  ]
}))
</script>

<template>
  <div class="d-flex flex-column gap-3 gap-md-4">
    <div class="roulette-card">
      <div class="roulette-card-header">
        <div>
          <h3 class="roulette-section-title mb-1">{{ t('roulette.table.quickBetsTitle') }}</h3>
          <p class="roulette-hint mb-0">{{ t('roulette.table.quickBetsHint') }}</p>
        </div>
      </div>
      <div class="roulette-card-body">
        <div class="row g-2">
          <div v-for="bet in outsideBets.dozens" :key="bet.label" class="col-4">
            <button
              :class="`btn roulette-btn w-100 ${bet.btnClass} ${getOutsideBetAmount(bet.numbers) > 0 ? 'active position-relative' : ''}`"
              :aria-label="t('roulette.ui.placeBetOnGroup', { label: bet.label })"
              @click="onPlaceBet(bet.type, bet.numbers, currentBetAmount)">
              {{ bet.label }}
              <span
                v-if="getOutsideBetAmount(bet.numbers) > 0"
                class="position-absolute badge rounded-pill bg-warning text-dark roulette-bet-badge">
                {{ formatCurrency(getOutsideBetAmount(bet.numbers)) }}
              </span>
            </button>
          </div>
        </div>

        <div class="row g-2 mt-2">
          <div v-for="bet in outsideBets.evenMoney" :key="bet.label" class="col-4 col-md-2">
            <button
              :class="`btn roulette-btn w-100 ${bet.btnClass} ${getOutsideBetAmount(bet.numbers) > 0 ? 'active position-relative' : ''}`"
              :aria-label="t('roulette.ui.placeBetOnGroup', { label: bet.label })"
              @click="onPlaceBet(bet.type, bet.numbers, currentBetAmount)">
              {{ bet.label }}
              <span
                v-if="getOutsideBetAmount(bet.numbers) > 0"
                class="position-absolute badge rounded-pill bg-warning text-dark roulette-bet-badge">
                {{ formatCurrency(getOutsideBetAmount(bet.numbers)) }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="roulette-card">
      <div class="roulette-card-header">
        <div>
          <h3 class="roulette-section-title mb-1">{{ t('roulette.table.numberGridTitle') }}</h3>
          <p class="roulette-hint mb-0">{{ t('roulette.table.numberGridHint') }}</p>
        </div>
        <div class="roulette-chip d-none d-md-inline-flex">
          {{ t('roulette.table.straightBetLabel') }}
        </div>
      </div>
      <div class="roulette-card-body">
        <div class="roulette-grid-wrap d-none d-md-grid">
          <button
            :class="`btn btn-success roulette-zero-btn roulette-btn ${getBetAmount(0) > 0 ? 'active position-relative' : ''}`"
            :aria-label="t('roulette.ui.placeBetOnNumber', { number: 0 })"
            @click="onPlaceBet('straight', [0], currentBetAmount)">
            {{ t('roulette.table.zero') }}
            <span
              v-if="getBetAmount(0) > 0"
              class="position-absolute badge rounded-pill bg-warning text-dark roulette-bet-badge">
              {{ formatCurrency(getBetAmount(0)) }}
            </span>
          </button>
          <div class="roulette-number-grid roulette-number-grid-desktop">
            <template v-for="(row, rowIndex) in numberGrid" :key="rowIndex">
              <button
                v-for="num in row"
                :key="num"
                :class="getNumberButtonClass(num)"
                :aria-label="t('roulette.ui.placeBetOnNumber', { number: num })"
                class="roulette-number-btn roulette-btn fw-bold"
                @click="onPlaceBet('straight', [num], currentBetAmount)">
                {{ num }}
                <span
                  v-if="getBetAmount(num) > 0"
                  class="position-absolute badge rounded-pill bg-warning text-dark roulette-bet-badge">
                  {{ formatCurrency(getBetAmount(num)) }}
                </span>
              </button>
            </template>
          </div>
        </div>

        <div class="d-md-none">
          <div class="mb-2">
            <button
              :class="`btn btn-success roulette-zero-btn roulette-btn w-100 ${getBetAmount(0) > 0 ? 'active position-relative' : ''}`"
              :aria-label="t('roulette.ui.placeBetOnNumber', { number: 0 })"
              @click="onPlaceBet('straight', [0], currentBetAmount)">
              {{ t('roulette.table.zero') }}
              <span
                v-if="getBetAmount(0) > 0"
                class="position-absolute badge rounded-pill bg-warning text-dark roulette-bet-badge">
                {{ formatCurrency(getBetAmount(0)) }}
              </span>
            </button>
          </div>
          <div class="roulette-number-grid roulette-number-grid-mobile">
            <button
              v-for="num in mobileNumbers"
              :key="num"
              :class="getNumberButtonClass(num)"
              :aria-label="t('roulette.ui.placeBetOnNumber', { number: num })"
              class="roulette-number-btn roulette-btn fw-bold"
              @click="onPlaceBet('straight', [num], currentBetAmount)">
              {{ num }}
              <span
                v-if="getBetAmount(num) > 0"
                class="position-absolute badge rounded-pill bg-warning text-dark roulette-bet-badge">
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
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700;800&display=swap');

.roulette-hint {
  color: #475569;
  font-size: 0.95rem;
}

.roulette-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 1rem;
  font-family: "Atkinson Hyperlegible", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
}

.roulette-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.roulette-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.roulette-section-title {
  font-size: 1.1rem;
  font-weight: 700;
}

.roulette-chip {
  align-items: center;
  background: #eff6ff;
  color: #1d4ed8;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.35rem 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.roulette-btn {
  min-height: 44px;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.roulette-btn:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.4);
  outline-offset: 2px;
}

.roulette-bet-badge {
  font-size: 0.65rem;
  z-index: 5;
  top: -8px;
  right: -8px;
}

.roulette-grid-wrap {
  --roulette-grid-gap: 0.5rem;
  --roulette-row-height: 46px;
  display: grid;
  grid-template-columns: 70px 1fr;
  gap: var(--roulette-grid-gap);
  align-items: start;
}

.roulette-number-grid {
  display: grid;
  gap: 0.5rem;
}

.roulette-number-grid-desktop {
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-rows: var(--roulette-row-height);
}

.roulette-number-grid-mobile {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: 48px;
}

.roulette-number-btn {
  width: 100%;
  min-height: 44px;
  position: relative;
  overflow: visible;
}

.roulette-zero-btn {
  width: 100%;
  height: calc((var(--roulette-row-height) * 3) + (var(--roulette-grid-gap) * 2));
  font-size: 1.2rem;
  font-weight: 800;
}

.btn.active {
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.3);
}

@media (max-width: 767.98px) {
  .roulette-card {
    padding: 0.85rem;
  }

  .roulette-title {
    font-size: 1.4rem;
  }

  .roulette-zero-btn {
    height: auto;
    padding: 0.65rem 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .roulette-btn {
    transition: none;
  }
}
</style>
