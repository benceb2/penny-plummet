<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouletteStore, RouletteState, type RouletteResult, type BetType } from '@/stores/rouletteStore'
import { useUserStore } from '@/stores/userStore'
import { formatIntAsCurrency } from '@/utils/numberFormatUtil'
import RouletteSpinner from '@/components/RouletteSpinner.vue'
import RouletteTable from '@/components/RouletteTable.vue'
import BaseLayout from '@/components/layout/BaseLayout.vue'
import GameResult from '@/components/GameResult.vue'
import BetAmountSelector from '@/components/BetAmountSelector.vue'

// i18n
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

// Maximum bet amount (50% of chips or remove limit entirely)
const maxBetAmount = computed(() => userStore.chips)

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
    bootstrapIcon="dice-5">

    <!-- Result Alert -->
    <GameResult
      :show="gameStore.lastResult !== null && gameStore.gameState === RouletteState.COMPLETE"
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

    <!-- Game Result Spinner -->
    <RouletteSpinner
      :is-spinning="gameStore.gameState === RouletteState.SPINNING"
      :winning-number="gameStore.winningNumber"
      @spin-complete="gameStore.completeGame" />

    <!-- Roulette Table with Betting Controls -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-light">
            <h5 class="mb-0">
              <i class="bi bi-bullseye me-2"></i>{{ t('roulette.table.title') }}
            </h5>
          </div>
          <div class="card-body">
            <!-- Betting Controls - Now at the top -->
            <div class="row mb-4">
              <div class="col-lg-6">
                <div class="card bg-light">
                  <div class="card-body">
                    <h6 class="d-flex align-items-center mb-3">
                      <i class="bi bi-cash me-2"></i>{{ t('roulette.gameControls.betting.title') }}
                    </h6>

                    <BetAmountSelector v-model="currentBetAmount" :max-amount="maxBetAmount" :min-amount="1"
                      size="sm" />
                  </div>
                </div>
              </div>

              <div class="col-lg-6">
                <div class="card bg-light">
                  <div class="card-body">
                    <h6 class="d-flex align-items-center mb-3">
                      <i class="bi bi-list me-2"></i>{{ t('roulette.gameControls.betting.currentBets') }}
                    </h6>

                    <!-- Current Bets Display -->
                    <div v-if="gameStore.currentBets.length > 0" class="table-responsive">
                      <table class="table table-sm mb-0">
                        <tbody>
                          <tr v-for="(bet, index) in gameStore.currentBets" :key="index" class="small">
                            <td>{{ bet.type }}</td>
                            <td>{{ bet.numbers.join(', ') }}</td>
                            <td class="text-end">{{ formatIntAsCurrency(bet.amount) }}</td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr class="border-top">
                            <td colspan="2" class="text-end"><strong>Total:</strong></td>
                            <td class="text-end"><strong>{{ formatIntAsCurrency(gameStore.totalBet) }}</strong></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    <div v-else class="text-muted text-center py-3">
                      <i class="bi bi-info-circle me-2"></i>No bets placed yet
                    </div>

                    <!-- Clear Bets Button -->
                    <div class="mt-3">
                      <button class="btn btn-danger btn-sm w-100" @click="gameStore.clearBets()"
                        :disabled="gameStore.currentBets.length === 0">
                        <i class="bi bi-trash me-2"></i>{{ t('roulette.gameControls.betting.clearAllBets') }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Roulette Table -->
            <div class="table-responsive">
              <RouletteTable :current-bets="gameStore.currentBets" :current-bet-amount="currentBetAmount"
                :on-place-bet="placeBet" :format-currency="formatIntAsCurrency" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Action Controls -->
    <div class="row">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-light py-3">
            <h5 class="mb-0">
              <i class="bi bi-gear-fill me-2"></i>{{ t('roulette.gameControls.actions.title') }}
            </h5>
          </div>
          <div class="card-body">
            <div class="d-flex gap-3 justify-content-center">
              <!-- Spin Button -->
              <button class="btn btn-primary btn-lg" @click="handleSpin" :disabled="!gameStore.isSpinAllowed">
                <i class="bi bi-play-circle-fill me-2"></i>{{ t('roulette.gameControls.actions.spin') }}
              </button>

              <!-- New Game Button -->
              <button v-if="gameStore.gameState === RouletteState.COMPLETE" class="btn btn-secondary btn-lg"
                @click="handleNewGame">
                <i class="bi bi-arrow-clockwise me-2"></i>{{ t('roulette.gameControls.actions.newGame') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>
