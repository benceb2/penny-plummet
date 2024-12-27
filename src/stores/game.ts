import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', {
  state: () => ({
    deck: [],
    playerHand: [],
    dealerHand: [],
    gameState: 'betting', // betting | playerTurn | dealerTurn | roundOver
    currentBet: 0
  }),
  actions: {
    dealCards() {

    },
    hit() {

    },
    stand() {

    }
  }
});