<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import GameScreen from '@/components/game/GameScreen.vue'
import GameTray from '@/components/game/GameTray.vue'
import ChipButton from '@/components/game/ChipButton.vue'
import ChipStack from '@/components/game/ChipStack.vue'
import ResultBanner from '@/components/game/ResultBanner.vue'
import RulesSheet from '@/components/game/RulesSheet.vue'
import PlayingCard from '@/views/blackjack/PlayingCard.vue'
import { useBlackjackStore } from '@/stores/blackjackStore'
import { useUserStore } from '@/stores/userStore'
import { BlackjackState } from '@/types/BlackjackGameState'
import type { Card } from '@/types/Card'
import { CHIP_DENOMINATIONS } from '@/utils/chipUtil'
import { formatIntAsCurrency } from '@/utils/numberFormatUtil'

const { t } = useI18n()

const gameStore = useBlackjackStore()
const userStore = useUserStore()

const showRules = ref(false)
const showResultBanner = ref(false)

// The chips currently placed on the bet spot, in tap order (last = top of
// the stack). Persists through a round (betting -> player/dealer turn ->
// result) and is only cleared by "change bet" or a fresh deal.
const betChips = ref<number[]>([])
const lastBet = ref(0)
const lastChips = ref<number[]>([])

// Bumped on every deal so PlayingCard's v-for key changes even when a new
// round reuses the same hand-array indices, forcing the deal-in animation
// to replay instead of patching the previous round's card elements in place.
const roundId = ref(0)

const pendingBet = computed(() => betChips.value.reduce((sum, value) => sum + value, 0))
const lastTappedChip = computed(() => betChips.value.length ? betChips.value[betChips.value.length - 1] : null)
const availableChips = computed(() => [...CHIP_DENOMINATIONS].reverse().filter((value) => value <= userStore.chips))
const hasInsufficientChips = computed(() => userStore.chips < 1)

// betChips is local component state, so it does not survive a page reload
// mid-round. Fall back to the store's persisted currentBet (and let
// ChipStack derive a stack for it) so the bet spot still shows something
// sensible after a reload instead of sitting empty.
const displayedBet = computed(() => pendingBet.value || gameStore.currentBet)
const displayedChips = computed(() => betChips.value.length ? betChips.value : undefined)

const DECK_CARD: Card = { suit: 'spades', value: 1, display: 'A', faceUp: false }

function selectChip(value: number) {
  if (gameStore.gameState !== BlackjackState.BETTING) return
  if (pendingBet.value + value > userStore.chips) return
  betChips.value.push(value)
}

function undoChip() {
  betChips.value.pop()
}

function handleDeal() {
  if (pendingBet.value <= 0 || pendingBet.value > userStore.chips) return
  lastBet.value = pendingBet.value
  lastChips.value = [...betChips.value]
  gameStore.currentBet = pendingBet.value
  roundId.value++
  gameStore.dealCards()
}

function handleHit() {
  gameStore.hit()
}

function handleStand() {
  gameStore.stand()
}

function handleChangeBet() {
  gameStore.reset()
  betChips.value = []
}

function handleDealAgain() {
  if (lastBet.value > 0 && lastBet.value <= userStore.chips) {
    betChips.value = [...lastChips.value]
    gameStore.currentBet = lastBet.value
    roundId.value++
    gameStore.dealCards()
  } else {
    handleChangeBet()
  }
}

function handleResultClose() {
  showResultBanner.value = false
}

// Small delay after GAME_OVER so the final card's deal-in animation has
// time to finish before the result banner covers the table.
watch(() => gameStore.gameState, (state) => {
  if (state === BlackjackState.GAME_OVER) {
    setTimeout(() => { showResultBanner.value = true }, 500)
  } else {
    showResultBanner.value = false
  }
})

type ScoreVariant = 'default' | 'bust' | 'blackjack'

function scoreVariant(score: number, isNaturalBlackjack: boolean): ScoreVariant {
  if (score > 21) return 'bust'
  if (isNaturalBlackjack) return 'blackjack'
  return 'default'
}

