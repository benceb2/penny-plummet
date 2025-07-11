<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouletteStore, RouletteState, type RouletteResult, type BetType } from '@/stores/rouletteStore'
import { useUserStore } from '@/stores/userStore'
import { formatIntAsCurrency } from '@/utils/currencyUtil'
import RouletteSpinner from '@/components/RouletteSpinner.vue'
import RouletteTable from '@/components/RouletteTable.vue'
import BaseLayout from '@/components/layout/BaseLayout.vue'
import GameResult from '@/components/GameResult.vue'

// i18n
const { t } = useI18n()

const gameStore = useRouletteStore()
const userStore = useUserStore()
const showStats = ref(false)
const currentBetAmount = ref(100)

// Quick bet amount presets
const quickBetAmounts = [100, 500, 1000, 5000]

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
  // Validate bet amount
  if (amount <= 0 || amount > userStore.chips) {
    return
  }

  // Check if total bets would exceed chips
  const potentialTotalBet = gameStore.totalBet + amount
  if (potentialTotalBet > userStore.chips) {
    return
  }

  gameStore.placeBet(betType, numbers, amount)
}

async function handleSpin() {
  if (!gameStore.isSpinAllowed) return

  try {
    // Deduct total bet amount from user's chips
    userStore.chips -= gameStore.totalBet

    const result = await gameStore.spin()

    // Add winnings to user's chips
    if (result.totalWin > 0) {
      userStore.chips += result.totalWin
    }
  } catch (error) {
    console.error('Error during spin:', error)
    // Handle error - maybe show a toast notification?
  }
}

function handleNewGame() {
  gameStore.reset()
}

// Watch for changes in user's chips
const maxBetAmount = computed(() => Math.min(userStore.chips, 10000))

// Watch for changes in bet amount and validate
watch([currentBetAmount, maxBetAmount], ([newBetAmount, newMaxAmount]) => {
  if (newBetAmount > newMaxAmount) {
    currentBetAmount.value = newMaxAmount
  }
})
</script>

