<script setup lang="ts">
/**
 * The felt betting table: number grid + outside bets. Purely presentational;
 * emits `place-bet` with the bet type and numbers it covers, the caller
 * (RouletteView) decides the amount (the tray's selected chip) and calls the
 * store. Below lg: outside bets sit in a compact 2-row group above a 3-column
 * number grid with a full-width zero. At lg+: the classic 12x3 layout with a
 * tall zero column, outside bets underneath.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ChipStack from '@/components/game/ChipStack.vue'
import { pocketColor } from '@/utils/rouletteUtil'
import type { BetType, RouletteBet } from '@/types/RouletteBet'

const props = withDefaults(defineProps<{
  currentBets: RouletteBet[]
  /** Disables every cell (fieldset) once betting has closed, while keeping the placed bets visible. */
  disabled?: boolean
}>(), {
  disabled: false
})

const emit = defineEmits<{
  placeBet: [type: BetType, numbers: number[]]
}>()

const { t } = useI18n()

const straightBetAmount = (num: number): number =>
  props.currentBets
    .filter((bet) => bet.type === 'straight' && bet.numbers[0] === num)
    .reduce((total, bet) => total + bet.amount, 0)

const groupBetAmount = (numbers: number[]): number =>
  props.currentBets
    .filter((bet) =>
      bet.numbers.length === numbers.length &&
      bet.numbers.every((num) => numbers.includes(num)))
    .reduce((total, bet) => total + bet.amount, 0)

const numberGrid = computed(() => {
  const grid: number[][] = []
  for (let row = 1; row <= 3; row++) {
    const rowNumbers: number[] = []
    for (let col = 0; col < 12; col++) {
      rowNumbers.push(row + (col * 3))
    }
    grid.push(rowNumbers)
  }
  return grid
})

const mobileNumbers = computed(() => Array.from({ length: 36 }, (_, i) => i + 1))

interface OutsideBet {
  type: BetType
  label: string
  numbers: number[]
  variant: 'red' | 'black' | 'neutral'
}

const dozenBets = computed<OutsideBet[]>(() => [
  { type: 'dozen', label: t('roulette.table.bets.dozen1'), numbers: Array.from({ length: 12 }, (_, i) => i + 1), variant: 'neutral' },
  { type: 'dozen', label: t('roulette.table.bets.dozen2'), numbers: Array.from({ length: 12 }, (_, i) => i + 13), variant: 'neutral' },
  { type: 'dozen', label: t('roulette.table.bets.dozen3'), numbers: Array.from({ length: 12 }, (_, i) => i + 25), variant: 'neutral' }
])

const evenMoneyBets = computed<OutsideBet[]>(() => [
  { type: 'low', label: t('roulette.table.bets.low'), numbers: Array.from({ length: 18 }, (_, i) => i + 1), variant: 'neutral' },
  { type: 'even', label: t('roulette.table.bets.even'), numbers: Array.from({ length: 18 }, (_, i) => (i + 1) * 2), variant: 'neutral' },
  { type: 'red', label: t('roulette.table.bets.red'), numbers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36], variant: 'red' },
  { type: 'black', label: t('roulette.table.bets.black'), numbers: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35], variant: 'black' },
  { type: 'odd', label: t('roulette.table.bets.odd'), numbers: Array.from({ length: 18 }, (_, i) => i * 2 + 1), variant: 'neutral' },
  { type: 'high', label: t('roulette.table.bets.high'), numbers: Array.from({ length: 18 }, (_, i) => i + 19), variant: 'neutral' }
])
</script>

