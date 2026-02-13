<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouletteStore } from '@/stores/rouletteStore'
import { useUserStore } from '@/stores/userStore'
import { formatIntAsCurrency } from '@/utils/numberFormatUtil'
import RouletteSpinner from '@/views/roulette/RouletteSpinner.vue'
import RouletteTable from '@/views/roulette/RouletteTable.vue'
import BaseLayout from '@/components/layout/BaseLayout.vue'
import GameResult from '@/components/GameResult.vue'
import { RouletteState } from '@/types/RouletteState'
import type { BetType } from '@/types/RouletteBet'
import type { RouletteResult } from '@/types/RouletteResult'

const { t } = useI18n()

const gameStore = useRouletteStore()
const userStore = useUserStore()
const currentBetAmount = ref(100)

// Game message formatting
function getGameResultMessage(result: RouletteResult): string {
  if (result.totalWin > result.totalBet) {
    return t('roulette.results.win', { amount: formatIntAsCurrency(result.totalWin - result.totalBet) })
  } else if (result.totalWin === result.totalBet) {
    return t('roulette.results.push', { amount: formatIntAsCurrency(result.totalBet) })
  } else {
    return t('roulette.results.loss', { amount: formatIntAsCurrency(result.totalBet) })
  }
}

// Game action handlers
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

// Quick bet presets with percentages
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

  // Filter out duplicates and very small amounts
  return bets.filter((bet, index, self) =>
    bet.amount >= 1 &&
    self.findIndex(b => b.amount === bet.amount) === index
  )
})

function getBetTypeLabel(type: BetType): string {
  return t(`roulette.betTypes.${type}`)
}

// Get current bet percentage
const currentBetPercentage = computed(() => {
  if (userStore.chips === 0) return 0
  return Math.round((currentBetAmount.value / userStore.chips) * 100)
})

// Set initial bet amount to a reasonable default
watch(maxBetAmount, (newMaxAmount) => {
  if (currentBetAmount.value > newMaxAmount) {
    currentBetAmount.value = Math.min(Math.floor(newMaxAmount * 0.1), newMaxAmount)
  }
})

