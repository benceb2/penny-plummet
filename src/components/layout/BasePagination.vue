<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  (e: 'page-change', page: number): void
}>()

const pages = computed(() => {
  const delta = 2
  const range: number[] = []
  const rangeWithDots: (number | '...')[] = []
  let l: number | undefined

  range.push(1)

  for (let i = props.currentPage - delta; i <= props.currentPage + delta; i++) {
    if (i < props.totalPages && i > 1) {
      range.push(i)
    }
  }

  if (props.totalPages > 1) {
    range.push(props.totalPages)
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})
</script>

<template>
  <nav aria-label="Page navigation" class="mt-4">
    <ul class="pagination justify-content-center">
      <!-- First Page -->
      <li
        class="page-item"
        :class="{ disabled: currentPage === 1 }">
        <button
          class="page-link"
          @click="emit('page-change', 1)"
          :disabled="currentPage === 1">
          <i class="bi bi-chevron-double-left"></i>
        </button>
      </li>

      <!-- Previous -->
      <li
        class="page-item"
        :class="{ disabled: currentPage === 1 }">
        <button
          class="page-link"
          @click="emit('page-change', currentPage - 1)"
          :disabled="currentPage === 1">
          <i class="bi bi-chevron-left"></i>
        </button>
      </li>

      <!-- Page Numbers -->
      <li
        v-for="page in pages"
        :key="page"
        class="page-item"
        :class="{ active: page === currentPage, disabled: page === '...' }">
        <button
          class="page-link"
          @click="page !== '...' && emit('page-change', typeof page === 'number' ? page : currentPage)">
          {{ page }}
        </button>
      </li>

      <!-- Next -->
      <li
        class="page-item"
        :class="{ disabled: currentPage === totalPages }">
        <button
          class="page-link"
          @click="emit('page-change', currentPage + 1)"
          :disabled="currentPage === totalPages">
          <i class="bi bi-chevron-right"></i>
        </button>
      </li>

      <!-- Last Page -->
      <li
        class="page-item"
        :class="{ disabled: currentPage === totalPages }">
        <button
          class="page-link"
          @click="emit('page-change', totalPages)"
          :disabled="currentPage === totalPages">
          <i class="bi bi-chevron-double-right"></i>
        </button>
      </li>
    </ul>
  </nav>
</template>
