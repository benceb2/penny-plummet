<script setup lang="ts">
import type { Card } from '@/types/Card'
defineProps<{
  card: Card
}>()

const getSuitSymbol = (suit: string): string => {
  switch (suit) {
    case 'hearts': return '♥'
    case 'diamonds': return '♦'
    case 'clubs': return '♣'
    case 'spades': return '♠'
    default: return ''
  }
}

const getSuitName = (suit: string): string => {
  switch (suit) {
    case 'hearts': return 'hearts'
    case 'diamonds': return 'diamonds'
    case 'clubs': return 'clubs'
    case 'spades': return 'spades'
    default: return 'unknown suit'
  }
}

const getCardLabel = (card: Card): string => {
  if (!card.faceUp) {
    return 'Face down card'
  }

  return `${card.display} of ${getSuitName(card.suit)}`
}
</script>

<template>
  <div class="playing-card shadow-sm rounded position-relative bg-white border"
    :class="{ 'text-danger': card.suit === 'hearts' || card.suit === 'diamonds' }"
    role="img"
    :aria-label="getCardLabel(card)">
    <div v-if="card.faceUp" class="h-100 p-2">
      <!-- Top left corner -->
      <div class="position-absolute top-0 start-0 p-1 d-flex flex-column align-items-center">
        <span class="fw-bold card-value">{{ card.display }}</span>
        <span class="card-suit">{{ getSuitSymbol(card.suit) }}</span>
      </div>

      <!-- Center suit -->
      <div class="position-absolute top-50 start-50 translate-middle">
        <span class="suit-large">{{ getSuitSymbol(card.suit) }}</span>
      </div>

      <!-- Bottom right corner -->
      <div class="position-absolute bottom-0 end-0 p-1 d-flex flex-column align-items-center rotate-180">
        <span class="fw-bold card-value">{{ card.display }}</span>
        <span class="card-suit">{{ getSuitSymbol(card.suit) }}</span>
      </div>
    </div>

    <!-- Card back -->
    <div v-else class="card-back h-100 d-flex align-items-center justify-content-center">
      <div class="back-pattern"></div>
    </div>
  </div>
</template>

<style scoped>
/* Only keep styles that can't be handled by Bootstrap */
.playing-card {
  width: 100px;
  height: 140px;
  transition: transform 0.2s ease;
  cursor: default;
}

.playing-card:hover {
  transform: translateY(-5px);
}

.suit-large {
  font-size: 2.5rem;
}

.card-value {
  font-size: 1.2rem;
  line-height: 1;
}

.card-suit {
  font-size: 1rem;
  line-height: 1;
}

.rotate-180 {
  transform: rotate(180deg);
}

.card-back {
  background: #2962ff;
}

.back-pattern {
  width: 90%;
  height: 90%;
  border: 2px solid #1e88e5;
  border-radius: 4px;
  background-image: repeating-linear-gradient(45deg,
      #1e88e5 0,
      #1e88e5 5px,
      #2962ff 5px,
      #2962ff 10px);
}

@media (max-width: 768px) {
  .playing-card {
    width: 80px;
    height: 112px;
  }

  .card-value {
    font-size: 1rem;
  }

  .card-suit {
    font-size: 0.9rem;
  }

  .suit-large {
    font-size: 2rem;
  }
}
</style>
