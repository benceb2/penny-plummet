<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import GameScreen from '@/components/game/GameScreen.vue'
import GameTray from '@/components/game/GameTray.vue'
import ChipButton from '@/components/game/ChipButton.vue'
import ResultBanner from '@/components/game/ResultBanner.vue'
import RulesSheet from '@/components/game/RulesSheet.vue'
import RouletteSpinner from '@/views/roulette/RouletteSpinner.vue'
import RouletteTable from '@/views/roulette/RouletteTable.vue'
import { useRouletteStore, PAYOUT_MULTIPLIERS } from '@/stores/rouletteStore'
import { useUserStore } from '@/stores/userStore'
import { RouletteState } from '@/types/RouletteState'
import type { BetType } from '@/types/RouletteBet'
import { CHIP_DENOMINATIONS } from '@/utils/chipUtil'
import { pocketColor } from '@/utils/rouletteUtil'
import { formatIntAsCurrency } from '@/utils/numberFormatUtil'

const { t } = useI18n()

const gameStore = useRouletteStore()
const userStore = useUserStore()

const showRules = ref(false)
const showBets = ref(false)
const showResultBanner = ref(false)

// Recently completed winning numbers, most recent first. Presentation-only
// (like blackjack's local roundId/lastBet refs) so it does not survive a
// reload, which is fine: a fresh session simply starts with an empty strip.
const winningHistory = ref<number[]>([])

const availableChips = computed(() => [...CHIP_DENOMINATIONS].reverse().filter((value) => value <= userStore.chips))
const hasInsufficientChips = computed(() => userStore.chips < 1)

// The chip picker's current selection: every table tap places this amount.
// Falls back to the largest still-affordable denomination if a loss makes
// the previous selection unaffordable.
const selectedChip = ref(availableChips.value[0] ?? 1)
watch(availableChips, (chips) => {
  if (chips.length && !chips.includes(selectedChip.value)) {
    selectedChip.value = chips[chips.length - 1]
  }
})

const hasBets = computed(() => gameStore.currentBets.length > 0)

function handlePlaceBet(type: BetType, numbers: number[]) {
  gameStore.placeBet(type, numbers, selectedChip.value)
}

async function handleSpin() {
  if (!gameStore.isSpinAllowed) return
  await gameStore.spin()
}

function handleResultClose() {
  gameStore.reset()
}

watch(() => gameStore.gameState, (state) => {
  showResultBanner.value = state === RouletteState.COMPLETE
  if (state === RouletteState.COMPLETE && gameStore.lastResult) {
    winningHistory.value = [gameStore.lastResult.winningNumber, ...winningHistory.value].slice(0, 8)
  }
})

const betsSummary = computed(() => {
  if (!hasBets.value) return t('roulette.tray.noBets')
  const amount = formatIntAsCurrency(gameStore.totalBet)
  const count = gameStore.currentBets.length
  return count === 1
    ? t('roulette.tray.betsSummaryOne', { amount })
    : t('roulette.tray.betsSummary', { amount, count })
})

const spinLabel = computed(() => t('roulette.tray.spinFor', { amount: formatIntAsCurrency(gameStore.totalBet) }))

function getBetTypeLabel(type: BetType): string {
  return t(`roulette.betTypes.${type}`)
}

const resultData = computed(() => {
  if (gameStore.gameState !== RouletteState.COMPLETE || !gameStore.lastResult) {
    return { type: 'push' as const, amount: 0, headline: '' }
  }

  const { totalWin, totalBet } = gameStore.lastResult
  if (totalWin > totalBet) return { type: 'win' as const, amount: totalWin - totalBet, headline: t('roulette.result.win') }
  if (totalWin === totalBet) return { type: 'push' as const, amount: 0, headline: t('roulette.result.push') }
  return { type: 'loss' as const, amount: totalBet - totalWin, headline: t('roulette.result.loss') }
})

const resultDetail = computed(() =>
  gameStore.lastResult ? t('roulette.result.winningNumber', { number: gameStore.lastResult.winningNumber }) : undefined
)

const payoutRows = computed(() => [
  { label: t('roulette.rules.payoutStraight'), multiplier: PAYOUT_MULTIPLIERS.straight },
  { label: t('roulette.rules.payoutDozen'), multiplier: PAYOUT_MULTIPLIERS.dozen },
  { label: t('roulette.rules.payoutEvenMoney'), multiplier: PAYOUT_MULTIPLIERS.red }
])
</script>

