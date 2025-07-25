<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { useBlackjackStore } from '@/stores/blackjackStore'
import { useUserStore } from '@/stores/userStore'
import PlayingCard from '@/components/PlayingCard.vue'
import { BlackjackState } from '@/types/BlackjackGameState'
import BaseLayout from '@/components/layout/BaseLayout.vue'
import { formatIntAsCurrency } from '@/utils/currencyUtil'

const { t } = useI18n()

const gameStore = useBlackjackStore()
const userStore = useUserStore()
const betAmount = ref(0)
const showStats = ref(false)

const PERCENTAGE_BETS = [0.05, 0.10, 0.25, 0.50] // 5%, 10%, 25%, 50% of current chips

const quickBetAmounts = computed(() => {
  return PERCENTAGE_BETS.map(percentage => {
    // Calculate the bet amount based on percentage of current chips
    const amount = Math.floor(userStore.chips * percentage)
    // Ensure minimum bet of 1 chip
    return Math.max(1, amount)
  })
})

const gameStatus = computed(() => {
  if (gameStore.gameState === BlackjackState.GAME_OVER) {
    if (gameStore.playerScore > 21) {
      return t('blackjack.gameStatus.bust')
    } else if (gameStore.dealerScore > 21) {
      return t('blackjack.gameStatus.dealerBusts')
    } else if (gameStore.playerScore > gameStore.dealerScore) {
      return t('blackjack.gameStatus.youWin')
    } else if (gameStore.playerScore < gameStore.dealerScore) {
      return t('blackjack.gameStatus.dealerWins')
    } else {
      return t('blackjack.gameStatus.push')
    }
  }
  return ''
})

function handleDeal() {
  if (betAmount.value > 0 && betAmount.value <= userStore.chips) {
    userStore.updateChips(-betAmount.value) // Deduct bet amount
    gameStore.currentBet = betAmount.value
    gameStore.dealCards()
  }
}

function handleHit() {
  gameStore.hit()
}

function handleStand() {
  gameStore.stand()
}

function handleNewGame() {
  gameStore.reset()
  betAmount.value = 0
}

function setPresetBet(amount: number) {
  if (amount <= userStore.chips) {
    betAmount.value = amount
  }
}

function adjustBet(multiplierStr: string) {
  betAmount.value = Math.floor(betAmount.value * getMultiplier(multiplierStr))
}

function getMultiplier(multiplierStr: string) {
  switch (multiplierStr) {
    case '1/4x': return 0.25
    case '1/2x': return 0.5
    case '2x': return 2
    case '4x': return 4
    default: return 1
  }
}

function canAdjustBet(multiplierStr: string) {
  if (betAmount.value <= 0) return false
  return betAmount.value * getMultiplier(multiplierStr) <= userStore.chips
}

</script>

