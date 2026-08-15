<script setup lang="ts">
/**
 * Playing card face/back. `md` (72x102) is the felt size, `sm` (46x64) is
 * the deck-corner size. Pass `dealIndex` to play the deal-in animation with
 * a 130ms stagger (disabled under prefers-reduced-motion via the global
 * animation-duration override in tokens.css).
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Card } from '@/types/Card'

const props = withDefaults(defineProps<{
  card: Card
  size?: 'sm' | 'md'
  dealIndex?: number
}>(), {
  size: 'md'
})

const { t } = useI18n()

const SUIT_SYMBOLS: Record<Card['suit'], string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
}

const isRed = computed(() => props.card.suit === 'hearts' || props.card.suit === 'diamonds')
const suitSymbol = computed(() => SUIT_SYMBOLS[props.card.suit])

const label = computed(() => {
  if (!props.card.faceUp) return t('blackjack.card.faceDown')
  return t('blackjack.card.faceUp', {
    rank: props.card.display,
    suit: t(`blackjack.card.suits.${props.card.suit}`)
  })
})
</script>

<template>
  <div
    class="playing-card"
    :class="[`playing-card--${size}`, {
      'playing-card--red': isRed,
      'playing-card--dealt': dealIndex !== undefined
    }]"
    :style="dealIndex !== undefined ? { '--pp-deal-index': dealIndex } : undefined"
    role="img"
    :aria-label="label">
    <template v-if="card.faceUp">
      <span class="playing-card-index playing-card-index--tl">
        <b>{{ card.display }}</b>
        <i>{{ suitSymbol }}</i>
      </span>
      <span class="playing-card-pip">{{ suitSymbol }}</span>
      <span class="playing-card-index playing-card-index--br">
        <b>{{ card.display }}</b>
        <i>{{ suitSymbol }}</i>
      </span>
    </template>
    <span v-else class="playing-card-back" aria-hidden="true"></span>
  </div>
</template>

<style scoped>
.playing-card {
  position: relative;
  width: 72px;
  height: 102px;
  border-radius: 7px;
  background: var(--pp-card-face);
  color: var(--pp-card-black);
  box-shadow: 0 6px 14px rgba(0, 0, 0, .4), 0 0 0 1px rgba(0, 0, 0, .18);
  flex: 0 0 auto;
}

.playing-card--red {
  color: var(--pp-card-red);
}

.playing-card--sm {
  width: 46px;
  height: 64px;
  border-radius: 5px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, .4), 0 0 0 1px rgba(0, 0, 0, .18);
}

.playing-card-index {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.playing-card-index b {
  font-family: var(--pp-font-display);
  font-weight: 700;
  font-size: 1.1875rem;
}

.playing-card-index i {
  font-style: normal;
  font-size: .75rem;
  margin-top: 2px;
}

.playing-card-index--tl {
  top: 6px;
  left: 7px;
}

.playing-card-index--br {
  bottom: 6px;
  right: 7px;
  transform: rotate(180deg);
}

.playing-card--sm .playing-card-index b {
  font-size: .8125rem;
}

.playing-card--sm .playing-card-index i {
  font-size: .5625rem;
}

.playing-card--sm .playing-card-index--tl {
  top: 4px;
  left: 4px;
}

.playing-card--sm .playing-card-index--br {
  bottom: 4px;
  right: 4px;
}

.playing-card-pip {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 2.25rem;
  line-height: 1;
}

.playing-card--sm .playing-card-pip {
  font-size: 1.5rem;
}

.playing-card-back {
  position: absolute;
  inset: 5px;
  border-radius: 4px;
  background-color: var(--pp-card-back);
  background-image:
    repeating-linear-gradient(45deg, rgba(255, 255, 255, .12) 0 2px, transparent 2px 9px),
    repeating-linear-gradient(-45deg, rgba(255, 255, 255, .12) 0 2px, transparent 2px 9px);
  box-shadow: inset 0 0 0 1px rgba(251, 246, 234, .55);
}

.playing-card--sm .playing-card-back {
  inset: 3px;
  border-radius: 3px;
}

.playing-card--dealt {
  animation: playing-card-deal .55s cubic-bezier(.2, .7, .2, 1) both;
  animation-delay: calc(var(--pp-deal-index, 0) * 130ms);
}

@keyframes playing-card-deal {
  from {
    transform: translate(120px, -160px) rotate(16deg);
    opacity: 0;
  }
}
</style>
