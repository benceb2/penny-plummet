<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  bootstrapIcon?: string
  showHeader?: boolean
  showMobileStickyActions?: boolean
  metricsAriaLabel?: string
  mainAriaLabel?: string
  sidebarAriaLabel?: string
  footerActionsAriaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  bootstrapIcon: undefined,
  showHeader: true,
  showMobileStickyActions: false,
  metricsAriaLabel: undefined,
  mainAriaLabel: undefined,
  sidebarAriaLabel: undefined,
  footerActionsAriaLabel: undefined
})

const hasStickyFooter = computed(() => props.showMobileStickyActions)
</script>

<template>
  <section class="game-shell">
    <header
      v-if="showHeader"
      class="game-shell__header game-ui-card game-ui-elevation-sm"
      :aria-label="title">
      <div class="d-flex align-items-center gap-2 flex-wrap">
        <h2 class="section-title mb-0">
          <i
            v-if="bootstrapIcon"
            :class="`bi bi-${bootstrapIcon} me-2`"
            aria-hidden="true"></i>
          {{ title }}
        </h2>
      </div>
      <div v-if="$slots.headerActions" class="d-flex align-items-center gap-2 flex-wrap justify-content-end">
        <slot name="headerActions"></slot>
      </div>
    </header>

    <section
      v-if="$slots.metrics"
      class="game-shell__metrics"
      :aria-label="metricsAriaLabel">
      <slot name="metrics"></slot>
    </section>

    <div class="row g-3 g-lg-4 game-shell__body">
      <section class="col-12 col-lg-8 order-2 order-lg-1" :aria-label="mainAriaLabel">
        <slot name="main"></slot>
      </section>

      <aside class="col-12 col-lg-4 order-1 order-lg-2" :aria-label="sidebarAriaLabel">
        <slot name="sidebar"></slot>
      </aside>
    </div>

    <div
      v-if="hasStickyFooter && $slots.footerActions"
      class="game-shell__mobile-actions d-lg-none"
      :aria-label="footerActionsAriaLabel">
      <slot name="footerActions"></slot>
    </div>
  </section>
</template>
