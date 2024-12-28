import { BlackjackState } from '@/types/BlackjackGameState';
import type { Card } from '@/types/Card';
import { generateDeck, shuffleDeck, calculateHandValue } from '@/utils/cards';
import { defineStore } from 'pinia'
import { ref, computed } from 'vue';

export const useGameStore = defineStore('game', () => {
  const deck = ref<Card[]>([])
  const playerHand = ref<Card[]>([])
  const dealerHand = ref<Card[]>([])
  const gameState = ref(BlackjackState.betting)
  const currentBet = ref(0)

  const playerScore = computed(() => calculateHandValue(playerHand.value))
  const dealerScore = computed(() => calculateHandValue(dealerHand.value))

  function dealCards() {
    currentBet.value = 0
    deck.value = shuffleDeck(generateDeck())
    playerHand.value = [deck.value.pop()!, deck.value.pop()!]
    dealerHand.value = [deck.value.pop()!, { ...deck.value.pop()!, faceUp: false }]
    gameState.value = BlackjackState.playerTurn
  }

  function hit() {
    if (gameState.value !== BlackjackState.playerTurn) return

    playerHand.value.push(deck.value.pop()!)

    if (playerScore.value > 21) {
      gameState.value = BlackjackState.gameOver
      // Reveal dealer's hole card
      dealerHand.value[1].faceUp = true
    }
  }

  function stand() {
    if (gameState.value !== BlackjackState.playerTurn) return

    gameState.value = BlackjackState.dealerTurn
    // Reveal dealer's hole card
    dealerHand.value[1].faceUp = true

    // Dealer must hit on 16 and below, stand on 17 and above
    while (dealerScore.value < 17) {
      dealerHand.value.push(deck.value.pop()!)
    }

    determineWinner()
  }

  function determineWinner() {
    if (dealerScore.value > 21 || playerScore.value > dealerScore.value) {
      // Player wins
      currentBet.value *= 2
    } else if (dealerScore.value > playerScore.value) {
      // Dealer wins
      currentBet.value = 0
    } else {
      // Push - return original bet
    }

    gameState.value = BlackjackState.gameOver
  }

  function reset() {
    deck.value = []
    playerHand.value = []
    dealerHand.value = []
    gameState.value = BlackjackState.betting
    currentBet.value = 0
  }

  return {
    deck,
    playerHand,
    dealerHand,
    gameState,
    currentBet,
    playerScore,
    dealerScore,
    dealCards,
    hit,
    stand,
    reset
  }
})