<template>
  <fieldset class="roulette-table" :disabled="disabled" :class="{ 'roulette-table--disabled': disabled }">
    <legend class="visually-hidden">{{ t('roulette.table.legend') }}</legend>
    <div class="outside-bets" role="group" :aria-label="t('roulette.table.outsideBets')">
      <button
        v-for="bet in dozenBets"
        :key="`dozen-${bet.label}`"
        type="button"
        class="outside-cell outside-cell--dozen"
        :class="{ 'outside-cell--active': groupBetAmount(bet.numbers) > 0 }"
        :aria-label="t('roulette.aria.placeBetOnGroup', { label: bet.label })"
        @click="emit('placeBet', bet.type, bet.numbers)">
        <span class="cell-label">{{ bet.label }}</span>
        <ChipStack
          v-if="groupBetAmount(bet.numbers) > 0"
          aria-hidden="true"
          class="cell-badge"
          size="sm"
          :amount="groupBetAmount(bet.numbers)"
          :chips="[groupBetAmount(bet.numbers)]" />
      </button>
      <button
        v-for="bet in evenMoneyBets"
        :key="`even-${bet.label}`"
        type="button"
        class="outside-cell outside-cell--even-money"
        :class="[`outside-cell--${bet.variant}`, { 'outside-cell--active': groupBetAmount(bet.numbers) > 0 }]"
        :aria-label="t('roulette.aria.placeBetOnGroup', { label: bet.label })"
        @click="emit('placeBet', bet.type, bet.numbers)">
        <span class="cell-label">{{ bet.label }}</span>
        <ChipStack
          v-if="groupBetAmount(bet.numbers) > 0"
          aria-hidden="true"
          class="cell-badge"
          size="sm"
          :amount="groupBetAmount(bet.numbers)"
          :chips="[groupBetAmount(bet.numbers)]" />
      </button>
    </div>

    <div class="number-board">
      <div class="number-board-mobile d-lg-none">
        <button
          type="button"
          class="number-cell number-cell--zero number-cell--zero-mobile"
          :class="{ 'number-cell--active': straightBetAmount(0) > 0 }"
          :aria-label="t('roulette.aria.placeBetOnNumber', { number: 0 })"
          @click="emit('placeBet', 'straight', [0])">
          <span class="cell-label">{{ t('roulette.table.zero') }}</span>
          <ChipStack
            v-if="straightBetAmount(0) > 0"
            aria-hidden="true"
            class="cell-badge"
            size="sm"
            :amount="straightBetAmount(0)"
            :chips="[straightBetAmount(0)]" />
        </button>
        <div class="number-grid number-grid-mobile">
          <button
            v-for="num in mobileNumbers"
            :key="num"
            type="button"
            class="number-cell"
            :class="[`number-cell--${pocketColor(num)}`, { 'number-cell--active': straightBetAmount(num) > 0 }]"
            :aria-label="t('roulette.aria.placeBetOnNumber', { number: num })"
            @click="emit('placeBet', 'straight', [num])">
            <span class="cell-label">{{ num }}</span>
            <ChipStack
              v-if="straightBetAmount(num) > 0"
              aria-hidden="true"
              class="cell-badge"
              size="sm"
              :amount="straightBetAmount(num)"
              :chips="[straightBetAmount(num)]" />
          </button>
        </div>
      </div>

      <div class="number-board-desktop d-none d-lg-flex">
        <button
          type="button"
          class="number-cell number-cell--zero number-cell--zero-desktop"
          :class="{ 'number-cell--active': straightBetAmount(0) > 0 }"
          :aria-label="t('roulette.aria.placeBetOnNumber', { number: 0 })"
          @click="emit('placeBet', 'straight', [0])">
          <span class="cell-label">{{ t('roulette.table.zero') }}</span>
          <ChipStack
            v-if="straightBetAmount(0) > 0"
            aria-hidden="true"
            class="cell-badge"
            size="sm"
            :amount="straightBetAmount(0)"
            :chips="[straightBetAmount(0)]" />
        </button>
        <div class="number-grid number-grid-desktop">
          <template v-for="(row, rowIndex) in numberGrid" :key="rowIndex">
            <button
              v-for="num in row"
              :key="num"
              type="button"
              class="number-cell"
              :class="[`number-cell--${pocketColor(num)}`, { 'number-cell--active': straightBetAmount(num) > 0 }]"
              :aria-label="t('roulette.aria.placeBetOnNumber', { number: num })"
              @click="emit('placeBet', 'straight', [num])">
              <span class="cell-label">{{ num }}</span>
              <ChipStack
                v-if="straightBetAmount(num) > 0"
                aria-hidden="true"
                class="cell-badge"
                size="sm"
                :amount="straightBetAmount(num)"
                :chips="[straightBetAmount(num)]" />
            </button>
          </template>
        </div>
      </div>
    </div>
  </fieldset>
</template>

<style scoped>
.roulette-table {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 0;
  margin: 0;
  padding: 0;
  min-width: 0;
}

.roulette-table--disabled {
  opacity: .7;
}

.outside-bets {
  order: 1;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}

.number-board {
  order: 2;
}

@media (min-width: 992px) {
  .outside-bets {
    order: 2;
    grid-template-columns: repeat(12, 1fr);
    margin-left: calc(64px + 6px);
  }

  .outside-cell--dozen {
    grid-column: span 4;
  }

  .outside-cell--even-money {
    grid-column: span 2;
  }

  .number-board {
    order: 1;
  }
}

.outside-cell {
  min-height: 44px;
  border-radius: 8px;
  padding: 4px 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  background: rgba(0, 0, 0, .22);
  border: 1px solid var(--pp-line);
  color: var(--pp-cream);
}

.outside-cell--dozen {
  grid-column: span 2;
}

.outside-cell--even-money {
  grid-column: span 1;
}

.outside-cell--red {
  background: var(--pp-card-red);
  border-color: transparent;
}

.outside-cell--black {
  background: var(--pp-card-black);
  border-color: transparent;
}

.outside-cell--active {
  box-shadow: 0 0 0 2px var(--pp-surface), 0 0 0 4px var(--pp-gold);
}

.cell-label {
  font-family: var(--pp-font-ui);
  font-size: .6875rem;
  font-weight: 800;
  letter-spacing: .02em;
  text-transform: uppercase;
  line-height: 1.15;
}

.number-board-mobile,
.number-board-desktop {
  display: flex;
  gap: 6px;
}

.number-board-mobile {
  flex-direction: column;
}

.number-cell {
  min-height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 1px solid rgba(0, 0, 0, .35);
  color: var(--pp-cream);
}

.number-cell .cell-label {
  font-size: .9375rem;
  text-transform: none;
  letter-spacing: normal;
  font-variant-numeric: tabular-nums;
}

.number-cell--red {
  background: var(--pp-card-red);
}

.number-cell--black {
  background: var(--pp-card-black);
}

.number-cell--zero {
  background: #1C8A54;
}

.number-cell--active {
  box-shadow: 0 0 0 2px var(--pp-surface), 0 0 0 4px var(--pp-gold);
}

.number-cell--zero-mobile {
  width: 100%;
}

.number-grid-mobile {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.number-board-desktop .number-cell--zero-desktop {
  flex: 0 0 64px;
}

.number-grid-desktop {
  flex: 1 1 auto;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-rows: minmax(44px, 1fr);
  gap: 6px;
}

.cell-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  z-index: 2;
}

@media (prefers-reduced-motion: reduce) {
  .number-cell,
  .outside-cell {
    transition: none;
  }
}
</style>