<template>
  <GameScreen :title="t('roulette.title')" wide>
    <template #stage>
      <div class="felt">
        <div class="stage-top">
          <button
            type="button"
            class="rules-trigger"
            :aria-label="t('game.rulesAndPayouts')"
            @click="showRules = true">
            <i class="bi bi-info-circle" aria-hidden="true"></i>
          </button>
        </div>

        <div class="table-wrap">
          <div class="wheel-area">
            <RouletteSpinner
              v-if="gameStore.gameState === RouletteState.SPINNING"
              :is-spinning="gameStore.gameState === RouletteState.SPINNING"
              :winning-number="gameStore.winningNumber"
              @spin-complete="gameStore.completeGame" />
            <div v-else class="history-strip" role="group" :aria-label="t('roulette.history.label')">
              <span v-if="winningHistory.length === 0" class="history-empty">{{ t('roulette.history.empty') }}</span>
              <span
                v-for="(number, index) in winningHistory"
                :key="index"
                class="history-pocket"
                :class="`history-pocket--${pocketColor(number)}`">
                {{ number }}
              </span>
            </div>
          </div>

          <RouletteTable
            :current-bets="gameStore.currentBets"
            :disabled="gameStore.gameState !== RouletteState.BETTING"
            @place-bet="handlePlaceBet" />
        </div>
      </div>

      <ResultBanner
        :show="showResultBanner"
        :type="resultData.type"
        :amount="resultData.amount"
        :headline="resultData.headline"
        :detail="resultDetail"
        @close="handleResultClose" />
    </template>

    <template #tray>
      <GameTray>
        <template v-if="gameStore.gameState === RouletteState.BETTING">
          <div v-if="hasInsufficientChips" class="insufficient-funds">
            <i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i>
            <div>
              <strong>{{ t('betAmountSelector.insufficientFunds.title') }}</strong>
              <span>{{ t('betAmountSelector.insufficientFunds.description') }}</span>
            </div>
          </div>
          <template v-else>
            <div class="chip-row">
              <ChipButton
                v-for="value in availableChips"
                :key="value"
                :value="value"
                :selected="value === selectedChip"
                @select="selectedChip = value" />
            </div>

            <div class="tray-summary">
              <span class="tray-summary-text">{{ betsSummary }}</span>
              <button
                type="button"
                class="view-bets-link"
                :disabled="!hasBets"
                @click="showBets = true">
                {{ t('roulette.bets.viewBets') }}
              </button>
            </div>

            <div class="cta-row">
              <button
                type="button"
                class="btn btn-outline-light cta-icon-btn"
                :aria-label="t('roulette.tray.undoLastBet')"
                :disabled="!hasBets"
                @click="gameStore.undoLastBet()">
                <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
              </button>
              <button
                type="button"
                class="btn btn-outline-light cta-btn cta-btn--clear"
                :disabled="!hasBets"
                @click="gameStore.clearBets()">
                {{ t('roulette.tray.clear') }}
              </button>
              <button
                type="button"
                class="btn btn-primary cta-btn cta-btn--spin cta-btn--amount"
                :disabled="!gameStore.isSpinAllowed"
                @click="handleSpin">
                {{ spinLabel }}
              </button>
            </div>
          </template>
        </template>

        <template v-else-if="gameStore.gameState === RouletteState.SPINNING">
          <div class="spin-status">{{ t('roulette.tray.spinning') }}</div>
        </template>
      </GameTray>
    </template>
  </GameScreen>

  <RulesSheet v-model:open="showRules" :title="t('roulette.rules.title')">
    <p class="text-body-secondary">{{ t('roulette.rules.summary') }}</p>
    <ul class="rules-list">
      <li>{{ t('roulette.rules.singleZero') }}</li>
      <li>{{ t('roulette.rules.straightBets') }}</li>
      <li>{{ t('roulette.rules.outsideBets') }}</li>
      <li>{{ t('roulette.rules.zeroLoses') }}</li>
    </ul>

    <h3 class="rules-payouts-title">{{ t('roulette.rules.payoutsTitle') }}</h3>
    <dl class="rules-payouts">
      <div v-for="row in payoutRows" :key="row.label">
        <dt>{{ row.label }}</dt>
        <dd>{{ t('roulette.rules.payoutRatio', { multiplier: row.multiplier }) }}</dd>
      </div>
    </dl>
  </RulesSheet>

  <RulesSheet v-model:open="showBets" :title="t('roulette.bets.title')">
    <p v-if="!hasBets" class="text-body-secondary">{{ t('roulette.bets.empty') }}</p>
    <ul v-else class="bets-list">
      <li v-for="(bet, index) in gameStore.currentBets" :key="index" class="bets-list-item">
        <span>
          {{ getBetTypeLabel(bet.type) }}
          <template v-if="bet.type === 'straight'"> ({{ bet.numbers[0] }})</template>
        </span>
        <strong>{{ formatIntAsCurrency(bet.amount) }}</strong>
      </li>
    </ul>
  </RulesSheet>
