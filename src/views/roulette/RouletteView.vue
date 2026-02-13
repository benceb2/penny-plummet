<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouletteStore } from '@/stores/rouletteStore'
import { useUserStore } from '@/stores/userStore'
import { formatIntAsCurrency } from '@/utils/numberFormatUtil'
import RouletteSpinner from '@/views/roulette/RouletteSpinner.vue'
import RouletteTable from '@/views/roulette/RouletteTable.vue'
import BaseLayout from '@/components/layout/BaseLayout.vue'
import GameScreenShell from '@/components/layout/GameScreenShell.vue'
import GameResult from '@/components/GameResult.vue'
import { RouletteState } from '@/types/RouletteState'
import type { BetType } from '@/types/RouletteBet'
import type { RouletteResult } from '@/types/RouletteResult'

const { t } = useI18n()

const gameStore = useRouletteStore()
const userStore = useUserStore()
const currentBetAmount = ref(100)

function getGameResultMessage(result: RouletteResult): string {
  if (result.totalWin > result.totalBet) {
    return t('roulette.results.win', { amount: formatIntAsCurrency(result.totalWin - result.totalBet) })
  } else if (result.totalWin === result.totalBet) {
    return t('roulette.results.push', { amount: formatIntAsCurrency(result.totalBet) })
  }

  return t('roulette.results.loss', { amount: formatIntAsCurrency(result.totalBet) })
}

function placeBet(betType: BetType, numbers: number[], amount: number) {
  if (amount <= 0 || amount > userStore.chips) return
  const potentialTotalBet = gameStore.totalBet + amount
  if (potentialTotalBet > userStore.chips) return

  gameStore.placeBet(betType, numbers, amount)
}

async function handleSpin() {
  if (!gameStore.isSpinAllowed) return

  try {
    await gameStore.spin()
  } catch (error) {
    console.error('Error during spin:', error)
  }
}

function handleNewGame() {
  gameStore.reset()
}

const maxBetAmount = computed(() => userStore.chips)

const quickBets = computed(() => {
  const chips = userStore.chips
  if (chips <= 0) return []

  const bets = [
    { amount: Math.max(1, Math.floor(chips * 0.05)), label: '5%' },
    { amount: Math.max(1, Math.floor(chips * 0.10)), label: '10%' },
    { amount: Math.max(1, Math.floor(chips * 0.25)), label: '25%' },
    { amount: Math.max(1, Math.floor(chips * 0.50)), label: '50%' },
    { amount: chips, label: t('roulette.ui.allIn'), isAllIn: true }
  ]

  return bets.filter((bet, index, self) =>
    bet.amount >= 1 &&
    self.findIndex(b => b.amount === bet.amount) === index
  )
})

function getBetTypeLabel(type: BetType): string {
  return t(`roulette.betTypes.${type}`)
}

const currentBetPercentage = computed(() => {
  if (userStore.chips === 0) return 0
  return Math.round((currentBetAmount.value / userStore.chips) * 100)
})

const gameStateText = computed(() => {
  if (gameStore.gameState === RouletteState.SPINNING) return t('roulette.ui.state.spinning')
  if (gameStore.gameState === RouletteState.COMPLETE) return t('roulette.ui.state.complete')
  return t('roulette.ui.state.betting')
})

watch(maxBetAmount, (newMaxAmount) => {
  if (currentBetAmount.value > newMaxAmount) {
    currentBetAmount.value = Math.min(Math.floor(newMaxAmount * 0.1), newMaxAmount)
  }
})

if (currentBetAmount.value === 100 && userStore.chips < 100) {
  currentBetAmount.value = Math.min(10, userStore.chips)
}
</script>

