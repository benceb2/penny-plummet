<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBlackjackStore } from '@/stores/blackjack'
import { useUserStore } from '@/stores/user'
import PlayingCard from '@/components/PlayingCard.vue'
import { BlackjackState } from '@/types/BlackjackGameState'
import BaseLayout from '@/components/layout/BaseLayout.vue'
import { formatIntAsCurrency } from '@/utils/currency'

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
  if (gameStore.gameState === BlackjackState.gameOver) {
    if (gameStore.playerScore > 21) {
      return 'Bust! Dealer wins!'
    } else if (gameStore.dealerScore > 21) {
      return 'Dealer busts! You win!'
    } else if (gameStore.playerScore > gameStore.dealerScore) {
      return 'You win!'
    } else if (gameStore.playerScore < gameStore.dealerScore) {
      return 'Dealer wins!'
    } else {
      return 'Push!'
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
  if (gameStore.gameState === BlackjackState.gameOver) {
    const result = gameStore.endGame()
    userStore.updateStats(result)
  }
}

function handleStand() {
  gameStore.stand()
  const result = gameStore.endGame()
  userStore.updateStats(result)
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
</script>

<template>
  <BaseLayout
    title="Blackjack"
    icon="suit-spade-fill"
    :showBalance="true">
    <!-- Header Actions Slot -->
    <template #header-actions>
      <button
        class="btn btn-outline-primary"
        type="button"
        @click="showStats = !showStats">
        <i class="bi" :class="showStats ? 'bi-eye-slash' : 'bi-eye'"></i>
        {{ showStats ? 'Hide Stats' : 'View Stats' }}
      </button>
    </template>

    <!-- Main Content -->

    <!-- Stats Section -->
    <div v-if="showStats" class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header bg-light">
            <h5 class="mb-0">
              <i class="bi bi-graph-up me-2"></i>Statistics
            </h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-4">
                <div class="border rounded p-3 text-center">
                  <h6 class="text-muted mb-2">
                    <i class="bi bi-collection me-1"></i>Hands Played
                  </h6>
                  <span class="h4">{{ userStore.stats.handsPlayed }}</span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="border rounded p-3 text-center">
                  <h6 class="text-muted mb-2">
                    <i class="bi bi-cash-stack me-1"></i>Total Winnings
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
                    <i class="bi bi-trophy me-1"></i>Biggest Win
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
    <div v-if="gameStore.gameState === BlackjackState.gameOver" class="alert mb-4" :class="{
      'alert-success': gameStatus.includes('You win'),
      'alert-danger': gameStatus.includes('Dealer wins'),
      'alert-warning': gameStatus.includes('Push')
    }" role="alert">
      <div class="d-flex justify-content-between align-items-center">
        <span class="h5 mb-0">
          <i class="bi" :class="{
            'bi-trophy-fill': gameStatus.includes('You win'),
            'bi-x-circle-fill': gameStatus.includes('Dealer wins'),
            'bi-dash-circle-fill': gameStatus.includes('Push')
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
                <i class="bi bi-person-fill me-2"></i>Dealer's Hand
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
                <i class="bi bi-person-circle me-2"></i>Your Hand
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
          <div class="card-header bg-light">
            <h5 class="mb-0">
              <i class="bi bi-joystick me-2"></i>Game Controls
            </h5>
          </div>
          <div class="card-body">
            <div class="row g-4">
              <!-- Betting Controls -->
              <div class="col-md-6" v-if="gameStore.gameState === BlackjackState.betting">
                <div class="h-100 d-flex flex-column justify-content-center">
                  <div class="bg-light p-3 rounded h-100">
                    <h6 class="mb-3">
                      <i class="bi bi-lightning-fill me-1"></i>Quick Bet
                    </h6>
                    <div class="d-flex flex-wrap gap-2">
                      <button v-for="amount in quickBetAmounts" :key="amount" class="btn btn-outline-primary"
                        :class="{ 'active': betAmount === amount }" :disabled="amount > userStore.chips"
                        @click="setPresetBet(amount)">
                        {{ formatIntAsCurrency(amount) }}
                        <small class="text-muted ms-1">
                          ({{ Math.round((amount / userStore.chips) * 100) }}%)
                        </small>
                      </button>
                    </div>
                    <div class="mt-3">
                      <div class="form-floating">
                        <input type="number" class="form-control" id="betAmount" v-model="betAmount"
                          :max="userStore.chips"
                          min="1">
                        <label for="betAmount">
                          <i class="bi bi-cash me-1"></i>Custom Bet Amount
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action Controls -->
              <div
                :class="`col-md-${[BlackjackState.playerTurn, BlackjackState.gameOver].includes(gameStore.gameState) ? '12' : '6'}`">
                <div class="h-100 d-flex flex-column justify-content-center">
                  <div class="bg-light p-3 rounded h-100">
                    <h6>
                      <i class="bi bi-gear-fill me-1"></i>Actions
                    </h6>

                    <!-- Betting State -->
                    <div v-if="gameStore.gameState === BlackjackState.betting"
                      class="d-flex justify-content-center align-items-center mt-5">
                      <button class="btn btn-primary btn-lg" @click="handleDeal"
                        :disabled="betAmount <= 0 || betAmount > userStore.chips">
                        <i class="bi bi-play-circle-fill me-2"></i>
                        Deal Cards
                      </button>
                    </div>

                    <!-- Player Turn State -->
                    <div v-if="gameStore.gameState === BlackjackState.playerTurn"
                      class="d-flex gap-3 justify-content-center">
                      <button class="btn btn-success btn-lg" @click="handleHit">
                        <i class="bi bi-plus-circle-fill me-2"></i>
                        Hit
                      </button>
                      <button class="btn btn-warning btn-lg text-white" @click="handleStand">
                        <i class="bi bi-hand-thumbs-up-fill me-2"></i>
                        Stand
                      </button>
                    </div>

                    <!-- Game Over State -->
                    <div v-if="gameStore.gameState === BlackjackState.gameOver" class="d-flex justify-content-center">
                      <button class="btn btn-primary btn-lg" @click="handleNewGame">
                        <i class="bi bi-arrow-clockwise me-2"></i>
                        New Game
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