<template>
  <BaseLayout
    :title="t('blackjack.title')"
    icon="suit-spade-fill">
    <!-- Header Actions Slot -->
    <template #header-actions>
      <button
        class="btn btn-outline-primary"
        type="button"
        @click="showStats = !showStats">
        <i class="bi" :class="showStats ? 'bi-eye-slash' : 'bi-eye'"></i>
        {{ showStats ? t('blackjack.stats.hideStats') : t('blackjack.stats.viewStats') }}
      </button>
    </template>

    <!-- Main Content -->

    <!-- Stats Section -->
    <div v-if="showStats" class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-light">
            <h5 class="mb-0">
              <i class="bi bi-graph-up me-2"></i>{{ t('blackjack.stats.title') }}
            </h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-4">
                <div class="border rounded p-3 text-center">
                  <h6 class="text-muted mb-2">
                    <i class="bi bi-collection me-1"></i>{{ t('blackjack.stats.handsPlayed') }}
                  </h6>
                  <span class="h4">{{ userStore.stats.handsPlayed }}</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="border rounded p-3 text-center">
                  <h6 class="text-muted mb-2">
                    <i class="bi bi-cash-stack me-1"></i>{{ t('blackjack.stats.totalWinnings') }}
                  </h6>
                  <span class="h4"
                    :class="{ 'text-success': userStore.stats.totalWinnings > 0, 'text-danger': userStore.stats.totalWinnings < 0 }">
                    {{ formatIntAsCurrency(userStore.stats.totalWinnings) }}
                  </span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="border rounded p-3 text-center">
                  <h6 class="text-muted mb-2">
                    <i class="bi bi-trophy me-1"></i>{{ t('blackjack.stats.biggestWin') }}
                  </h6>
                  <span class="h4 text-success">
                    {{ formatIntAsCurrency(userStore.stats.biggestWin) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Status Alert -->
    <div v-if="gameStore.gameState === BlackjackState.GAME_OVER" class="alert mb-4" :class="{
      'alert-success': gameStatus.includes(t('blackjack.gameStatus.youWin')),
      'alert-danger': gameStatus.includes(t('blackjack.gameStatus.dealerWins')),
      'alert-warning': gameStatus.includes(t('blackjack.gameStatus.push'))
    }" role="alert">
      <div class="d-flex justify-content-between align-items-center">
        <span class="h5 mb-0">
          <i class="bi" :class="{
            'bi-trophy-fill': gameStatus.includes(t('blackjack.gameStatus.youWin')),
            'bi-x-circle-fill': gameStatus.includes(t('blackjack.gameStatus.dealerWins')),
            'bi-dash-circle-fill': gameStatus.includes(t('blackjack.gameStatus.push'))
          }"></i>
          {{ gameStatus }}
        </span>
      </div>
    </div>

    <!-- Dealer's Hand -->
    <div v-if="gameStore.dealerHand.length" class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-light">
            <div class="d-flex align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-person-fill me-2"></i>{{ t('blackjack.dealer.hand') }}
              </h5>
              <span class="badge bg-dark ms-2">
                {{ gameStore.dealerScore }}
              </span>
            </div>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-center">
              <div class="hand-display">
                <PlayingCard v-for="(card, index) in gameStore.dealerHand" :key="index" :card="card" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Player's Hand -->
    <div v-if="gameStore.playerHand.length" class="row mb-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-light">
            <div class="d-flex align-items-center">
              <h5 class="mb-0">
                <i class="bi bi-person-circle me-2"></i>{{ t('blackjack.player.hand') }}
              </h5>
              <span class="badge bg-dark ms-2">
                {{ gameStore.playerScore }}
              </span>
            </div>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-center">
              <div class="hand-display">
                <PlayingCard v-for="(card, index) in gameStore.playerHand" :key="index" :card="card" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Controls -->
    <div class="row">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-light py-3">
            <h5 class="mb-0">
              <i class="bi bi-joystick me-2"></i>{{ t('blackjack.controls.title') }}
            </h5>
          </div>
          <div class="card-body">
            <div class="row g-4">
              <!-- Betting Section -->
              <div class="col-md-6" v-if="gameStore.gameState === BlackjackState.BETTING">
                <div class="h-100">
                  <div class="bg-light p-4 rounded h-100">
                    <h6 class="d-flex align-items-center mb-4">
                      <i class="bi bi-lightning-fill me-2"></i>{{ t('blackjack.controls.placeBet') }}
                    </h6>

                    <!-- Custom Bet Input -->
                    <div class="mb-4">
                      <div class="form-floating">
                        <input type="number" class="form-control form-control-lg" id="betAmount" v-model="betAmount"
                          :max="userStore.chips" min="1">
                        <label for="betAmount" class="d-flex align-items-center">
                          <i class="bi bi-cash me-2"></i>{{ t('blackjack.controls.betAmount') }}
                        </label>
                      </div>
                    </div>

                    <!-- Adjust Bet Controls -->
                    <div>
                      <div class="d-flex align-items-center gap-2 mb-2">
                        <h6 class="mb-0">{{ t('blackjack.controls.adjustBet') }}</h6>
                      </div>
                      <div class="btn-group w-100">
                        <button v-for="multiplier in ['1/4x', '1/2x', '2x', '4x']" :key="multiplier"
                          class="btn btn-outline-secondary" @click="adjustBet(multiplier)"
                          :disabled="!canAdjustBet(multiplier)">
                          {{ multiplier }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Controls -->
              <div
                :class="`col-md-${[BlackjackState.PLAYER_TURN, BlackjackState.GAME_OVER].includes(gameStore.gameState) ? '12' : '6'}`">
                <div class="h-100">
                  <div class="bg-light p-4 rounded h-100">
                    <h6 class="d-flex align-items-center mb-4">
                      <i class="bi bi-gear-fill me-2"></i>{{ t('blackjack.controls.actions') }}
                    </h6>

                    <!-- Betting State -->
                    <div v-if="gameStore.gameState === BlackjackState.BETTING">
                      <!-- Quick Bet -->
                      <div class="mb-4">
                        <div class="d-flex align-items-center gap-2 mb-2">
                          <h6 class="mb-0">{{ t('blackjack.controls.quickBet') }}</h6>
                        </div>
                        <div class="d-grid gap-2">
                          <button v-for="amount in quickBetAmounts" :key="amount"
                            class="btn btn-outline-primary text-start p-3" :class="{ 'active': betAmount === amount }"
                            :disabled="amount > userStore.chips" @click="setPresetBet(amount)">
                            <div class="d-flex justify-content-between align-items-center">
                              <span>{{ formatIntAsCurrency(amount) }}</span>
                              <small class="text-muted">{{ Math.round((amount / userStore.chips) * 100) }}%</small>
                            </div>
                          </button>
                        </div>
                      </div>

                      <button class="btn btn-primary btn-lg w-100 mt-3" @click="handleDeal"
                        :disabled="betAmount <= 0 || betAmount > userStore.chips">
                        <i class="bi bi-play-circle-fill me-2"></i>{{ t('blackjack.controls.dealCards') }}
                      </button>
                    </div>

                    <!-- Player Turn State -->
                    <div v-if="gameStore.gameState === BlackjackState.PLAYER_TURN"
                      class="d-flex gap-3 justify-content-center">
                      <button class="btn btn-success btn-lg" @click="handleHit">
                        <i class="bi bi-plus-circle-fill me-2"></i>{{ t('blackjack.controls.hit') }}
                      </button>
                      <button class="btn btn-warning btn-lg text-white" @click="handleStand">
                        <i class="bi bi-hand-thumbs-up-fill me-2"></i>{{ t('blackjack.controls.stand') }}
                      </button>
                    </div>

                    <!-- Game Over State -->
                    <div v-if="gameStore.gameState === BlackjackState.GAME_OVER" class="d-flex justify-content-center">
                      <button class="btn btn-primary btn-lg" @click="handleNewGame">
                        <i class="bi bi-arrow-clockwise me-2"></i>{{ t('blackjack.controls.newGame') }}
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
  </BaseLayout>
</template>
<style scoped>
.hand-display {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  padding: 20px;
}

.playing-card {
  transition: transform 0.2s ease-in-out;
}

.playing-card:hover {
  transform: translateY(-10px);
}
</style>