</template>

<style scoped>
.felt {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: .625rem;
  padding: .625rem .875rem .75rem;
  border-radius: 22px;
  background: radial-gradient(120% 90% at 50% 45%, var(--pp-felt) 0%, var(--pp-felt-deep) 78%, #0A2A1E 100%);
  box-shadow: inset 0 0 0 1px rgba(225, 178, 90, .14), inset 0 0 60px rgba(0, 0, 0, .35);
  touch-action: manipulation;
  user-select: none;
}

.felt::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 22px;
  border: 1px solid rgba(225, 178, 90, .16);
  pointer-events: none;
}

.stage-top {
  flex: 0 0 auto;
  display: flex;
}

.rules-trigger {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, .28);
  border: 1px solid rgba(244, 238, 223, .18);
  color: var(--pp-cream);
  opacity: .85;
}

/* Absorbs the felt's leftover height on tall desktop viewports (where the
   table's natural size is smaller than the flex-1 stage) and centres the
   wheel/history strip + table as a group, instead of leaving a blank green
   void below the table. On mobile, where the table already needs more room
   than the stage has, this has no visible effect: there is no extra space
   left to centre into. */
.table-wrap {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: .625rem;
}

.wheel-area {
  flex: 0 0 auto;
}

.history-strip {
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}

.history-empty {
  color: var(--pp-cream-dim);
  font-size: .8125rem;
}

.history-pocket {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--pp-cream);
  font-family: var(--pp-font-ui);
  font-weight: 800;
  font-size: .8125rem;
  font-variant-numeric: tabular-nums;
  border: 1px solid rgba(244, 238, 223, .18);
}

.history-pocket--red {
  background: var(--pp-card-red);
}

.history-pocket--black {
  background: var(--pp-card-black);
}

.history-pocket--green {
  background: #1C8A54;
}

.chip-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.1rem;
  padding: .375rem .25rem 0;
}

.tray-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  padding: 0 .25rem;
}

.tray-summary-text {
  font-size: .8125rem;
  color: var(--pp-cream-dim);
  font-variant-numeric: tabular-nums;
}

.view-bets-link {
  background: none;
  border: none;
  padding: 0;
  font-size: .8125rem;
  font-weight: 700;
  color: var(--pp-gold-bright);
  text-decoration: underline;
}

.view-bets-link:disabled {
  color: var(--pp-cream-dim);
  text-decoration: none;
  opacity: .5;
}

.cta-row {
  display: flex;
  gap: .625rem;
}

.cta-btn {
  flex: 1 1 0;
  height: 54px;
  border-radius: 14px;
  font-weight: 800;
  font-size: .875rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
}

.cta-btn--spin {
  flex: 1.6 1 0;
}

/* "Spin · $x" runs noticeably longer than "Clear" once a real amount is
   interpolated in; a smaller size keeps it on one line at phone widths
   instead of wrapping inside the 54px button (mirrors blackjack's Deal). */
.cta-btn--amount {
  font-size: .75rem;
  letter-spacing: .06em;
}

.cta-icon-btn {
  flex: 0 0 54px;
  width: 54px;
  height: 54px;
  border-radius: 14px;
  padding: 0;
  display: grid;
  place-items: center;
  font-size: 1.125rem;
}

.spin-status {
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--pp-cream-dim);
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  font-size: .8125rem;
}

.insufficient-funds {
  display: flex;
  align-items: flex-start;
  gap: .625rem;
  padding: .25rem;
  color: var(--pp-cream-dim);
  font-size: .875rem;
}

.insufficient-funds i {
  color: var(--pp-loss);
  font-size: 1.125rem;
  margin-top: .125rem;
}

.insufficient-funds strong {
  display: block;
  color: var(--pp-cream);
}

.rules-list {
  padding-left: 1.125rem;
  margin-bottom: 1rem;
}

.rules-list li {
  margin-bottom: .5rem;
  color: var(--pp-cream-dim);
}

.rules-payouts-title {
  margin-top: 1.5rem;
  margin-bottom: .75rem;
  font-family: var(--pp-font-display);
  font-size: 1rem;
  font-weight: 700;
}

.rules-payouts {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  margin: 0;
}

.rules-payouts > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
}

.rules-payouts dt {
  color: var(--pp-cream-dim);
  font-weight: 400;
}

.rules-payouts dd {
  margin: 0;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--pp-gold-bright);
}

.bets-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.bets-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  padding: .5rem 0;
  border-bottom: 1px solid var(--pp-line);
  font-size: .875rem;
}

.bets-list-item:last-child {
  border-bottom: none;
}

.bets-list-item strong {
  font-variant-numeric: tabular-nums;
  color: var(--pp-gold-bright);
}
</style>
