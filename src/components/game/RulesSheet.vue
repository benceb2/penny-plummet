<script setup lang="ts">
/**
 * Shared game primitive: rules/payouts sheet built on Bootstrap's Offcanvas.
 * Bottom sheet below `lg`, right-hand panel at `lg` and up. The caller owns
 * the trigger button (a ghost info-circle button on the stage) and controls
 * visibility via `open` (v-model); this component only renders the sheet
 * itself. Generic across games, no game logic.
 */
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Offcanvas } from 'bootstrap'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  title: string
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { t } = useI18n()

const rootEl = ref<HTMLElement | null>(null)
const isDesktop = ref(false)
let offcanvas: Offcanvas | null = null
let mediaQuery: MediaQueryList | null = null

function syncDesktop() {
  isDesktop.value = mediaQuery?.matches ?? false
}

function handleHidden() {
  emit('update:open', false)
}

onMounted(() => {
  if (!rootEl.value) return

  offcanvas = new Offcanvas(rootEl.value)
  rootEl.value.addEventListener('hidden.bs.offcanvas', handleHidden)

  mediaQuery = window.matchMedia('(min-width: 992px)')
  syncDesktop()
  mediaQuery.addEventListener('change', syncDesktop)

  if (props.open) offcanvas.show()
})

watch(() => props.open, (value) => {
  if (!offcanvas) return
  if (value) {
    offcanvas.show()
  } else {
    offcanvas.hide()
  }
})

onBeforeUnmount(() => {
  rootEl.value?.removeEventListener('hidden.bs.offcanvas', handleHidden)
  mediaQuery?.removeEventListener('change', syncDesktop)
  offcanvas?.dispose()
})
</script>

<template>
  <div
    ref="rootEl"
    class="rules-sheet offcanvas"
    :class="isDesktop ? 'offcanvas-end' : 'offcanvas-bottom'"
    tabindex="-1"
    :aria-label="title">
    <div class="offcanvas-header">
      <h2 class="offcanvas-title rules-sheet-title">{{ title }}</h2>
      <button
        type="button"
        class="btn-close btn-close-white"
        :aria-label="t('game.close')"
        @click="emit('update:open', false)"></button>
    </div>
    <div class="offcanvas-body">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.rules-sheet {
  --bs-offcanvas-bg: var(--pp-surface);
  --bs-offcanvas-color: var(--pp-cream);
  --bs-offcanvas-border-color: var(--pp-line);
}

.rules-sheet-title {
  font-family: var(--pp-font-display);
  font-weight: 700;
}

/* Bottom sheet only: Bootstrap's default offcanvas-bottom height is a fixed
   fraction of the viewport, which leaves rules content cramped or the sheet
   mostly empty depending on how much copy there is. Let it size to its
   content instead, capped so it never covers the whole screen. */
.rules-sheet.offcanvas-bottom {
  --bs-offcanvas-height: auto;
  max-height: 75vh;
  overflow-y: auto;
  border-top-left-radius: var(--pp-radius);
  border-top-right-radius: var(--pp-radius);
}

@media (min-width: 992px) {
  .rules-sheet {
    --bs-offcanvas-width: 360px;
  }
}
</style>
