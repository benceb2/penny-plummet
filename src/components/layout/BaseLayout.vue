<script setup lang="ts">

defineProps<{
  title?: string
  bootstrapIcon?: string
}>()
</script>

<template>
  <section class="container py-2 pt-4 base-layout">
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h1 class="mb-0 page-title">
            <i v-if="bootstrapIcon" :class="`bi bi-${bootstrapIcon} me-2`" aria-hidden="true"></i>
            {{ title }}
          </h1>
          <slot name="header-actions"></slot>
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

@media (max-width: 767px) {
  .base-layout {
    padding-top: 0.75rem !important;
    padding-bottom: 0.75rem !important;
  }

  :slotted(.row) {
    margin-bottom: 1rem;
  }
}
</style>
