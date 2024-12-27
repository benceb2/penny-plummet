import { GameState } from '@/types/GameState';
import { defineStore } from 'pinia'
import { ref } from 'vue';

export const useGameStore = defineStore('game', () => {

  const deck = ref([])
  const playerHand = ref([])
  const dealerHand = ref([])
  const gameState = ref(GameState)
  const currentBet = ref(0)

  function dealCards() {

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