function scoreLabel(score: number, variant: ScoreVariant): string {
  if (variant === 'bust') return `${score} · ${t('game.bust')}`
  if (variant === 'blackjack') return `${score} · ${t('blackjack.title')}`
  return `${score}`
}

const dealerIsBlackjack = computed(() => gameStore.dealerHand.length === 2 && gameStore.dealerScore === 21)
const dealerVariant = computed(() => scoreVariant(gameStore.dealerScore, dealerIsBlackjack.value))
const dealerScoreLabel = computed(() => scoreLabel(gameStore.dealerScore, dealerVariant.value))
const playerVariant = computed(() => scoreVariant(gameStore.playerScore, gameStore.isBlackjack))
const playerScoreLabel = computed(() => scoreLabel(gameStore.playerScore, playerVariant.value))

const resultDetail = computed(() => t('blackjack.result.detail', {
  playerLabel: t('game.you'),
  playerScore: gameStore.playerScore,
  dealerLabel: t('game.dealer'),
  dealerScore: gameStore.dealerScore
}))

const resultData = computed(() => {
  if (gameStore.gameState !== BlackjackState.GAME_OVER) {
    return { type: 'push' as const, amount: 0, headline: '' }
  }

  if (gameStore.playerScore > 21) {
    return { type: 'loss' as const, amount: gameStore.currentBet, headline: t('blackjack.gameStatus.bust') }
  }
  if (gameStore.dealerScore > 21) {
    return { type: 'win' as const, amount: gameStore.currentBet, headline: t('blackjack.gameStatus.dealerBusts') }
  }
  if (gameStore.isBlackjack && gameStore.playerScore === 21 && gameStore.dealerScore !== 21) {
    return { type: 'win' as const, amount: gameStore.currentBet * 1.5, headline: t('blackjack.gameStatus.youWin') }
  }
  if (gameStore.playerScore > gameStore.dealerScore) {
    return { type: 'win' as const, amount: gameStore.currentBet, headline: t('blackjack.gameStatus.youWin') }
  }
  if (gameStore.playerScore < gameStore.dealerScore) {
    return { type: 'loss' as const, amount: gameStore.currentBet, headline: t('blackjack.gameStatus.dealerWins') }
  }
  return { type: 'push' as const, amount: 0, headline: t('blackjack.gameStatus.push') }
})

const dealLabel = computed(() => t('game.dealFor', { amount: formatIntAsCurrency(pendingBet.value) }))
const dealAgainLabel = computed(() => t('game.dealAgainFor', { amount: formatIntAsCurrency(lastBet.value) }))
</script>

