<script setup lang="ts">
/**
 * Shared game primitive: a stack of chips representing a bet total. Pass an
 * explicit `chips` array (denominations, bottom to top) to show the exact
 * composition the player placed; otherwise the stack falls back to a greedy
 * split via chipsForAmount(). The top (last) chip shows its own
 * denomination. Generic across games, no bet logic here.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { chipsForAmount, chipStyle } from '@/utils/chipUtil'

const props = defineProps<{
  amount: number
  chips?: number[]
}>()

const { t } = useI18n()

const stackChips = computed(() => props.chips ?? chipsForAmount(props.amount))
</script>

<template>
  <div class="chip-stack" role="img" :aria-label="t('game.betAmount', { amount })">
    <span
      v-for="(value, index) in stackChips"
      :key="index"
      class="chip-stack-chip"
      :class="{ 'chip-stack-chip--dark': chipStyle(value).dark }"
      :style="{ backgroundColor: chipStyle(value).background, top: `${-index * 5}px`, zIndex: index }">
      <template v-if="index === stackChips.length - 1">{{ value }}</template>
    </span>
  </div>
</template>

<style scoped>
.chip-stack {
  position: relative;
  width: 40px;
  height: 40px;
}

.chip-stack-chip {
  position: absolute;
  left: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-family: var(--pp-font-ui);
  font-size: .7rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--pp-cream);
  border: 3px dashed rgba(251, 246, 234, .9);
  box-shadow:
    inset 0 0 0 2px rgba(0, 0, 0, .28),
    inset 0 0 0 5px rgba(255, 255, 255, .08),
    0 3px 6px rgba(0, 0, 0, .45);
}

.chip-stack-chip--dark {
  color: #2A2622;
  border-color: rgba(60, 50, 40, .55);
  box-shadow:
    inset 0 0 0 2px rgba(0, 0, 0, .18),
    inset 0 0 0 5px rgba(0, 0, 0, .05),
    0 3px 6px rgba(0, 0, 0, .45);
}
</style>
