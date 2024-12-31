/**
 * Blackjack Game Store
 *
 * This store manages the state and logic for a blackjack game using standard casino rules:
 * - Dealer must hit on 16 and below, stand on 17 and above
 * - Blackjack pays 2:1
 * - Dealer's second card remains face down until player's turn is complete
 *
 * @module useGameStore
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue';

import { BlackjackState } from '@/types/BlackjackGameState';
import type { Card } from '@/types/Card';
import type { BlackjackResult } from '@/types/BlackjackResult';
import { generateDeck, shuffleDeck, calculateHandValue } from '@/utils/cards';
import { calculateStorageKey, createGameSerializer } from '../utils/serializer';

export const useBlackjackStore = defineStore('blackjack', () => {
  // Game state references
  const deck = ref<Card[]>([])
  const playerHand = ref<Card[]>([])
  const dealerHand = ref<Card[]>([])
  const gameState = ref(BlackjackState.betting)
  const currentBet = ref(0)

  /**
   * Computed property for player's current hand value
   * Always calculated from all cards as player's cards are always face up
   */
  const playerScore = computed(() => calculateHandValue(playerHand.value))

  /**
   * Computed property for dealer's visible hand value
   * Includes all cards as they become face up during gameplay
   */
  const dealerScore = computed(() => calculateHandValue(dealerHand.value))

  /**
   * Initiates a new round by dealing initial cards
   * Player receives two cards face up
   * Dealer receives one card face up and one face down (hole card)
   */
  function dealCards() {
    deck.value = shuffleDeck(generateDeck())
    playerHand.value = [deck.value.pop()!, deck.value.pop()!]
    dealerHand.value = [deck.value.pop()!, { ...deck.value.pop()!, faceUp: false }]
    gameState.value = BlackjackState.playerTurn
  }

  /**
   * Handles player's decision to hit (take another card)
   * - Only available during player's turn
   * - Automatically ends game if player busts (goes over 21)
   */
  function hit() {
    if (gameState.value !== BlackjackState.playerTurn) return
    playerHand.value.push(deck.value.pop()!)
    if (playerScore.value > 21) {
      endGame()
    }
  }

  /**
   * Handles player's decision to stand (keep current hand)
   * - Only available during player's turn
   * - Triggers dealer's turn
   * - Dealer must hit on 16 and below, stand on 17 and above (standard casino rules)
   */
  function stand() {
    if (gameState.value !== BlackjackState.playerTurn) return
    gameState.value = BlackjackState.dealerTurn
    dealerHand.value[1].faceUp = true // Reveal dealer's hole card

    // Dealer's automated play
    while (dealerScore.value < 17) {
      dealerHand.value.push(deck.value.pop()!)
    }
    endGame()
  }

  /**
   * Determines the game outcome and calculates payout
   * Win conditions:
   * - Player has higher score than dealer without busting
   * - Dealer busts (goes over 21)
   *
   * Loss conditions:
   * - Player busts (goes over 21)
   * - Dealer has higher score without busting
   *
   * Push (tie) condition:
   * - Player and dealer have equal scores
   *
   * @returns {BlackjackResult} Object containing game outcome and payout information
   */
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

    // Determine outcome and set appropriate payout
    if (playerScore.value > 21) {
      result.isWin = false
      result.amount = 0  // Player busts, loses bet
    } else if (dealerScore.value > 21) {
      result.isWin = true  // Dealer busts, player wins
    } else if (playerScore.value > dealerScore.value) {
      result.isWin = true  // Player has higher score
    } else if (playerScore.value < dealerScore.value) {
      result.isWin = false
      result.amount = 0  // Dealer has higher score
    } else {
      result.isPush = true
      result.amount = currentBet.value  // Push - return original bet
    }

    return result
  }

  /**
   * Resets the game state for a new round
   * Clears all hands, deck, and betting information
   */
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
}, {
  persist: {
    key: calculateStorageKey("blackjack-store"),
    serializer: createGameSerializer()
  }
})
