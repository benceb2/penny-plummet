<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useBlackjackStore } from '@/stores/blackjackStore'
import { useUserStore } from '@/stores/userStore'
import PlayingCard from '@/views/blackjack/PlayingCard.vue'
import GameResult from '@/components/GameResult.vue'
import { BlackjackState } from '@/types/BlackjackGameState'
import BaseLayout from '@/components/layout/BaseLayout.vue'
import BetAmountSelector from '@/components/BetAmountSelector.vue'
import { formatIntAsCurrency } from '@/utils/numberFormatUtil'

const { t } = useI18n()

const gameStore = useBlackjackStore()
const userStore = useUserStore()
const betAmount = ref(0)
const showStats = ref(false)
const showGameResult = ref(false)

const gameResult = computed(() => {
  if (gameStore.gameState !== BlackjackState.GAME_OVER) {
    return { type: 'win' as const, amount: 0 }
  }

  let resultType: 'win' | 'loss' | 'push'
  let amount = 0
  let message = ''
  let details = ''

  if (gameStore.playerScore > 21) {
    // Player busts
    resultType = 'loss'
    amount = -gameStore.currentBet
    message = t('blackjack.gameStatus.bust')
    details = t('blackjack.result.playerBusted')
  } else if (gameStore.dealerScore > 21) {
    // Dealer busts
    resultType = 'win'
    amount = gameStore.currentBet * 2 // Return bet + winnings
    message = t('blackjack.gameStatus.dealerBusts')
    details = t('blackjack.result.dealerBusted')
  } else if (gameStore.playerScore > gameStore.dealerScore) {
    // Player wins
    resultType = 'win'
    amount = gameStore.currentBet * 2
    message = t('blackjack.gameStatus.youWin')
    details = `${gameStore.playerScore} vs ${gameStore.dealerScore}`
  } else if (gameStore.playerScore < gameStore.dealerScore) {
    // Dealer wins
    resultType = 'loss'
    amount = -gameStore.currentBet
    message = t('blackjack.gameStatus.dealerWins')
    details = `${gameStore.playerScore} vs ${gameStore.dealerScore}`
  } else {
    // Push (tie)
    resultType = 'push'
    amount = 0 // Bet is returned
    message = t('blackjack.gameStatus.push')
    details = `${gameStore.playerScore} vs ${gameStore.dealerScore}`
  }

  return {
    type: resultType,
    amount,
    message,
    details
  }
})

// Watch for game over state to show result
watch(() => gameStore.gameState, (newState) => {
  if (newState === BlackjackState.GAME_OVER) {
    // Small delay to let the final card animation finish
    setTimeout(() => {
      showGameResult.value = true
    }, 500)
  }
})

function handleDeal() {
  if (betAmount.value > 0 && betAmount.value <= userStore.chips) {
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

function handleResultClose() {
  showGameResult.value = false
}

// Maximum bet amount
const maxBetAmount = computed(() => userStore.chips)
</script>

<template>
  <BaseLayout
    :title="t('blackjack.title')"
    bootstrapIcon="suit-spade-fill">
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

                    <BetAmountSelector v-model="betAmount" :max-amount="maxBetAmount" :min-amount="1" />
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

    <!-- Game Result Modal -->
    <GameResult :show="showGameResult" :result="gameResult" :auto-dismiss="false" @close="handleResultClose" />
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
