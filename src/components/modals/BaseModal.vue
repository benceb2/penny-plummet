<script setup lang="ts">
defineProps<{
  show: boolean
  title: string
  centered?: boolean
  static?: boolean
}>()
</script>

<template>
  <div v-if="show">
    <div class="modal show d-block" tabindex="-1">
      <div :class="['modal-dialog', { 'modal-dialog-centered': centered }]">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
          <div class="modal-footer" v-if="$slots.footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show"></div>
  </div>
</template>
