<script setup lang="ts">
/**
 * Shared game primitive: a single tappable casino chip used to build a bet.
 * Purely presentational and stateless; the caller tracks which chips have
 * been placed and passes `selected` for whichever one should read as just
 * tapped. Generic across games, no bet logic here.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { chipStyle } from '@/utils/chipUtil'

const props = withDefaults(defineProps<{
  value: number
  selected?: boolean
  disabled?: boolean
  size?: 'sm' | 'md'
}>(), {
  selected: false,
  disabled: false,
  size: 'md'
})

defineEmits<{
  select: []
}>()

const { t } = useI18n()

const style = computed(() => chipStyle(props.value))
</script>

<template>
  <button
    type="button"
    class="chip-button"
    :class="[`chip-button--${size}`, { 'chip-button--selected': selected, 'chip-button--dark': style.dark }]"
    :style="{ backgroundColor: style.background }"
    :aria-pressed="selected"
    :aria-label="t('game.betAmount', { amount: value })"
    :disabled="disabled"
    @click="$emit('select')">
    {{ value }}
  </button>
</template>

<style scoped>
.chip-button {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  padding: 0;
  font-family: var(--pp-font-ui);
  font-size: .7rem;
  font-weight: 800;
  letter-spacing: -.01em;
  font-variant-numeric: tabular-nums;
  color: var(--pp-cream);
  border: 3px dashed rgba(251, 246, 234, .9);
  box-shadow:
    inset 0 0 0 2px rgba(0, 0, 0, .28),
    inset 0 0 0 5px rgba(255, 255, 255, .08),
    0 3px 6px rgba(0, 0, 0, .45);
  transition: transform .15s ease;
  touch-action: manipulation;
  flex: 0 0 auto;
}

.chip-button--sm {
  width: 40px;
  height: 40px;
  font-size: .65rem;
}

.chip-button--dark {
  color: #2A2622;
  border-color: rgba(60, 50, 40, .55);
  box-shadow:
    inset 0 0 0 2px rgba(0, 0, 0, .18),
    inset 0 0 0 5px rgba(0, 0, 0, .05),
    0 3px 6px rgba(0, 0, 0, .45);
}

.chip-button--selected {
  transform: translateY(-5px);
  box-shadow:
    0 0 0 2px var(--pp-surface),
    0 0 0 4px var(--pp-gold),
    inset 0 0 0 2px rgba(0, 0, 0, .28),
    inset 0 0 0 5px rgba(255, 255, 255, .08),
    0 10px 18px rgba(0, 0, 0, .5);
}

.chip-button:disabled {
  opacity: .35;
  cursor: not-allowed;
}
</style>
