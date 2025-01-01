<script setup lang="ts">
import { computed, onBeforeUnmount, watchEffect } from 'vue'
import BaseModal from './BaseModal.vue'
import { formatIntAsCurrency } from '@/utils/currency'

const props = defineProps<{
  show: boolean
  earnings: number
  timeAway: number // in seconds
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// Convert seconds to readable format
const formattedTime = computed(() => {
  const hours = Math.floor(props.timeAway / 3600)
  const minutes = Math.floor((props.timeAway % 3600) / 60)

  return hours > 0
    ? `${hours}h ${minutes}m`
    : `${minutes}m`
})

// Auto-close after 10 seconds
let autoCloseTimer: number | null = null

watchEffect(() => {
  if (props.show) {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer)
    }
    autoCloseTimer = setTimeout(() => {
      emit('close')
    }, 10000)
  }
})

onBeforeUnmount(() => {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
  }
})
</script>

<template>
  <BaseModal
    :show="show"
    title="Welcome Back!"
    centered
    static>
    <div class="text-center">
      <p>While you were away for {{ formattedTime }}:</p>
      <p class="text-success font-bold mt-3 text-xl">
        +{{ formatIntAsCurrency(earnings) }} clicks earned
      </p>
    </div>

    <template #footer>
      <button
        @click="emit('close')"
        class="btn btn-primary w-100">
        Awesome!
      </button>
    </template>
  </BaseModal>
</template>
