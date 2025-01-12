// RouletteSpinner.vue
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
const spinCount = ref(0) // Add this to force animation restart

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
  return [...BASE_SEQUENCE, ...BASE_SEQUENCE, ...BASE_SEQUENCE]
}

const startSpin = async () => {
  if (!spinnerRef.value || !numbersStrip.value || isAnimating.value || props.winningNumber === null) return

  isAnimating.value = true
  spinCount.value++ // Increment to force animation restart
  console.log('Starting spin to', props.winningNumber)

  // Reset position
  numbersStrip.value.style.transition = 'none'
  numbersStrip.value.style.transform = 'translateX(0)'
  void numbersStrip.value.offsetWidth

  const numberWidth = 64
  const sequence = generateSpinSequence()

  // Find the winning number in the middle sequence
  const baseLength = BASE_SEQUENCE.length
  const startSearchAt = baseLength
  const endSearchAt = baseLength * 2

  let targetIndex = -1
  for (let i = startSearchAt; i < endSearchAt; i++) {
    if (sequence[i] === props.winningNumber) {
      targetIndex = i
      break
    }
  }

  if (targetIndex === -1) {
    console.error('Could not find winning number in sequence')
    return
  }

  const spinnerCenter = spinnerRef.value.offsetWidth / 2
  const finalPosition = -(targetIndex * numberWidth) + (spinnerCenter - numberWidth / 2)

  const SPIN_DURATION = 10000
  numbersStrip.value.style.transition = `transform ${SPIN_DURATION}ms cubic-bezier(0.2, 0.8, 0.2, 0.99)`
  numbersStrip.value.style.transform = `translateX(${finalPosition}px)`

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

onMounted(() => {
  if (numbersStrip.value) {
    numbersStrip.value.style.transform = 'translateX(0)'
  }
})
</script>

<template>
  <div class="roulette-spinner-container mb-4">
    <div ref="spinnerRef" class="roulette-spinner">
      <div ref="numbersStrip" class="numbers-strip" :class="{ 'spinning': isAnimating }" :data-spin-count="spinCount">
        <div v-for="(number, index) in generateSpinSequence()"
          :key="index"
          class="number-block"
          :class="getNumberColor(number)">
          {{ number }}
        </div>
      </div>
    </div>
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
  filter: blur(0px);
  transition: transform, filter;
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

.spinning {
  animation: spinBlur 10s forwards;
}

@keyframes spinBlur {
  0% {
    filter: blur(0px);
  }

  10% {
    filter: blur(1px);
  }

  70% {
    filter: blur(1px);
  }

  100% {
    filter: blur(0px);
  }
}
</style>
