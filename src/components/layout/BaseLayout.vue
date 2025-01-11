<!-- BaseLayout.vue -->
<script setup lang="ts">
import { useUserStore } from '@/stores/userStore'

defineProps<{
  title: string
  icon?: string
  fontawesomeIcon?: string
  showBalance?: boolean
}>()

const userStore = useUserStore()
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
          <div v-if="showBalance" class="d-flex gap-3 align-items-center">
            <div class="bg-light text-white px-4 py-2 rounded-3">
              <i class="bi bi-wallet2 me-1"></i>
              <span class="text-muted me-2">Chips:</span>
              <span class="text-primary fw-bold">{{ userStore.formattedChips }}</span>
            </div>
            <slot name="header-actions"></slot>
          </div>
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