<template>
  <GameScreen :title="t('blackjack.title')">
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
          <div class="deck" aria-hidden="true">
            <PlayingCard v-for="n in 3" :key="n" size="sm" :card="DECK_CARD" class="deck-card" />
          </div>
        </div>

        <div class="hand hand-dealer">
          <div class="hand-meta">
            <span class="hand-label">{{ t('game.dealer') }}</span>
            <span v-if="gameStore.dealerHand.length" class="score-pill" :class="`score-pill--${dealerVariant}`">
              <span class="visually-hidden">{{ t('blackjack.dealer.score') }}: </span>{{ dealerScoreLabel }}
            </span>
          </div>
          <div v-if="gameStore.dealerHand.length" class="cards">
            <PlayingCard
              v-for="(card, index) in gameStore.dealerHand"
              :key="`${roundId}-dealer-${index}`"
              :card="card"
              :deal-index="index"
              class="hand-card" />
          </div>
        </div>

        <div class="mid">
          <svg class="arc" viewBox="0 0 375 56" aria-hidden="true">
            <path id="bj-arc-a" d="M 30 42 Q 187.5 -6 345 42" fill="none" />
            <path id="bj-arc-b" d="M 60 58 Q 187.5 16 315 58" fill="none" />
            <text>
              <textPath href="#bj-arc-a" startOffset="50%" text-anchor="middle">{{ t('game.blackjackPays') }}</textPath>
            </text>
            <text class="arc-small">
              <textPath href="#bj-arc-b" startOffset="50%" text-anchor="middle">{{ t('game.dealerStands') }}</textPath>
            </text>
          </svg>

          <div class="bet-spot">
            <span class="bet-spot-label">{{ t('blackjack.betSpotLabel') }}</span>
            <ChipStack v-if="displayedBet > 0" :amount="displayedBet" :chips="displayedChips" />
          </div>
          <div v-if="displayedBet > 0" class="bet-amount">{{ formatIntAsCurrency(displayedBet) }}</div>
        </div>

        <div class="hand hand-player">
          <div v-if="gameStore.playerHand.length" class="cards">
            <PlayingCard
              v-for="(card, index) in gameStore.playerHand"
              :key="`${roundId}-player-${index}`"
              :card="card"
              :deal-index="index"
              class="hand-card" />
          </div>
          <div class="hand-meta">
            <span class="hand-label">{{ t('game.you') }}</span>
            <span v-if="gameStore.playerHand.length" class="score-pill" :class="`score-pill--${playerVariant}`">
              <span class="visually-hidden">{{ t('blackjack.player.score') }}: </span>{{ playerScoreLabel }}
            </span>
          </div>
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
        <template v-if="gameStore.gameState === BlackjackState.BETTING">
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
                :selected="value === lastTappedChip"
                @select="selectChip(value)" />
            </div>
            <div class="cta-row">
              <button
                type="button"
                class="btn btn-outline-light cta-icon-btn"
                :aria-label="t('game.undoLastChip')"
                :disabled="betChips.length === 0"
                @click="undoChip">
                <i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
              </button>
              <button
                type="button"
                class="btn btn-primary cta-btn cta-btn--amount"
                :disabled="pendingBet <= 0 || pendingBet > userStore.chips"
                @click="handleDeal">
                {{ dealLabel }}
              </button>
            </div>
          </template>
        </template>

        <template v-else-if="gameStore.gameState === BlackjackState.PLAYER_TURN">
          <div class="cta-row">
            <button type="button" class="btn btn-primary cta-btn" @click="handleHit">{{ t('game.hit') }}</button>
            <button type="button" class="btn btn-outline-light cta-btn" @click="handleStand">{{ t('game.stand') }}</button>
          </div>
        </template>

        <template v-else-if="gameStore.gameState === BlackjackState.GAME_OVER">
          <div class="cta-row">
            <button type="button" class="btn btn-outline-light cta-btn" @click="handleChangeBet">{{ t('game.changeBet') }}</button>
            <button type="button" class="btn btn-primary cta-btn cta-btn--amount" @click="handleDealAgain">{{ dealAgainLabel }}</button>
          </div>
        </template>
      </GameTray>
    </template>
  </GameScreen>

  <RulesSheet v-model:open="showRules" :title="t('blackjack.rules.title')">
    <p class="text-body-secondary">{{ t('blackjack.rules.summary') }}</p>
    <ul class="rules-list">
      <li>{{ t('blackjack.rules.dealerStands') }}</li>
      <li>{{ t('blackjack.rules.blackjackPays') }}</li>
      <li>{{ t('blackjack.rules.dealerChecks') }}</li>
      <li>{{ t('blackjack.rules.tiesPush') }}</li>
    </ul>
    <a
      class="link-light"
      href="https://wizardofodds.com/games/blackjack/basics/"
      target="_blank"
      rel="noopener noreferrer">
      {{ t('blackjack.rules.learnMore') }}
    </a>

    <h3 class="rules-stats-title">{{ t('blackjack.stats.title') }}</h3>
    <dl class="rules-stats">
      <div>
        <dt>{{ t('blackjack.stats.handsPlayed') }}</dt>
        <dd>{{ userStore.stats.handsPlayed }}</dd>
      </div>
      <div>
        <dt>{{ t('blackjack.stats.totalWinnings') }}</dt>
        <dd :class="{ 'text-win': userStore.stats.totalWinnings > 0, 'text-loss': userStore.stats.totalWinnings < 0 }">
          {{ formatIntAsCurrency(userStore.stats.totalWinnings) }}
        </dd>
      </div>
      <div>
        <dt>{{ t('blackjack.stats.biggestWin') }}</dt>
        <dd class="text-win">{{ formatIntAsCurrency(userStore.stats.biggestWin) }}</dd>
      </div>
    </dl>
  </RulesSheet>
</template>

