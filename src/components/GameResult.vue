<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'

interface Props {
  show: boolean
  result: {
    type: 'win' | 'loss' | 'push'
    amount: number
    message?: string
    details?: string
  }
  autoDismiss?: boolean
  dismissDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  show: false,
  autoDismiss: true,
  dismissDelay: 3000
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const isVisible = ref(false)
const isAnimating = ref(false)
let dismissTimer: number | null = null

// Handle showing/hiding of modal with animations
watch(() => props.show, (newVal) => {
  if (newVal) {
    isVisible.value = true
    isAnimating.value = true

    // Clear any existing timer
    if (dismissTimer) {
      clearTimeout(dismissTimer)
    }

    // Auto-dismiss if enabled
    if (props.autoDismiss) {
      dismissTimer = setTimeout(() => {
        dismiss()
      }, props.dismissDelay)
    }
  }
})

const dismiss = () => {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }

  isAnimating.value = false
  setTimeout(() => {
    isVisible.value = false
    emit('close')
  }, 300) // Shorter exit animation
}

// Handle backdrop click
const handleBackdropClick = (event: MouseEvent) => {
  // Check if clicking on the overlay itself (not the card)
  if (event.target === event.currentTarget) {
    dismiss()
  }
}

// Handle keyboard events
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' || event.key === ' ' || event.key === 'Enter') {
    dismiss()
  }
}

// Add/remove event listeners
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (dismissTimer) {
    clearTimeout(dismissTimer)
  }
})

const resultClass = computed(() => {
  switch (props.result.type) {
    case 'win':
      return 'bg-success'
    case 'loss':
      return 'bg-danger'
    case 'push':
      return 'bg-warning'
    default:
      return 'bg-secondary'
  }
})

const resultIcon = computed(() => {
  switch (props.result.type) {
    case 'win':
      return 'bi-trophy-fill'
    case 'loss':
      return 'bi-x-circle-fill'
    case 'push':
      return 'bi-dash-circle-fill'
    default:
      return 'bi-question-circle-fill'
  }
})

const resultText = computed(() => {
  switch (props.result.type) {
    case 'win':
      return 'WIN!'
    case 'loss':
      return 'LOSS'
    case 'push':
      return 'PUSH'
    default:
      return 'UNKNOWN'
  }
})
</script>

<template>
  <div v-if="isVisible" class="game-result-overlay" @click="handleBackdropClick">
    <!-- Semi-transparent backdrop -->
    <div class="game-result-backdrop" @click="dismiss"></div>

    <!-- Result Card -->
    <div
      class="game-result-card"
      :class="[resultClass, { 'animate-result': isAnimating }]"
      @click.stop>

      <!-- Close button -->
      <button
        class="close-button"
        @click="dismiss"
        aria-label="Close result">
        <i class="bi bi-x-lg"></i>
      </button>

      <!-- Result Icon -->
      <div class="game-result-icon">
        <i :class="['bi', resultIcon, { 'animate-icon': isAnimating }]"></i>
      </div>

      <!-- Result Content -->
      <div class="game-result-content">
        <h2 class="result-title">{{ resultText }}</h2>
        <p class="result-amount">
          {{ props.result.amount.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
          }) }}
        </p>
        <p v-if="props.result.message" class="result-message">
          {{ props.result.message }}
        </p>
        <p v-if="props.result.details" class="result-details">
          {{ props.result.details }}
        </p>

        <!-- Dismiss hint -->
        <p class="dismiss-hint">
          Click to dismiss, press ESC, or wait
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-result-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1060;
  cursor: pointer;
}

.game-result-backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(4px);
}

.game-result-card {
  position: relative;
  width: 90%;
  max-width: 500px;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.5);
  transform: scale(0.95);
  opacity: 0;
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
  cursor: default;
}

.game-result-card.animate-result {
  animation: bounceIn 0.5s ease-out forwards,
    floatUpDown 2s ease-in-out infinite;
  opacity: 1;
  transform: scale(1);
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.game-result-icon {
  margin-bottom: 1.5rem;
}

.game-result-icon i {
  font-size: 5rem;
  color: white;
}

.game-result-icon i.animate-icon {
  animation: spinAndPulse 2s ease-in-out infinite;
}

.game-result-content {
  color: white;
}

.result-title {
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.result-amount {
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.result-message {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.result-details {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 1rem;
}

.dismiss-hint {
  font-size: 0.9rem;
  opacity: 0.7;
  margin-top: 1rem;
  font-style: italic;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }

  50% {
    transform: scale(1.05);
  }

  70% {
    transform: scale(0.9);
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes floatUpDown {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

@keyframes spinAndPulse {
  0% {
    transform: scale(1) rotate(0deg);
  }

  50% {
    transform: scale(1.2) rotate(180deg);
  }

  100% {
    transform: scale(1) rotate(360deg);
  }
}
</style>
