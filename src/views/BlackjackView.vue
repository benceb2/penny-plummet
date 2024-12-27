<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '@/stores/game'

const gameStore = useGameStore()

const betAmount = ref(0)

</script>
<template>
  <main>
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Betting</h3>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <div class="form-floating">
                  <input type="number" class="form-control" id="betAmount" v-model="betAmount">
                  <label for="betAmount">Bet Amount</label>
                </div>
              </div>
              <div class="col-md-6">
                <button class="btn btn-primary" @click="gameStore.dealCards">Deal Cards</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