<style scoped>
.felt {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: .625rem 1rem .75rem;
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
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  height: 66px;
  flex: 0 0 auto;
}

.rules-trigger {
  width: 32px;
  height: 32px;
  margin-top: 4px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, .28);
  border: 1px solid rgba(244, 238, 223, .18);
  color: var(--pp-cream);
  opacity: .85;
}

.deck {
  position: relative;
  width: 46px;
  height: 64px;
  margin: 2px 4px 0 0;
}

.deck-card {
  position: absolute;
  left: 0;
  top: 0;
}

.deck-card:nth-child(2) {
  transform: translate(-2px, -2px);
}

.deck-card:nth-child(3) {
  transform: translate(-4px, -4px) rotate(-2deg);
}

.hand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .5rem;
  flex: 0 0 auto;
}

.hand-meta {
  display: flex;
  align-items: center;
  gap: .5rem;
}

.hand-label {
  font-family: var(--pp-font-display);
  font-size: .6875rem;
  letter-spacing: .24em;
  text-transform: uppercase;
  color: rgba(244, 238, 223, .7);
}

.score-pill {
  min-width: 30px;
  height: 22px;
  padding: 0 9px;
  border-radius: 999px;
  display: inline-grid;
  place-items: center;
  background: rgba(0, 0, 0, .5);
  border: 1px solid rgba(255, 255, 255, .08);
  font-size: .8125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--pp-cream);
}

.score-pill--bust {
  background: rgba(229, 100, 92, .22);
  border-color: rgba(229, 100, 92, .55);
  color: #FFB3AE;
}

.score-pill--blackjack {
  background: rgba(225, 178, 90, .22);
  border-color: rgba(225, 178, 90, .6);
  color: var(--pp-gold-bright);
}

.cards {
  display: flex;
  align-items: flex-end;
  height: 102px;
}

.cards .hand-card + .hand-card {
  margin-left: -30px;
}

.cards .hand-card:nth-child(2) {
  transform: rotate(2deg) translateY(-1px);
}

.cards .hand-card:nth-child(3) {
  transform: rotate(4deg) translateY(-2px);
}

.mid {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: .375rem;
}

.arc {
  flex: 0 0 auto;
  width: 100%;
  height: 56px;
  pointer-events: none;
}

.arc text {
  font-family: var(--pp-font-display);
  font-size: 12.5px;
  letter-spacing: 3.2px;
  text-transform: uppercase;
  fill: rgba(225, 178, 90, .44);
}

.arc .arc-small {
  font-size: 9px;
  letter-spacing: 2.4px;
  fill: rgba(225, 178, 90, .34);
}

.bet-spot {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  border: 1.5px solid rgba(225, 178, 90, .42);
  background: radial-gradient(circle, rgba(0, 0, 0, .18), rgba(0, 0, 0, .05));
  display: grid;
  place-items: center;
  position: relative;
}

.bet-spot-label {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  padding: 0 6px;
  background: var(--pp-felt-deep);
  font-family: var(--pp-font-display);
  font-size: .59375rem;
  letter-spacing: .22em;
  text-transform: uppercase;
  color: rgba(225, 178, 90, .75);
}

.bet-amount {
  font-family: var(--pp-font-display);
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--pp-gold-bright);
  letter-spacing: .02em;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 1px 0 rgba(0, 0, 0, .4);
}

.chip-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: .375rem .25rem 0;
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

/* "Deal · $x" / "Deal again · $x" run noticeably longer than the other CTA
   labels once a real amount is interpolated in; a smaller size keeps them
   on one line at phone widths instead of wrapping inside the 54px button. */
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

.rules-stats-title {
  margin-top: 1.5rem;
  margin-bottom: .75rem;
  font-family: var(--pp-font-display);
  font-size: 1rem;
  font-weight: 700;
}

.rules-stats {
  display: flex;
  flex-direction: column;
  gap: .5rem;
  margin: 0;
}

.rules-stats > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
}

.rules-stats dt {
  color: var(--pp-cream-dim);
  font-weight: 400;
}

.rules-stats dd {
  margin: 0;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.text-win {
  color: var(--pp-win);
}

.text-loss {
  color: var(--pp-loss);
}
</style>
