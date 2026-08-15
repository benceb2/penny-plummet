<script setup lang="ts">
/**
 * Shared game primitive: full-height layout for a game route (blackjack,
 * roulette, ...). Fills the app's <main>. Provides a `stage` slot for the
 * play area and a `tray` slot for the action tray, which sticks directly
 * above the tab bar on narrow viewports. No game-specific logic lives here.
 *
 * The optional `title` renders as a visually-hidden <h1> so the route still
 * has an accessible, findable heading even though the felt has no visible
 * page title; it also labels the stage region for screen reader users.
 *
 * The optional `wide` prop widens the lg+ centred column (560px by default,
 * matching blackjack's phone-like felt) for a game whose board genuinely
 * needs more room, e.g. roulette's classic 12x3 table.
 */
defineProps<{
  title?: string
  wide?: boolean
}>()
</script>

<template>
  <div class="game-screen d-flex flex-column flex-grow-1" :class="{ 'game-screen--wide': wide }">
    <h1 v-if="title" class="visually-hidden">{{ title }}</h1>
    <div class="game-screen-stage" role="region" :aria-label="title">
      <slot name="stage" />
    </div>
    <div class="game-screen-tray">
      <slot name="tray" />
    </div>
  </div>
</template>

<style scoped>
.game-screen-stage {
  flex: 1 1 auto;
  min-height: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  /* Card deal-in animations translate in from well outside their final box
     (see PlayingCard's deal keyframes); without clipping, the in-flight card
     widens document.documentElement.scrollWidth past the viewport, which
     makes mobile browsers zoom the layout viewport out for the rest of the
     session. */
  overflow: clip;
}

.game-screen-tray {
  flex: 0 0 auto;
  background: var(--pp-surface);
  border-top: 1px solid var(--pp-line);
  padding: .75rem 1rem;
}

@media (max-width: 991.98px) {
  .game-screen-tray {
    position: sticky;
    bottom: calc(var(--pp-tabbar-height) + env(safe-area-inset-bottom, 0px));
  }
}

/* Below lg the stage/tray fill the phone-width viewport edge to edge; at lg
   and up, constrain and centre them to a phone-like column instead of
   stretching the felt and cards across a wide desktop viewport. */
@media (min-width: 992px) {
  .game-screen {
    width: 100%;
    max-width: 560px;
    margin: 1.5rem auto;
  }

  .game-screen.game-screen--wide {
    max-width: 860px;
  }
}
</style>