<template>
  <BaseLayout
    :title="t('roulette.title')"
    icon="dice-5"
    :showBalance="true">

    <!-- Result Alert -->
    <GameResult
      :show="gameStore.lastResult !== null && gameStore.gameState === RouletteState.complete"
      :result="gameStore.lastResult ? {
        type: gameStore.lastResult.totalWin > gameStore.lastResult.totalBet ? 'win' :
          gameStore.lastResult.totalWin === gameStore.lastResult.totalBet ? 'push' : 'loss',
        amount: gameStore.lastResult.totalWin > gameStore.lastResult.totalBet ?
          gameStore.lastResult.totalWin - gameStore.lastResult.totalBet :
          gameStore.lastResult.totalBet,
        message: getGameResultMessage(gameStore.lastResult),
        details: t('roulette.results.winningNumber', { number: gameStore.lastResult.winningNumber })
      } : {
        type: 'loss',
        amount: 0
      }"
      @close="gameStore.lastResult = null" />

    <!-- Header Actions Slot -->
    <template #header-actions>
      <button
        class="btn btn-outline-primary"
        type="button"
        @click="showStats = !showStats">
        <i class="bi" :class="showStats ? 'bi-eye-slash' : 'bi-eye'"></i>
        {{ showStats ? t('roulette.stats.hide') : t('roulette.stats.show') }}
      </button>
    </template>

    <!-- Stats Section -->
    <div v-if="showStats" class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-light">
            <h5 class="mb-0">
              <i class="bi bi-graph-up me-2"></i>{{ t('roulette.stats.title') }}
            </h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3">
                <div class="border rounded p-3 text-center">
                  <h6 class="text-muted mb-2">
                    <i class="bi bi-collection me-1"></i>{{ t('roulette.stats.totalSpins') }}
                  </h6>
                  <span class="h4">{{ gameStore.sessionStats.spins }}</span>
                </div>
              </div>
              <div class="col-md-3">
                <div class="border rounded p-3 text-center">
                  <h6 class="text-muted mb-2">
                    <i class="bi bi-cash-stack me-1"></i>{{ t('roulette.stats.totalWagered') }}
                  </h6>
                  <span class="h4">
                    {{ formatIntAsCurrency(gameStore.sessionStats.totalWagered) }}
                  </span>
                </div>
              </div>
              <div class="col-md-3">
                <div class="border rounded p-3 text-center">
                  <h6 class="text-muted mb-2">
                    <i class="bi bi-trophy me-1"></i>{{ t('roulette.stats.biggestWin') }}
                  </h6>
                  <span class="h4 text-success">
                    {{ formatIntAsCurrency(gameStore.sessionStats.biggestWin) }}
                  </span>
                </div>
              </div>
              <div class="col-md-3">
                <div class="border rounded p-3 text-center">
                  <h6 class="text-muted mb-2">
                    <i class="bi bi-award me-1"></i>{{ t('roulette.stats.winStreak') }}
                  </h6>
                  <span class="h4">
                    {{ gameStore.sessionStats.consecutiveWins }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Result Spinner -->
    <RouletteSpinner :is-spinning="gameStore.gameState === RouletteState.spinning"
      :winning-number="gameStore.winningNumber"
      @spin-complete="gameStore.completeGame" />

    <!-- Roulette Wheel and Table -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-light">
            <h5 class="mb-0">
              <i class="bi bi-bullseye me-2"></i>{{ t('roulette.table.title') }}
            </h5>
          </div>
          <div class="card-body">
            <!-- Roulette Layout -->
            <div class="table-responsive">
              <RouletteTable :current-bets="gameStore.currentBets" :current-bet-amount="currentBetAmount"
                :on-place-bet="placeBet" :format-currency="formatIntAsCurrency" />
            </div>

            <!-- Game Controls -->
            <div class="row">
              <div class="col-12">
                <div class="card shadow-sm">
                  <div class="card-header bg-light py-3">
                    <h5 class="mb-0">
                      <i class="bi bi-joystick me-2"></i>{{ t('roulette.gameControls.title') }}
                    </h5>
                  </div>
                  <div class="card-body">
                    <div class="row g-4">
                      <!-- Betting Controls -->
                      <div class="col-md-6">
                        <div class="h-100">
                          <div class="bg-light p-4 rounded h-100">
                            <h6 class="d-flex align-items-center mb-4">
                              <i class="bi bi-cash me-2"></i>{{ t('roulette.gameControls.betting.title') }}
                            </h6>

                            <!-- Current Bets Display -->
                            <div class="mb-4">
                              <h6 class="text-muted mb-2">{{ t('roulette.gameControls.betting.currentBets') }}</h6>
                              <div class="table-responsive">
                                <table class="table table-sm">
                                  <thead>
                                    <tr>
                                      <th>{{ t('roulette.gameControls.betting.table.type') }}</th>
                                      <th>{{ t('roulette.gameControls.betting.table.numbers') }}</th>
                                      <th class="text-end">{{ t('roulette.gameControls.betting.table.amount') }}</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr v-for="(bet, index) in gameStore.currentBets" :key="index">
                                      <td>{{ bet.type }}</td>
                                      <td>{{ bet.numbers.join(', ') }}</td>
                                      <td class="text-end">{{ formatIntAsCurrency(bet.amount) }}</td>
                                    </tr>
                                  </tbody>
                                  <tfoot>
                                    <tr>
                                      <td colspan="2" class="text-end"><strong>{{
                                        t('roulette.gameControls.betting.table.total') }}</strong></td>
                                      <td class="text-end"><strong>{{ formatIntAsCurrency(gameStore.totalBet)
                                          }}</strong>
                                      </td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>

                            <!-- Bet Amount Controls -->
                            <div class="mb-4">
                              <h6 class="text-muted mb-2">{{ t('roulette.gameControls.betting.betAmount') }}</h6>
                              <div class="input-group mb-3">
                                <input type="number" class="form-control" v-model="currentBetAmount"
                                  :max="userStore.chips"
                                  min="1">
                                <button v-for="amount in quickBetAmounts" :key="amount"
                                  class="btn btn-outline-secondary"
                                  @click="currentBetAmount = amount">
                                  {{ formatIntAsCurrency(amount) }}
                                </button>
                              </div>
                            </div>

                            <!-- Clear Bets Button -->
                            <button class="btn btn-danger w-100" @click="gameStore.clearBets()"
                              :disabled="gameStore.currentBets.length === 0">
                              <i class="bi bi-trash me-2"></i>{{ t('roulette.gameControls.betting.clearAllBets') }}
                            </button>
                          </div>
                        </div>
                      </div>

                      <!-- Action Controls -->
                      <div class="col-md-6">
                        <div class="h-100">
                          <div class="bg-light p-4 rounded h-100">
                            <h6 class="d-flex align-items-center mb-4">
                              <i class="bi bi-gear-fill me-2"></i>{{ t('roulette.gameControls.actions.title') }}
                            </h6>

                            <div class="d-grid gap-3">
                              <!-- Spin Button -->
                              <button class="btn btn-primary btn-lg" @click="handleSpin"
                                :disabled="!gameStore.isSpinAllowed">
                                <i class="bi bi-play-circle-fill me-2"></i>{{ t('roulette.gameControls.actions.spin') }}
                              </button>

                              <!-- New Game Button -->
                              <button v-if="gameStore.gameState === RouletteState.complete"
                                class="btn btn-secondary btn-lg"
                                @click="handleNewGame">
                                <i class="bi bi-arrow-clockwise me-2"></i>{{ t('roulette.gameControls.actions.newGame')
                                }}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>
