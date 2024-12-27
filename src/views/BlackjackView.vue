<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '@/stores/game'
import PlayingCard from '@/components/PlayingCard.vue'
import { BlackjackState } from '@/types/BlackjackGameState'

const gameStore = useGameStore()
const betAmount = ref(0)

function handleDeal() {
  if (betAmount.value > 0) {
    gameStore.dealCards()
  }
}
</script>

<template>
  <main class="container mt-4">
    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5>Dealer's Hand</h5>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-center">
              <div v-if="gameStore.dealerHand.length" class="hand-display">
                <PlayingCard
                  v-for="(card, index) in gameStore.dealerHand"
                  :key="index"
                  :card="card" />
              </div>
              <div v-else class="text-muted">
                No cards dealt yet
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5>Your Hand</h5>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-center">
              <div v-if="gameStore.playerHand.length" class="hand-display">
                <PlayingCard
                  v-for="(card, index) in gameStore.playerHand"
                  :key="index"
                  :card="card" />
              </div>
              <div v-else class="text-muted">
                No cards dealt yet
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5>Controls</h5>
          </div>
          <div class="card-body">
            <div class="row align-items-end">
              <div class="col-md-6">
                <div class="form-floating mb-3">
                  <input
                    type="number"
                    class="form-control"
                    id="betAmount"
                    v-model="betAmount"
                    :disabled="gameStore.gameState !== BlackjackState.betting">
                  <label for="betAmount">Bet Amount</label>
                </div>
              </div>
              <div class="col-md-6">
                <div class="d-flex gap-2">
                  <button
                    class="btn btn-primary"
                    @click="handleDeal"
                    :disabled="betAmount <= 0 || gameStore.gameState !== BlackjackState.betting">
                    Deal Cards
                  </button>
                  <button
                    v-if="gameStore.gameState === BlackjackState.playerTurn"
                    class="btn btn-success"
                    @click="gameStore.hit">
                    Hit
                  </button>
                  <button
                    v-if="gameStore.gameState === BlackjackState.dealerTurn"
                    class="btn btn-danger"
                    @click="gameStore.stand">
                    Stand
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.hand-display {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  padding: 20px;
}

/* Optional: Add a nice transition effect for cards */
.playing-card {
  transition: transform 0.2s ease-in-out;
}

.playing-card:hover {
  transform: translateY(-10px);
}
</style>