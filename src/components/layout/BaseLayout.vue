<script setup lang="ts">

defineProps<{
  title?: string
  bootstrapIcon?: string
  fontawesomeIcon?: string
}>()
</script>

<template>
  <section class="container py-2 pt-4">
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h2 class="text-dark mb-0">
            <i v-if="bootstrapIcon && !fontawesomeIcon" :class="`bi bi-${bootstrapIcon} me-2`" aria-hidden="true"></i>
            <i v-else-if="fontawesomeIcon" :class="`fa ${fontawesomeIcon} me-2`" aria-hidden="true"></i>
            {{ title }}
          </h2>
        </div>
      </div>
    </div>
    <slot></slot>
  </section>
</template>

<style scoped>
:slotted(.row) {
  margin-bottom: 1.5rem;
}

:slotted(.row:last-child) {
  margin-bottom: 0;
}
</style>
