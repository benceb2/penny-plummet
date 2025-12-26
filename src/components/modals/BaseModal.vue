<script setup lang="ts">
const titleId = `modal-title-${Math.random().toString(36).slice(2, 9)}`
const bodyId = `modal-body-${Math.random().toString(36).slice(2, 9)}`

defineProps<{
  show: boolean
  title: string
  centered?: boolean
  static?: boolean
}>()
</script>

<template>
  <div v-if="show">
    <div
      class="modal show d-block"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      :aria-describedby="bodyId">
      <div :class="['modal-dialog', { 'modal-dialog-centered': centered }]">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" :id="titleId">{{ title }}</h5>
          </div>
          <div class="modal-body" :id="bodyId">
            <slot></slot>
          </div>
          <div class="modal-footer" v-if="$slots.footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" aria-hidden="true"></div>
  </div>
</template>
