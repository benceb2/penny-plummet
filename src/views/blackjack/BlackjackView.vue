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
const showRules = ref(false)

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
  } else if (gameStore.isBlackjack && gameStore.playerScore === 21 && gameStore.dealerScore !== 21) {
    // Natural blackjack pays 3:2
    resultType = 'win'
    amount = gameStore.currentBet * 2.5
    message = t('blackjack.gameStatus.youWin')
    details = `${gameStore.playerScore} vs ${gameStore.dealerScore}`
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
    
    <template #header-actions>
      <button
        class="btn btn-outline-primary"
        type="button"
        @click="showStats = !showStats">
        <i class="bi" :class="showStats ? 'bi-eye-slash' : 'bi-eye'" aria-hidden="true"></i>
        {{ showStats ? t('blackjack.stats.hideStats') : t('blackjack.stats.viewStats') }}
      </button>
    </template>

    

    
    <div v-if="showStats" class="row mb-3 mb-md-4">
      <div class="col-12 d-none d-md-block">
        <div class="card">
          <div class="card-header bg-light">
            <h2 class="mb-0 section-title">
              <i class="bi bi-graph-up me-2" aria-hidden="true"></i>{{ t('blackjack.stats.title') }}
            </h2>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-4">
                <div class="card text-center h-100">
                  <div class="card-body">
                    <h3 class="text-muted mb-2 subsection-title">
                      <i class="bi bi-collection me-1" aria-hidden="true"></i>{{ t('blackjack.stats.handsPlayed') }}
                    </h3>
                    <span class="h4">{{ userStore.stats.handsPlayed }}</span>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card text-center h-100">
                  <div class="card-body">
                    <h3 class="text-muted mb-2 subsection-title">
                      <i class="bi bi-cash-stack me-1" aria-hidden="true"></i>{{ t('blackjack.stats.totalWinnings') }}
                    </h3>
                    <span class="h4"
                      :class="{ 'text-success': userStore.stats.totalWinnings > 0, 'text-danger': userStore.stats.totalWinnings < 0 }">
                      {{ formatIntAsCurrency(userStore.stats.totalWinnings) }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card text-center h-100">
                  <div class="card-body">
                    <h3 class="text-muted mb-2 subsection-title">
                      <i class="bi bi-trophy me-1" aria-hidden="true"></i>{{ t('blackjack.stats.biggestWin') }}
                    </h3>
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

      <div class="col-12 d-md-none">
        <div class="accordion" id="blackjackStatsAccordion">
          <div class="accordion-item">
            <h2 class="accordion-header" id="blackjackStatsHeading">
              <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#blackjackStatsCollapse"
                aria-expanded="false"
                aria-controls="blackjackStatsCollapse">
                <i class="bi bi-graph-up me-2" aria-hidden="true"></i>{{ t('blackjack.stats.title') }}
              </button>
            </h2>
            <div
              id="blackjackStatsCollapse"
              class="accordion-collapse collapse"
              aria-labelledby="blackjackStatsHeading"
              data-bs-parent="#blackjackStatsAccordion">
              <div class="accordion-body p-0">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span class="text-muted">
                      <i class="bi bi-collection me-1" aria-hidden="true"></i>{{ t('blackjack.stats.handsPlayed') }}
                    </span>
                    <span class="fw-semibold">{{ userStore.stats.handsPlayed }}</span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span class="text-muted">
                      <i class="bi bi-cash-stack me-1" aria-hidden="true"></i>{{ t('blackjack.stats.totalWinnings') }}
                    </span>
                    <span
                      class="fw-semibold"
                      :class="{ 'text-success': userStore.stats.totalWinnings > 0, 'text-danger': userStore.stats.totalWinnings < 0 }">
                      {{ formatIntAsCurrency(userStore.stats.totalWinnings) }}
                    </span>
                  </li>
                  <li class="list-group-item d-flex justify-content-between align-items-center">
                    <span class="text-muted">
                      <i class="bi bi-trophy me-1" aria-hidden="true"></i>{{ t('blackjack.stats.biggestWin') }}
                    </span>
                    <span class="fw-semibold text-success">
                      {{ formatIntAsCurrency(userStore.stats.biggestWin) }}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="blackjack-view">
    
    <div class="row mb-3 mb-md-4">
      <div class="col-12">
        <div class="accordion" id="blackjackRulesAccordion">
          <div class="accordion-item">
            <h2 class="accordion-header" id="blackjackRulesHeading">
              <button
                class="accordion-button d-flex align-items-center justify-content-between"
                type="button"
                :class="{ collapsed: !showRules }"
                :aria-expanded="showRules"
                aria-controls="blackjackRulesCollapse"
                @click="showRules = !showRules">
                <span>
                  <i class="bi bi-info-circle me-2" aria-hidden="true"></i>{{ t('blackjack.rules.title') }}
                </span>
                <span class="ms-2 small text-muted">
                  {{ showRules ? t('blackjack.rules.hide') : t('blackjack.rules.show') }}
                </span>
              </button>
            </h2>
            <div
              id="blackjackRulesCollapse"
              class="accordion-collapse collapse"
              :class="{ show: showRules }"
              aria-labelledby="blackjackRulesHeading"
              data-bs-parent="#blackjackRulesAccordion">
              <div class="accordion-body">
                <p class="text-muted mb-3">{{ t('blackjack.rules.summary') }}</p>
                <ul class="list-group list-group-flush mb-3">
                  <li class="list-group-item">{{ t('blackjack.rules.dealerStands') }}</li>
                  <li class="list-group-item">{{ t('blackjack.rules.blackjackPays') }}</li>
                  <li class="list-group-item">{{ t('blackjack.rules.dealerChecks') }}</li>
                  <li class="list-group-item">{{ t('blackjack.rules.tiesPush') }}</li>
                </ul>
                <a
                  class="link-primary"
                  href="https://wizardofodds.com/games/blackjack/basics/"
                  target="_blank"
                  rel="noopener noreferrer">
                  {{ t('blackjack.rules.learnMore') }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <div v-if="gameStore.dealerHand.length" class="row mb-3 mb-md-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-light blackjack-card-header">
            <div class="d-flex align-items-center">
              <h2 class="mb-0 section-title">
                <i class="bi bi-person-fill me-2" aria-hidden="true"></i>{{ t('blackjack.dealer.hand') }}
              </h2>
              <span class="badge bg-dark ms-2">
                {{ gameStore.dealerScore }}
              </span>
            </div>
          </div>
          <div class="card-body blackjack-card-body">
            <div class="d-flex justify-content-center">
              <div class="d-flex flex-wrap gap-2 gap-sm-3 justify-content-center p-2 p-sm-3">
                <PlayingCard v-for="(card, index) in gameStore.dealerHand" :key="index" :card="card" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <div v-if="gameStore.playerHand.length" class="row mb-3 mb-md-4">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-light blackjack-card-header">
            <div class="d-flex align-items-center">
              <h2 class="mb-0 section-title">
                <i class="bi bi-person-circle me-2" aria-hidden="true"></i>{{ t('blackjack.player.hand') }}
              </h2>
              <span class="badge bg-dark ms-2">
                {{ gameStore.playerScore }}
              </span>
            </div>
          </div>
          <div class="card-body blackjack-card-body">
            <div class="d-flex justify-content-center">
              <div class="d-flex flex-wrap gap-2 gap-sm-3 justify-content-center p-2 p-sm-3">
                <PlayingCard v-for="(card, index) in gameStore.playerHand" :key="index" :card="card" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    
    <div class="row">
      <div class="col-12">
        <div class="card shadow-sm">
          <div class="card-header bg-light py-2 py-md-3 blackjack-card-header">
            <h2 class="mb-0 section-title">
              <i class="bi bi-joystick me-2" aria-hidden="true"></i>{{ t('blackjack.controls.title') }}
            </h2>
          </div>
          <div class="card-body blackjack-card-body">
            <div class="row g-3 g-md-4">
              
              <div class="col-md-6" v-if="gameStore.gameState === BlackjackState.BETTING">
                <div class="h-100">
                  <div class="bg-light p-3 p-md-4 rounded h-100">
                    <h3 class="d-flex align-items-center mb-3 mb-md-4 subsection-title">
                      <i class="bi bi-lightning-fill me-2" aria-hidden="true"></i>{{ t('blackjack.controls.placeBet') }}
                    </h3>

                    <BetAmountSelector v-model="betAmount" :max-amount="maxBetAmount" :min-amount="1" />
                  </div>
                </div>
              </div>

              
              <div
                :class="`col-md-${[BlackjackState.PLAYER_TURN, BlackjackState.GAME_OVER].includes(gameStore.gameState) ? '12' : '6'}`">
                <div class="h-100">
                  <div class="bg-light p-3 p-md-4 rounded h-100">
                    <h3 class="d-flex align-items-center mb-3 mb-md-4 subsection-title">
                      <i class="bi bi-gear-fill me-2" aria-hidden="true"></i>{{ t('blackjack.controls.actions') }}
                    </h3>

                    
                    <div v-if="gameStore.gameState === BlackjackState.BETTING" class="d-grid">
                      <button class="btn btn-primary btn-lg mt-3" @click="handleDeal"
                        :disabled="betAmount <= 0 || betAmount > userStore.chips">
                        <i class="bi bi-play-circle-fill me-2" aria-hidden="true"></i>{{ t('blackjack.controls.dealCards') }}
                      </button>
                    </div>

                    
                    <div v-if="gameStore.gameState === BlackjackState.PLAYER_TURN">
                      <div class="btn-group w-100" role="group" aria-label="Blackjack actions">
                        <button class="btn btn-success btn-lg w-50" @click="handleHit">
                          <i class="bi bi-plus-circle-fill me-2" aria-hidden="true"></i>{{ t('blackjack.controls.hit') }}
                        </button>
                        <button class="btn btn-warning btn-lg text-white w-50" @click="handleStand">
                          <i class="bi bi-hand-thumbs-up-fill me-2" aria-hidden="true"></i>{{ t('blackjack.controls.stand') }}
                        </button>
                      </div>
                    </div>

                    
                    <div v-if="gameStore.gameState === BlackjackState.GAME_OVER" class="d-grid">
                      <button class="btn btn-primary btn-lg" @click="handleNewGame">
                        <i class="bi bi-arrow-clockwise me-2" aria-hidden="true"></i>{{ t('blackjack.controls.newGame') }}
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

    
    <GameResult :show="showGameResult" :result="gameResult" :auto-dismiss="false" @close="handleResultClose" />
    </div>
  </BaseLayout>
</template>

<style scoped>
@media (max-width: 767px) {
  .blackjack-card-header {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }

  .blackjack-card-body {
    padding: 0.75rem;
  }

  .blackjack-view .accordion-button {
    padding: 0.5rem 0.75rem;
  }

  .blackjack-view .list-group-item {
    padding: 0.5rem 0.75rem;
  }

  .blackjack-view .btn-lg {
    padding: 0.45rem 0.75rem;
    font-size: 0.95rem;
  }
}
</style>
