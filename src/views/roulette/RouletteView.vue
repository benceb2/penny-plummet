<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouletteStore, type RouletteResult, type BetType } from '@/stores/rouletteStore'
import { useUserStore } from '@/stores/userStore'
import { formatIntAsCurrency } from '@/utils/numberFormatUtil'
import RouletteSpinner from '@/views/roulette/RouletteSpinner.vue'
import RouletteTable from '@/views/roulette/RouletteTable.vue'
import BaseLayout from '@/components/layout/BaseLayout.vue'
import GameResult from '@/components/GameResult.vue'
import { RouletteState } from '@/types/RouletteState'

const { t } = useI18n()

const gameStore = useRouletteStore()
const userStore = useUserStore()
const currentBetAmount = ref(100)
const activeView = ref<'table' | 'bets'>('table')

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
  activeView.value = 'table'
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

    <!-- Betting Bar -->
    <div class="card bg-light border-0 mb-3">
      <div class="card-body py-2">
        <div class="row align-items-center g-2">

          <!-- Bet Input -->
          <div class="col-auto">
            <div class="input-group input-group-sm">
              <span class="input-group-text">
                <i class="bi bi-coin text-warning"></i>
              </span>
              <input
                type="number"
                class="form-control"
                style="max-width: 100px;"
                v-model="currentBetAmount"
                :max="maxBetAmount"
                :min="1"
                :disabled="gameStore.gameState !== RouletteState.BETTING">
              <span class="input-group-text text-muted" style="min-width: 50px;">
                {{ currentBetPercentage }}%
              </span>
            </div>
          </div>

          <!-- Quick Bet Buttons -->
          <div class="col">
            <div class="d-flex gap-1 flex-wrap">
              <button
                v-for="bet in quickBets"
                :key="bet.amount"
                class="btn btn-sm"
                :class="[
                  currentBetAmount === bet.amount ? 'btn-primary' : 'btn-outline-secondary',
                  bet.isAllIn ? 'btn-danger fw-bold' : ''
                ]"
                @click="currentBetAmount = bet.amount"
                :disabled="gameStore.gameState !== RouletteState.BETTING"
                :title="t('roulette.ui.quickBetTitle', { amount: formatIntAsCurrency(bet.amount), label: bet.label })">
                <span class="text-light" v-if="bet.isAllIn">{{ bet.label }}</span>
                <span v-else>
                  {{ formatIntAsCurrency(bet.amount) }}
                  <small class="opacity-75 ms-1">({{ bet.label }})</small>
                </span>
              </button>
              <button
                class="btn btn-danger"
                @click="gameStore.clearBets()"
                :disabled="gameStore.currentBets.length === 0 || gameStore.gameState !== RouletteState.BETTING">
                <i class="bi bi-x-circle me-2"></i>{{ t('roulette.ui.clearBets') }}
              </button>

            </div>
          </div>

          <!-- Total Bet Display -->
          <div class="col-auto ms-auto">
            <div v-if="gameStore.totalBet > 0" class="text-end">
              <small class="text-muted d-block" style="font-size: 0.7rem;">{{ t('roulette.ui.totalBet') }}</small>
              <strong class="text-primary">{{ formatIntAsCurrency(gameStore.totalBet) }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Result Alert -->
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

    <!-- Spinner and Betting Info During Spin -->
    <div v-if="gameStore.gameState === RouletteState.SPINNING" class="mb-3">
      <RouletteSpinner
        :is-spinning="gameStore.gameState === RouletteState.SPINNING"
        :winning-number="gameStore.winningNumber"
        @spin-complete="gameStore.completeGame" />

      <!-- Show current bets while spinning -->
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

    <!-- Main Game Area -->
    <div class="card mb-3" v-if="gameStore.gameState === RouletteState.BETTING">
      <div class="card-header">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item">
            <a
              class="nav-link"
              :class="{ active: activeView === 'table' }"
              href="#"
              @click.prevent="activeView = 'table'">
              <i class="bi bi-grid-3x3-gap me-2"></i>{{ t('roulette.ui.tableTab') }}
            </a>
          </li>
          <li class="nav-item">
            <a
              class="nav-link position-relative"
              :class="{ active: activeView === 'bets' }"
              href="#"
              @click.prevent="activeView = 'bets'">
              <i class="bi bi-list-ul me-2"></i>
              {{ t('roulette.ui.myBetsTab') }}
              <span
                v-if="gameStore.currentBets.length > 0"
                class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {{ gameStore.currentBets.length }}
              </span>
            </a>
          </li>
        </ul>
      </div>

      <div class="card-body">
        <!-- Table View -->
        <div v-show="activeView === 'table'">
          <RouletteTable
            :current-bets="gameStore.currentBets"
            :current-bet-amount="currentBetAmount"
            :on-place-bet="placeBet"
            :format-currency="formatIntAsCurrency" />
        </div>

        <!-- Bets View -->
        <div v-show="activeView === 'bets'">
          <div v-if="gameStore.currentBets.length > 0">
            <div class="list-group mb-3">
              <div
                v-for="(bet, index) in gameStore.currentBets"
                :key="index"
                class="list-group-item d-flex justify-content-between align-items-center">
                <div>
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

            <div class="alert alert-info">
              <div class="d-flex justify-content-between align-items-center">
                <strong>{{ t('roulette.ui.totalBet') }}:</strong>
                <h5 class="mb-0">{{ formatIntAsCurrency(gameStore.totalBet) }}</h5>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-5 text-muted">
            <i class="bi bi-inbox display-4 d-block mb-3"></i>
            <p>{{ t('roulette.ui.noBetsTitle') }}</p>
            <small>{{ t('roulette.ui.noBetsHint') }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="d-grid gap-2 d-md-flex justify-content-md-center">
      <button
        class="btn btn-success"
        @click="handleSpin"
        :disabled="!gameStore.isSpinAllowed || gameStore.gameState === RouletteState.SPINNING">
        <i class="bi bi-play-circle-fill me-2"></i>
        <span v-if="gameStore.gameState === RouletteState.SPINNING">
          {{ t('roulette.ui.spinning') }}
        </span>
        <span v-else>
          {{ t('roulette.ui.spinTheWheel') }}
        </span>
      </button>
    </div>
  </BaseLayout>
</template>
