import { BlackjackState } from '@/types/BlackjackGameState';
import type { Card } from '@/types/Card';
import { generateDeck } from '@/utils/cards';
import { defineStore } from 'pinia'
import { ref } from 'vue';

export const useGameStore = defineStore('game', () => {

  const deck = ref<Card[]>([])
  const playerHand = ref<Card[]>([])
  const dealerHand = ref<Card[]>([])
  const gameState = ref(BlackjackState.betting)
  const currentBet = ref(0)

  function dealCards() {
    deck.value = generateDeck()
    playerHand.value = [deck.value.pop()!, deck.value.pop()!]
    dealerHand.value = [deck.value.pop()!, { ...deck.value.pop()!, faceUp: false }]
    gameState.value = BlackjackState.playerTurn
  }

  function hit() {

  }

  function stand() {

  }


  return {
    deck,
    playerHand,
    dealerHand,
    gameState,
    currentBet,
    dealCards,
    hit,
    stand
  }

});