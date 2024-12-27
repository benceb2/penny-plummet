<script setup lang="ts">
import type { Card } from '@/types/Card'

defineProps<{
  card: Card
}>()
</script>

<template>
  <div class="playing-card" :class="{ 'text-danger': card.suit === 'hearts' || card.suit === 'diamonds' }">
    <div v-if="card.faceUp" class="card-front">
      <div class="card-value">
        {{ getCardDisplay(card.value) }}
        {{ getSuitSymbol(card.suit) }}
      </div>
    </div>
    <div v-else class="card-back">
      🂠
    </div>
  </div>
</template>

<script lang="ts">
function getCardDisplay(value: number): string {
  switch (value) {
    case 1: return 'A'
    case 11: return 'J'
    case 12: return 'Q'
    case 13: return 'K'
    default: return value.toString()
  }
}

function getSuitSymbol(suit: string): string {
  switch (suit) {
    case 'hearts': return '♥'
    case 'diamonds': return '♦'
    case 'clubs': return '♣'
    case 'spades': return '♠'
    default: return ''
  }
}
</script>

<style scoped>
.playing-card {
  width: 100px;
  height: 140px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  margin: 0 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-back {
  color: #2c3e50;
  font-size: 2rem;
}

.card-value {
  text-align: center;
}
</style>