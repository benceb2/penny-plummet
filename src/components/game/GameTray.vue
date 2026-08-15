<script setup lang="ts">
/**
 * Shared game primitive: thin flex wrapper for a GameScreen tray's content
 * rows (chip row, CTA row, ...). Purely layout; no game logic.
 */
</script>

<template>
  <div class="d-flex flex-column gap-3">
    <slot />
  </div>
</template>
