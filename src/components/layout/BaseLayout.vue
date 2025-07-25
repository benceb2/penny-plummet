<script setup lang="ts">

defineProps<{
  title: string
  icon?: string
  fontawesomeIcon?: string
}>()
</script>

<template>
  <main class="container py-4">
    <div class="row mb-4">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h2 class="text-dark mb-0">
            <!-- Bootstrap Icons -->
            <i v-if="icon && !fontawesomeIcon" :class="`bi bi-${icon} me-2`"></i>
            <!-- Font Awesome Icons -->
            <i v-if="fontawesomeIcon" :class="`fa ${fontawesomeIcon} me-2`"></i>
            {{ title }}
          </h2>
        </div>
      </div>
    </div>
    <slot></slot>
  </main>
</template>

<style scoped>
:slotted(.row) {
  margin-bottom: 1.5rem;
}

:slotted(.row:last-child) {
  margin-bottom: 0;
}
</style>
