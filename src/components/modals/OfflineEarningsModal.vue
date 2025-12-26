<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
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
const { t } = useI18n()

// Convert seconds to readable format
const formattedTime = computed(() => {
  const hours = Math.floor(props.timeAway / 3600)
  const minutes = Math.floor((props.timeAway % 3600) / 60)
  const hourUnit = t('time.units.hourShort')
  const minuteUnit = t('time.units.minuteShort')
  return hours > 0
    ? `${hours}${hourUnit} ${minutes}${minuteUnit}`
    : `${minutes}${minuteUnit}`
})
</script>

<template>
  <BaseModal
    :show="show"
    :title="t('offlineEarningsModal.title')"
    centered
    static>
    <div class="text-center">
      <div class="mb-3">
        <i class="bi bi-piggy-bank-fill text-success" style="font-size: 48px;"></i>
      </div>
      <p>{{ t('offlineEarningsModal.intro', { time: formattedTime }) }}</p>
      <p class="text-success font-bold mt-3 text-xl">
        {{ t('offlineEarningsModal.collected', { amount: formatIntAsCurrency(earnings) }) }}
      </p>
      <p class="text-muted">
        {{ t('offlineEarningsModal.description') }}
      </p>
    </div>

    <template #footer>
      <button
        @click="emit('close')"
        class="btn btn-primary w-100">
        {{ t('offlineEarningsModal.confirm') }}
      </button>
    </template>
  </BaseModal>
</template>
