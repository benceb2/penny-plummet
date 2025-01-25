import { ref, computed, type Ref } from 'vue'

interface PaginationOptions {
  itemsPerPage?: number
  initialPage?: number
}

export function usePagination<T>(items: T[] | Ref<T[]>, options: PaginationOptions = {}) {
  const currentPage = ref(options.initialPage || 1)
  const itemsPerPage = ref(options.itemsPerPage || 10)

  const totalPages = computed(() => {
    const total = Array.isArray(items) ? items.length : items.value.length
    return Math.ceil(total / itemsPerPage.value)
  })

  const paginatedItems = computed(() => {
    const itemsList = Array.isArray(items) ? items : items.value
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return itemsList.slice(start, end)
  })

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage
  }
}
