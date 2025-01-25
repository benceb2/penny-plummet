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
  const pageNumbers: (number | '...')[] = []
  const windowSize = 2 // Pages to show on each side

  // Always show first page
  pageNumbers.push(1)

  const start = Math.max(2, props.currentPage - windowSize)
  const end = Math.min(props.totalPages - 1, props.currentPage + windowSize)

  // Add dots after 1 if there's a gap
  if (start > 2) {
    pageNumbers.push('...')
  }

  // Add pages within the window
  for (let i = start; i <= end; i++) {
    pageNumbers.push(i)
  }

  // Add dots before last page if there's a gap
  if (end < props.totalPages - 1) {
    pageNumbers.push('...')
  }

  // Always show last page if we have more than one page
  if (props.totalPages > 1) {
    pageNumbers.push(props.totalPages)
  }

  return pageNumbers
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
