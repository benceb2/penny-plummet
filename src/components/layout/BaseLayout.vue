<script setup lang="ts">
defineProps<{
  title?: string
  bootstrapIcon?: string
  fontawesomeIcon?: string
}>()
</script>

<template>
  <section class="premium-layout">
    <header class="premium-header">
      <div class="title-group">
        <h1 class="text-hero">
          <i v-if="bootstrapIcon && !fontawesomeIcon" :class="`bi bi-${bootstrapIcon}`" aria-hidden="true"></i>
          <i v-else-if="fontawesomeIcon" :class="`fa ${fontawesomeIcon}`" aria-hidden="true"></i>
          {{ title }}
        </h1>
      </div>

      <div v-if="$slots['header-actions']" class="actions-group">
        <slot name="header-actions"></slot>
      </div>
    </header>

    <main class="premium-content">
      <slot></slot>
    </main>
  </section>
</template>

<style scoped>
.premium-layout {
  padding: var(--space-element) var(--space-item);
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: var(--space-group);
}

.premium-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: var(--space-item);
}

.title-group h1 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-item);
}

.premium-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-group);
}

@media (max-width: 767px) {
  .premium-layout {
    padding: var(--space-item);
    gap: var(--space-element);
  }

  .premium-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
