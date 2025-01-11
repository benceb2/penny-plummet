<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

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

// European roulette wheel sequence
const WHEEL_SEQUENCE = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

const getNumberColor = (num: number): string => {
  if (num === 0) return 'bg-success text-white' // Green for zero
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
  return redNumbers.includes(num) ? 'bg-danger text-white' : 'bg-dark text-white'
}

// Generate a sequence that shows more numbers for a longer spin animation
const generateSpinSequence = () => {
  // Repeat the sequence 5 times for a longer strip
  return [...WHEEL_SEQUENCE, ...WHEEL_SEQUENCE, ...WHEEL_SEQUENCE, ...WHEEL_SEQUENCE, ...WHEEL_SEQUENCE]
}

const startSpin = async () => {
  if (!spinnerRef.value || !numbersStrip.value || isAnimating.value || props.winningNumber === null) return

  isAnimating.value = true

  // Reset position
  numbersStrip.value.style.transition = 'none'
  numbersStrip.value.style.transform = 'translateX(0)'

  // Force reflow
  void numbersStrip.value.offsetWidth

  // Calculate final position
  const numberWidth = 60 // Width of each number block
  const numbers = generateSpinSequence()

  // Find the last occurrence of the winning number in our sequence
  const winningIndex = numbers.lastIndexOf(props.winningNumber)

  // Calculate the position to center the winning number
  const finalPosition = -(winningIndex * numberWidth + numberWidth / 2 - spinnerRef.value.offsetWidth / 2)

  // Add some random extra distance for variety in spin length
  const extraDistance = Math.random() * 100 - 50

  // Start animation with easing
  const SPIN_DURATION = 4000 // 4 seconds
  numbersStrip.value.style.transition = `transform ${SPIN_DURATION}ms cubic-bezier(0.15, 0.85, 0.25, 1)`
  numbersStrip.value.style.transform = `translateX(${finalPosition + extraDistance}px)`

  // Reset after animation and emit event
  setTimeout(() => {
    isAnimating.value = false
    emit('spinComplete')
  }, SPIN_DURATION)
}

watch(() => props.isSpinning, (newValue) => {
  if (newValue && props.winningNumber !== null) {
    startSpin()
  }
})

// Initialize position
onMounted(() => {
  if (numbersStrip.value && props.winningNumber !== null) {
    const numbers = generateSpinSequence()
    const winningIndex = numbers.lastIndexOf(props.winningNumber)
    const numberWidth = 60
    const finalPosition = -(winningIndex * numberWidth + numberWidth / 2 - (spinnerRef.value?.offsetWidth ?? 0) / 2)
    numbersStrip.value.style.transform = `translateX(${finalPosition}px)`
  }
})
</script>

<template>
  <div class="roulette-spinner-container mb-4">
    <div ref="spinnerRef" class="roulette-spinner">
      <div ref="numbersStrip" class="numbers-strip">
        <div v-for="(number, index) in generateSpinSequence()"
          :key="index"
          class="number-block"
          :class="getNumberColor(number)">
          {{ number }}
        </div>
      </div>
    </div>
    <!-- Central indicator -->
    <div class="pointer"></div>
  </div>
</template>

<style scoped>
.roulette-spinner-container {
  position: relative;
  overflow: hidden;
  height: 80px;
  background: #1a1a1a;
  border-radius: 8px;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}

.roulette-spinner {
  overflow: hidden;
  height: 70px;
  margin: 5px 0;
}

.numbers-strip {
  display: flex;
  transform: translateX(0);
  will-change: transform;
  height: 100%;
}

.number-block {
  flex: 0 0 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  margin: 5px 2px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.pointer {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom,
      #ffd700,
      #ffed4a 50%,
      #ffd700);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  z-index: 10;
}

/* Add blur effect during animation */
.numbers-strip {
  transition-property: transform, filter;
}

.numbers-strip[style*="transition"] {
  filter: blur(1px);
}
</style>
