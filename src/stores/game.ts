import { BlackjackState } from '@/types/BlackjackGameState';
import type { Card } from '@/types/Card';
import type { BlackjackResult } from '@/types/BlackjackResult';
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
    deck.value = shuffleDeck(generateDeck())
    playerHand.value = [deck.value.pop()!, deck.value.pop()!]
    dealerHand.value = [deck.value.pop()!, { ...deck.value.pop()!, faceUp: false }]
    gameState.value = BlackjackState.playerTurn
  }

  function hit() {
    if (gameState.value !== BlackjackState.playerTurn) return

    playerHand.value.push(deck.value.pop()!)

    if (playerScore.value > 21) {
      endGame()
    }
  }

  function stand() {
    if (gameState.value !== BlackjackState.playerTurn) return

    gameState.value = BlackjackState.dealerTurn
    dealerHand.value[1].faceUp = true

    // Dealer must hit on 16 and below, stand on 17 and above
    while (dealerScore.value < 17) {
      dealerHand.value.push(deck.value.pop()!)
    }

    endGame()
  }

  function endGame(): BlackjackResult {
    dealerHand.value[1].faceUp = true
    gameState.value = BlackjackState.gameOver

    const result: BlackjackResult = {
      isWin: false,
      isPush: false,
      amount: currentBet.value * 2, // Full payout amount for wins
      playerScore: playerScore.value,
      dealerScore: dealerScore.value,
      initialBet: currentBet.value
    }

    if (playerScore.value > 21) {
      result.isWin = false
      result.amount = 0
    } else if (dealerScore.value > 21) {
      result.isWin = true
    } else if (playerScore.value > dealerScore.value) {
      result.isWin = true
    } else if (playerScore.value < dealerScore.value) {
      result.isWin = false
      result.amount = 0
    } else {
      result.isPush = true
      result.amount = currentBet.value
    }

    return result
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
    reset,
    endGame
  }
})