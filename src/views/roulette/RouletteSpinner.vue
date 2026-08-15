<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { pocketColor } from '@/utils/rouletteUtil'

const props = defineProps<{
  isSpinning: boolean
  winningNumber: number | null
}>()

const emit = defineEmits<{
  (e: 'spinComplete'): void
}>()

const spinnerRef = ref<HTMLDivElement | null>(null)
const numbersStrip = ref<HTMLDivElement | null>(null)
const isAnimating = ref(false)

// Real European roulette wheel sequence
const BASE_SEQUENCE = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

const generateSpinSequence = () => {
  // Create multiple copies for smooth scrolling
  return [...BASE_SEQUENCE, ...BASE_SEQUENCE, ...BASE_SEQUENCE, ...BASE_SEQUENCE, ...BASE_SEQUENCE]
}

const startSpin = async () => {
  if (!spinnerRef.value || !numbersStrip.value || isAnimating.value || props.winningNumber === null) {
    return
  }

  isAnimating.value = true

  // Reset position instantly
  numbersStrip.value.style.transition = 'none'
  numbersStrip.value.style.transform = 'translateX(0)'

  // Force browser to apply the reset
  void numbersStrip.value.offsetWidth

  const numberWidth = 48
  const sequence = generateSpinSequence()

  // Find winning number in middle sequences (for better animation)
  const baseLength = BASE_SEQUENCE.length
  let targetIndex = -1

  // Look for the winning number in the 3rd or 4th repetition
  for (let rep = 2; rep < 4; rep++) {
    const startIdx = baseLength * rep
    for (let i = 0; i < baseLength; i++) {
      if (sequence[startIdx + i] === props.winningNumber) {
        targetIndex = startIdx + i
        break
      }
    }
    if (targetIndex !== -1) break
  }

  if (targetIndex === -1) {
    console.error('Could not find winning number in sequence:', props.winningNumber)
    isAnimating.value = false
    return
  }

  // Calculate position to center the winning number
  const spinnerCenter = spinnerRef.value.offsetWidth / 2
  const finalPosition = -(targetIndex * numberWidth) + (spinnerCenter - numberWidth / 2)

  // Apply the animation
  requestAnimationFrame(() => {
    if (!numbersStrip.value) return

    const SPIN_DURATION = 4000
    numbersStrip.value.style.transition = `transform ${SPIN_DURATION}ms cubic-bezier(0.17, 0.67, 0.12, 0.99)`
    numbersStrip.value.style.transform = `translateX(${finalPosition}px)`

    setTimeout(() => {
      isAnimating.value = false
      emit('spinComplete')
    }, SPIN_DURATION)
  })
}

// Start spinning when component mounts (since it only renders when spinning)
onMounted(() => {
  if (props.isSpinning && props.winningNumber !== null) {
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      startSpin()
    }, 100)
  }
})
</script>

<template>
  <div class="roulette-spinner-container">
    <div ref="spinnerRef" class="roulette-spinner">
      <div ref="numbersStrip" class="numbers-strip">
        <div
          v-for="(number, index) in generateSpinSequence()"
          :key="`${index}-${number}`"
          class="number-block"
          :class="`number-block--${pocketColor(number)}`">
          {{ number }}
        </div>
      </div>
    </div>
    <div class="pointer" aria-hidden="true"></div>
  </div>
</template>

<style scoped>
.roulette-spinner-container {
  position: relative;
  overflow: hidden;
  height: 64px;
  border-radius: 10px;
  background: rgba(0, 0, 0, .28);
  box-shadow: inset 0 0 0 1px var(--pp-line), inset 0 2px 10px rgba(0, 0, 0, .4);
}

.roulette-spinner {
  overflow: hidden;
  height: 100%;
  position: relative;
}

.numbers-strip {
  display: flex;
  height: 100%;
  align-items: center;
  will-change: transform;
}

.number-block {
  flex: 0 0 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--pp-font-ui);
  font-weight: 800;
  font-size: 1.05rem;
  font-variant-numeric: tabular-nums;
  color: var(--pp-cream);
  margin: 0 2px;
  border-radius: 50%;
  border: 1px solid rgba(244, 238, 223, .18);
}

.number-block--red {
  background: var(--pp-card-red);
}

.number-block--black {
  background: var(--pp-card-black);
}

.number-block--green {
  background: #1C8A54;
}

.pointer {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 10px solid var(--pp-gold);
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, .4));
  z-index: 1;
}

@media (max-width: 767.98px) {
  .roulette-spinner-container {
    height: 56px;
  }

  .number-block {
    flex: 0 0 38px;
    height: 38px;
    font-size: .9rem;
  }
}
</style>
