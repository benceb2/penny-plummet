<script setup lang="ts">
/**
 * Shared game primitive: overlay banner shown over a GameScreen stage when a
 * round ends (replaces src/components/GameResult.vue for new game screens).
 * Callers supply the headline/detail copy and the win/loss/push amount as a
 * plain magnitude; the sign and colour are derived from `type`. Tap
 * anywhere, Enter or Escape to dismiss. Generic across games, no game logic.
 */
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatIntAsCurrency } from '@/utils/numberFormatUtil'

const props = withDefaults(defineProps<{
  show: boolean
  type: 'win' | 'loss' | 'push'
  amount: number
  headline: string
  detail?: string
  /** Auto-dismiss after this many ms; 0 (default) disables auto-dismiss. */
  autoDismiss?: number
}>(), {
  autoDismiss: 0
})

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

let dismissTimer: ReturnType<typeof setTimeout> | null = null

function clearDismissTimer() {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
}

function close() {
  clearDismissTimer()
  emit('close')
}

watch(() => props.show, (visible) => {
  clearDismissTimer()
  if (visible && props.autoDismiss > 0) {
    dismissTimer = setTimeout(close, props.autoDismiss)
  }
}, { immediate: true })

function handleKeydown(event: KeyboardEvent) {
  if (!props.show) return
  if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    close()
  }
}

onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  clearDismissTimer()
})

const amountLabel = computed(() => {
  const magnitude = formatIntAsCurrency(Math.abs(props.amount))
  if (props.type === 'win') return `+${magnitude}`
  if (props.type === 'loss') return `-${magnitude}`
  return formatIntAsCurrency(0)
})
</script>

<template>
  <div
    v-if="show"
    class="result-banner"
    role="dialog"
    aria-live="polite"
    :aria-label="headline"
    tabindex="-1"
    @click="close">
    <div class="result-banner-card" :class="`result-banner-card--${type}`">
      <p class="result-banner-eyebrow">{{ headline }}</p>
      <p class="result-banner-amount" :class="`result-banner-amount--${type}`">{{ amountLabel }}</p>
      <p v-if="detail" class="result-banner-detail">{{ detail }}</p>
      <p class="result-banner-hint">{{ t('game.tapToContinue') }}</p>
    </div>
  </div>
</template>

<style scoped>
.result-banner {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(4, 12, 9, .44);
  z-index: 3;
  cursor: pointer;
}

.result-banner-card {
  width: 272px;
  max-width: calc(100% - 2rem);
  padding: 1.5rem 1.375rem 1.25rem;
  text-align: center;
  border-radius: 20px;
  background: rgba(9, 16, 13, .92);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  box-shadow: 0 0 0 1px rgba(225, 178, 90, .55), 0 24px 60px rgba(0, 0, 0, .65), 0 0 46px rgba(225, 178, 90, .14);
  animation: result-banner-pop .45s cubic-bezier(.2, .8, .2, 1) both, result-banner-glow 2.6s ease-in-out .5s infinite;
  cursor: default;
}

.result-banner-eyebrow {
  font-family: var(--pp-font-display);
  font-size: .8125rem;
  letter-spacing: .26em;
  text-transform: uppercase;
  color: var(--pp-gold);
  margin: 0 0 .375rem;
}

.result-banner-amount {
  font-family: var(--pp-font-display);
  font-weight: 700;
  font-size: 3.25rem;
  line-height: 1;
  color: var(--pp-cream);
  margin: 0 0 .625rem;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 2px 0 rgba(0, 0, 0, .4);
}

.result-banner-amount--win {
  color: #DDF5E6;
}

.result-banner-amount--loss {
  color: #FBD8D5;
}

.result-banner-detail {
  margin: 0;
  font-size: .8125rem;
  color: var(--pp-cream-dim);
  font-variant-numeric: tabular-nums;
}

.result-banner-hint {
  margin: .875rem 0 0;
  font-size: .6875rem;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: rgba(244, 238, 223, .42);
}

@keyframes result-banner-pop {
  from {
    transform: scale(.9);
    opacity: 0;
  }
}

@keyframes result-banner-glow {

  0%,
  100% {
    box-shadow: 0 0 0 1px rgba(225, 178, 90, .55), 0 24px 60px rgba(0, 0, 0, .65), 0 0 46px rgba(225, 178, 90, .14);
  }

  50% {
    box-shadow: 0 0 0 1px rgba(225, 178, 90, .75), 0 24px 60px rgba(0, 0, 0, .65), 0 0 60px rgba(225, 178, 90, .26);
  }
}
</style>
