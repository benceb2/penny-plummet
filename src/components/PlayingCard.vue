<script setup lang="ts">
import type { Card } from '@/types/Card'

defineProps<{
  card: Card
}>()
</script>

<template>
  <div class="playing-card" :class="{ 'text-danger': card.suit === 'hearts' || card.suit === 'diamonds' }">
    <div v-if="card.faceUp" class="card-front">
      <!-- Top left corner -->
      <div class="card-corner top-left">
        <div class="value">{{ card.display }}</div>
        <div class="suit">{{ getSuitSymbol(card.suit) }}</div>
      </div>

      <!-- Center suit -->
      <div class="card-center">
        <div class="suit-large">{{ getSuitSymbol(card.suit) }}</div>
      </div>

      <!-- Bottom right corner (rotated) -->
      <div class="card-corner bottom-right">
        <div class="value">{{ card.display }}</div>
        <div class="suit">{{ getSuitSymbol(card.suit) }}</div>
      </div>
    </div>
    <div v-else class="card-back">
      <div class="back-pattern"></div>
    </div>
  </div>
</template>


<script lang="ts">
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
  border: 1px solid #ddd;
  border-radius: 8px;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
  cursor: default;
  overflow: hidden;
}

.playing-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.card-front {
  height: 100%;
  padding: 5px;
  background: white;
}

.card-corner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.top-left {
  top: 5px;
  left: 5px;
}

.bottom-right {
  bottom: 5px;
  right: 5px;
  transform: rotate(180deg);
}

.value {
  font-size: 1.2rem;
  font-weight: bold;
}

.suit {
  font-size: 1rem;
}

.card-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.suit-large {
  font-size: 2.5rem;
}

.card-back {
  height: 100%;
  background: #2962ff;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* Optional: Add a subtle inner border */
.card-front::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  right: 3px;
  bottom: 3px;
  border: 1px solid #eee;
  border-radius: 6px;
  pointer-events: none;
}

@media (max-width: 768px) {
  .playing-card {
    width: 80px;
    height: 112px;
  }

  .value {
    font-size: 1rem;
  }

  .suit {
    font-size: 0.9rem;
  }

  .suit-large {
    font-size: 2rem;
  }
}
</style>
