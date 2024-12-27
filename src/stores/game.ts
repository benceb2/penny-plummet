import { GameState } from '@/types/BlackjackGameState';
import type { Card } from '@/types/Card';
import { defineStore } from 'pinia'
import { ref } from 'vue';

export const useGameStore = defineStore('game', () => {

  const deck = ref([])
  const playerHand = ref([] as Card[])
  const dealerHand = ref([])
  const gameState = ref(GameState)
  const currentBet = ref(0)

  function dealCards() {
    console.log('dealing cards')

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