<template>
  <BaseLayout :title="t('roulette.title')" bootstrapIcon="dice-5">
    <GameResult
      :show="gameStore.lastResult !== null && gameStore.gameState === RouletteState.COMPLETE"
      :auto-dismiss="false"
      :result="gameStore.lastResult ? {
        type: gameStore.lastResult.totalWin > gameStore.lastResult.totalBet ? 'win' :
          gameStore.lastResult.totalWin === gameStore.lastResult.totalBet ? 'push' : 'loss',
        amount: gameStore.lastResult.totalWin > gameStore.lastResult.totalBet
          ? gameStore.lastResult.totalWin - gameStore.lastResult.totalBet
          : gameStore.lastResult.totalBet,
        message: getGameResultMessage(gameStore.lastResult),
        details: t('roulette.results.winningNumber', { number: gameStore.lastResult.winningNumber })
      } : { type: 'loss', amount: 0 }"
      @close="handleNewGame" />

    <GameScreenShell
      :title="t('roulette.ui.sessionTitle')"
      bootstrapIcon="layout-text-sidebar-reverse"
      :show-header="false"
      :show-mobile-sticky-actions="true"
      :metrics-aria-label="t('roulette.ui.aria.metrics')"
      :main-aria-label="t('roulette.ui.aria.main')"
      :sidebar-aria-label="t('roulette.ui.aria.sidebar')"
      :footer-actions-aria-label="t('roulette.ui.aria.mobileActions')">
      <template #metrics>
        <div class="row g-2 g-md-3 d-lg-none">
          <div class="col-12 col-md-4">
            <div class="game-ui-card game-ui-elevation-sm h-100 metric-card">
              <p class="text-muted small mb-1">{{ t('roulette.ui.metrics.totalBet') }}</p>
              <p class="h5 mb-0 text-primary">{{ formatIntAsCurrency(gameStore.totalBet) }}</p>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="game-ui-card game-ui-elevation-sm h-100 metric-card">
              <p class="text-muted small mb-1">{{ t('roulette.ui.metrics.activeBets') }}</p>
              <p class="h5 mb-0">{{ gameStore.currentBets.length }}</p>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="game-ui-card game-ui-elevation-sm h-100 metric-card">
              <p class="text-muted small mb-1">{{ t('roulette.ui.metrics.currentStake') }}</p>
              <p class="h5 mb-0">{{ formatIntAsCurrency(currentBetAmount) }} ({{ currentBetPercentage }}%)</p>
            </div>
          </div>
        </div>
      </template>

      <template #main>
        <div v-if="gameStore.gameState === RouletteState.SPINNING" class="game-ui-card game-ui-elevation-md">
          <h2 class="section-title mb-3">{{ t('roulette.ui.spinPanelTitle') }}</h2>
          <RouletteSpinner
            :is-spinning="gameStore.gameState === RouletteState.SPINNING"
            :winning-number="gameStore.winningNumber"
            @spin-complete="gameStore.completeGame" />

          <div class="row g-2 mt-2">
            <div class="col-md-6">
              <div class="card bg-light border-0 h-100">
                <div class="card-body">
                  <p class="card-title h6">{{ t('roulette.ui.yourBets') }}</p>
                  <div class="small">
                    <div
                      v-for="(bet, idx) in gameStore.currentBets.slice(0, 5)"
                      :key="idx"
                      class="d-flex justify-content-between mb-1">
                      <span>{{ getBetTypeLabel(bet.type) }} [{{ bet.numbers.slice(0, 3).join(', ') }}{{ bet.numbers.length > 3 ? '...' : '' }}]</span>
                      <strong>{{ formatIntAsCurrency(bet.amount) }}</strong>
                    </div>
                    <div v-if="gameStore.currentBets.length > 5" class="text-muted">
                      {{ t('roulette.ui.moreBets', { count: gameStore.currentBets.length - 5 }) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-md-6">
              <div class="card bg-light border-0 h-100">
                <div class="card-body">
                  <p class="card-title h6">{{ t('roulette.ui.waitingForResult') }}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <span>{{ t('roulette.ui.totalAtRisk') }}</span>
                    <p class="h4 mb-0 text-danger">{{ formatIntAsCurrency(gameStore.totalBet) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="roulette-table-section h-100 d-flex flex-column">
          <RouletteTable
            class="flex-grow-1"
            :current-bets="gameStore.currentBets"
            :current-bet-amount="currentBetAmount"
            :on-place-bet="placeBet"
            :format-currency="formatIntAsCurrency" />
        </div>
      </template>

      <template #sidebar>
        <div class="game-ui-card game-ui-elevation-md roulette-control-panel h-100">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h2 class="section-title mb-0">{{ t('roulette.ui.controlPanelTitle') }}</h2>
            <div class="d-flex gap-2 align-items-center">
              <span class="badge bg-light text-dark">{{ formatIntAsCurrency(userStore.chips) }}</span>
              <span class="badge bg-primary-subtle text-primary-emphasis">{{ gameStateText }}</span>
            </div>
          </div>

          <div class="mb-3">
            <label for="roulette-bet-amount" class="form-label small text-muted mb-1">
              {{ t('roulette.ui.betAmountLabel') }}
            </label>
            <div class="input-group input-group-sm">
              <span class="input-group-text"><i class="bi bi-coin text-warning" aria-hidden="true"></i></span>
              <input
                id="roulette-bet-amount"
                v-model.number="currentBetAmount"
                type="number"
                class="form-control game-focus-ring"
                :max="maxBetAmount"
                :min="1"
                :disabled="gameStore.gameState !== RouletteState.BETTING">
              <span class="input-group-text text-muted">{{ currentBetPercentage }}%</span>
            </div>
          </div>

          <div class="mb-3">
            <p class="small text-muted mb-2">{{ t('roulette.ui.quickBetLabel') }}</p>
            <div class="row g-2">
              <div v-for="bet in quickBets" :key="bet.amount" class="col-4 col-sm-3 col-lg-6">
                <button
                  class="btn btn-sm w-100 rounded-pill game-action-btn game-focus-ring"
                  :class="[
                    bet.isAllIn ? 'btn-danger fw-bold' : '',
                    !bet.isAllIn && currentBetAmount === bet.amount ? 'btn-primary' : '',
                    !bet.isAllIn && currentBetAmount !== bet.amount ? 'btn-outline-dark' : ''
                  ]"
                  :disabled="gameStore.gameState !== RouletteState.BETTING"
                  :title="t('roulette.ui.quickBetTitle', { amount: formatIntAsCurrency(bet.amount), label: bet.label })"
                  @click="currentBetAmount = bet.amount">
                  <span v-if="bet.isAllIn">{{ bet.label }}</span>
                  <span v-else>
                    {{ formatIntAsCurrency(bet.amount) }}
                    <small class="ms-1 text-body">({{ bet.label }})</small>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <p class="small text-muted mb-0">{{ t('roulette.ui.placedBetsLabel') }}</p>
              <span class="badge bg-primary rounded-pill">{{ gameStore.currentBets.length }}</span>
            </div>

            <div v-if="gameStore.currentBets.length > 0" class="bet-list">
              <div
                v-for="(bet, index) in gameStore.currentBets"
                :key="index"
                class="list-group-item d-flex justify-content-between align-items-center">
                <div class="bet-list-label">
                  <strong>{{ getBetTypeLabel(bet.type) }}</strong>
                  <small class="text-muted ms-2">[{{ bet.numbers.join(', ') }}]</small>
                </div>
                <span class="badge bg-primary rounded-pill">{{ formatIntAsCurrency(bet.amount) }}</span>
              </div>
            </div>

            <div v-else class="text-center py-3 text-muted small">
              <i class="bi bi-inbox d-block mb-2" aria-hidden="true"></i>
              <div>{{ t('roulette.ui.noBetsTitle') }}</div>
              <div class="text-muted">{{ t('roulette.ui.noBetsHint') }}</div>
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center gap-2 pt-2 border-top">
            <div>
              <p class="small text-muted mb-1">{{ t('roulette.ui.totalBet') }}</p>
              <strong class="text-primary">{{ formatIntAsCurrency(gameStore.totalBet) }}</strong>
            </div>
            <button
              class="btn btn-outline-danger btn-sm game-action-btn game-focus-ring"
              :disabled="gameStore.currentBets.length === 0 || gameStore.gameState !== RouletteState.BETTING"
              @click="gameStore.clearBets()">
              <i class="bi bi-x-circle me-1" aria-hidden="true"></i>
              {{ t('roulette.ui.clearBets') }}
            </button>
          </div>

          <button
            class="btn btn-success w-100 mt-3 game-action-btn game-focus-ring d-none d-lg-inline-block"
            :disabled="!gameStore.isSpinAllowed"
            @click="handleSpin">
            <i class="bi bi-play-circle-fill me-2" aria-hidden="true"></i>
            {{ t('roulette.ui.spinTheWheel') }}
          </button>
        </div>
      </template>

      <template #footerActions>
        <button
          class="btn btn-success w-100 game-action-btn game-focus-ring"
          :disabled="!gameStore.isSpinAllowed"
          @click="handleSpin">
          <i class="bi bi-play-circle-fill me-2" aria-hidden="true"></i>
          {{ t('roulette.ui.spinTheWheel') }}
        </button>
      </template>
    </GameScreenShell>
  </BaseLayout>
</template>

<style scoped>
.metric-card {
  min-height: 88px;
}

.roulette-control-panel {
  position: sticky;
  top: 1rem;
}

.bet-list {
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
}

.bet-list .list-group-item {
  border: 0;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.5rem 0.7rem;
}

.bet-list .list-group-item:last-child {
  border-bottom: 0;
}

.bet-list-label {
  max-width: 72%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.roulette-table-section {
  padding-top: 0.25rem;
}

:deep(.game-shell__body) {
  align-items: stretch;
}

@media (max-width: 991.98px) {
  .roulette-control-panel {
    position: static;
  }
}

:deep(.base-layout > .row:first-child) {
  margin-bottom: 0.75rem !important;
}
</style>
