<script setup lang="ts">
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'
import { formatIntAsCurrency } from '@/utils/numberFormatUtil'

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
</script>

<template>
  <BaseModal
    :show="show"
    title="Welcome Back!"
    centered
    static>
    <div class="text-center">
      <div class="mb-3">
        <i class="bi bi-piggy-bank-fill text-success" style="font-size: 48px;"></i>
      </div>
      <p>While you were away for {{ formattedTime }}:</p>
      <p class="text-success font-bold mt-3 text-xl">
        +{{ formatIntAsCurrency(earnings) }} chips collected!
      </p>
      <p class="text-muted">
        Your auto-clickers have been working hard and the chips have been added to your balance.
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