// Initialize current bet amount
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
        amount: gameStore.lastResult.totalWin > gameStore.lastResult.totalBet ?
          gameStore.lastResult.totalWin - gameStore.lastResult.totalBet :
          gameStore.lastResult.totalBet,
        message: getGameResultMessage(gameStore.lastResult),
        details: t('roulette.results.winningNumber', { number: gameStore.lastResult.winningNumber })
      } : { type: 'loss', amount: 0 }"
      @close="handleNewGame" />

    
    <div v-if="gameStore.gameState === RouletteState.SPINNING" class="mb-2 mb-md-3">
      <RouletteSpinner
        :is-spinning="gameStore.gameState === RouletteState.SPINNING"
        :winning-number="gameStore.winningNumber"
        @spin-complete="gameStore.completeGame" />

      
      <div class="row g-2 mt-2">
        <div class="col-md-6">
          <div class="card bg-light">
            <div class="card-body">
              <h6 class="card-title">{{ t('roulette.ui.yourBets') }}</h6>
              <div class="small">
                <div v-for="(bet, idx) in gameStore.currentBets.slice(0, 5)" :key="idx"
                  class="d-flex justify-content-between mb-1">
                  <span>{{ getBetTypeLabel(bet.type) }} [{{ bet.numbers.slice(0, 3).join(', ') }}{{ bet.numbers.length >
                    3 ? '...' : ''
                  }}]</span>
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
          <div class="card bg-light">
            <div class="card-body">
              <h6 class="card-title">{{ t('roulette.ui.waitingForResult') }}</h6>
              <div class="d-flex justify-content-between align-items-center">
                <span>{{ t('roulette.ui.totalAtRisk') }}:</span>
                <h4 class="mb-0 text-danger">{{ formatIntAsCurrency(gameStore.totalBet) }}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <div class="row g-3 roulette-layout" v-if="gameStore.gameState === RouletteState.BETTING">
      <div class="col-12 col-lg-8 order-2 order-lg-1">
        <div class="card shadow-sm">
          <div class="card-header bg-white d-flex align-items-center justify-content-between">
            <h6 class="mb-0">{{ t('roulette.table.title') }}</h6>
          </div>
          <div class="card-body">
            <RouletteTable
              :current-bets="gameStore.currentBets"
              :current-bet-amount="currentBetAmount"
              :on-place-bet="placeBet"
              :format-currency="formatIntAsCurrency" />
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-4 order-1 order-lg-2">
        <div class="card bet-slip-card h-100 shadow-sm">
          <div class="card-header bg-white">
            <div class="d-flex align-items-center justify-content-between">
              <h6 class="mb-0">{{ t('roulette.ui.betSlip') }}</h6>
              <span class="badge bg-light text-dark">{{ formatIntAsCurrency(userStore.chips) }}</span>
            </div>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <div class="d-flex align-items-center justify-content-between mb-1">
                <div class="step-label">
                  <span class="badge bg-secondary me-2">1</span>
                  <span class="text-muted">{{ t('roulette.ui.stepAmount') }}</span>
                </div>
                <small class="text-muted">{{ t('roulette.ui.stepAmountHint') }}</small>
              </div>
              <div class="input-group input-group-sm">
                <span class="input-group-text">
                  <i class="bi bi-coin text-warning" aria-hidden="true"></i>
                </span>
                <input
                  id="roulette-bet-amount"
                  type="number"
                  class="form-control"
                  v-model="currentBetAmount"
                  :max="maxBetAmount"
                  :min="1"
                  :disabled="gameStore.gameState !== RouletteState.BETTING">
                <span class="input-group-text text-muted">
                  {{ currentBetPercentage }}%
                </span>
              </div>
            </div>

            <div class="mb-3">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="step-label">
                  <span class="badge bg-secondary me-2">2</span>
                  <span class="text-muted">{{ t('roulette.ui.stepQuick') }}</span>
                </div>
              </div>
              <div class="row g-2 quick-bets">
                <div v-for="bet in quickBets" :key="bet.amount" class="col-4 col-sm-3 col-lg-6">
                  <button
                    class="btn btn-sm w-100 text-nowrap rounded-pill"
                    :class="[
                      bet.isAllIn ? 'btn-danger all-in-btn fw-bold' : '',
                      !bet.isAllIn && currentBetAmount === bet.amount ? 'btn-primary' : '',
                      !bet.isAllIn && currentBetAmount !== bet.amount ? 'btn-outline-dark' : ''
                    ]"
                    @click="currentBetAmount = bet.amount"
                    :disabled="gameStore.gameState !== RouletteState.BETTING"
                    :title="t('roulette.ui.quickBetTitle', { amount: formatIntAsCurrency(bet.amount), label: bet.label })">
                    <span class="text-white" v-if="bet.isAllIn">{{ bet.label }}</span>
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
                <div class="step-label">
                  <span class="badge bg-secondary me-2">3</span>
                  <span class="text-muted">{{ t('roulette.ui.stepPlace') }}</span>
                </div>
                <span class="badge bg-primary rounded-pill">
                  {{ gameStore.currentBets.length }}
                </span>
              </div>
              <div v-if="gameStore.currentBets.length > 0" class="mt-2">
                <details class="bet-details">
                  <summary class="text-primary">
                    {{ t('roulette.ui.viewBets') }}
                  </summary>
                  <div class="list-group bet-list mt-2">
                    <div
                      v-for="(bet, index) in gameStore.currentBets"
                      :key="index"
                      class="list-group-item d-flex justify-content-between align-items-center">
                      <div class="bet-list-label">
                        <strong>{{ getBetTypeLabel(bet.type) }}</strong>
                        <small class="text-muted ms-2">
                          [{{ bet.numbers.join(', ') }}]
                        </small>
                      </div>
                      <span class="badge bg-primary rounded-pill">
                        {{ formatIntAsCurrency(bet.amount) }}
                      </span>
                    </div>
                  </div>
                </details>
              </div>
              <div v-else class="text-center py-3 text-muted small">
                <i class="bi bi-inbox d-block mb-2" aria-hidden="true"></i>
                <div>{{ t('roulette.ui.noBetsTitle') }}</div>
                <div class="text-muted">{{ t('roulette.ui.noBetsHint') }}</div>
              </div>
            </div>

            <div class="d-flex justify-content-between align-items-center bet-total gap-2">
              <div class="d-flex align-items-center gap-2">
                <span class="text-muted">{{ t('roulette.ui.totalBet') }}</span>
                <strong class="text-primary">{{ formatIntAsCurrency(gameStore.totalBet) }}</strong>
              </div>
              <button
                class="btn btn-outline-danger btn-sm"
                @click="gameStore.clearBets()"
                :disabled="gameStore.currentBets.length === 0 || gameStore.gameState !== RouletteState.BETTING">
                <i class="bi bi-x-circle me-2" aria-hidden="true"></i>{{ t('roulette.ui.clearBets') }}
              </button>
            </div>
          </div>
          <div class="card-footer bg-white border-0">
            <div class="step-label mb-2">
              <span class="badge bg-secondary me-2">4</span>
              <span class="text-muted">{{ t('roulette.ui.stepSpin') }}</span>
            </div>
            <button
              class="btn btn-success w-100"
              @click="handleSpin"
              :disabled="!gameStore.isSpinAllowed">
              <i class="bi bi-play-circle-fill me-2" aria-hidden="true"></i>
              <span>{{ t('roulette.ui.spinTheWheel') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<style scoped>
.all-in-btn {
  background-color: #b02a37;
  border-color: #842029;
}

.all-in-btn:hover {
  background-color: #842029;
  border-color: #661d28;
}

.bet-slip-card {
  position: sticky;
  top: 1rem;
}

.quick-bets .btn {
  width: 100%;
}

@media (min-width: 768px) {
  .quick-bets .btn {
    width: auto;
  }
}

.bet-slip-card .list-group-item {
  padding: 0.4rem 0.6rem;
}

.bet-list {
  max-height: 220px;
  overflow-y: auto;
}

.bet-list-label {
  max-width: 70%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bet-total {
  padding-top: 0.5rem;
  border-top: 1px dashed #dfe3e8;
}

.bet-details summary {
  cursor: pointer;
  list-style: none;
}

.bet-details summary::-webkit-details-marker {
  display: none;
}

.step-label {
  display: inline-flex;
  align-items: center;
}

@media (max-width: 767px) {
  .card-body {
    padding: 0.5rem;
  }

  .quick-bets .btn {
    font-size: 0.8rem;
  }

  .bet-list {
    max-height: 180px;
  }

  .bet-slip-card {
    position: static;
  }

  :deep(.base-layout) {
    padding-top: 0.5rem !important;
    padding-bottom: 0.5rem !important;
  }

  :deep(.base-layout > .row) {
    margin-bottom: 0.5rem;
  }
}
</style>
