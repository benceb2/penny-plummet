<script setup lang="ts">
import { ref, onMounted } from 'vue'

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

const getNumberColor = (num: number): string => {
  if (num === 0) return 'bg-success text-white'
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
  return redNumbers.includes(num) ? 'bg-danger text-white' : 'bg-dark text-white'
}

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

  const numberWidth = 64
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
  <div class="card mb-3">
    <div class="card-body p-2">
      <div class="roulette-spinner-container">
        <div ref="spinnerRef" class="roulette-spinner">
          <div ref="numbersStrip" class="numbers-strip">
            <div
              v-for="(number, index) in generateSpinSequence()"
              :key="`${index}-${number}`"
              :class="['number-block', getNumberColor(number)]">
              {{ number }}
            </div>
          </div>
        </div>
        <div class="pointer"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.roulette-spinner-container {
  position: relative;
  overflow: hidden;
  height: 80px;
  background: linear-gradient(to right, #0d5a2e, #0a4122);
  border-radius: 0.5rem;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
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
  flex: 0 0 60px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.25rem;
  margin: 0 2px;
  border-radius: 0.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.pointer {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 20px solid #ffc107;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  z-index: 10;
}

.pointer::before {
  content: '';
  position: absolute;
  bottom: 20px;
  left: -2px;
  width: 4px;
  height: 30px;
  background: #ffc107;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .roulette-spinner-container {
    height: 60px;
  }

  .number-block {
    flex: 0 0 45px;
    height: 40px;
    font-size: 1rem;
  }
}
</style>
