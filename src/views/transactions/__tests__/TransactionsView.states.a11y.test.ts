import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { configureAxe } from 'vitest-axe'
import TransactionsView from '@/views/transactions/TransactionsView.vue'
import i18n from '@/i18n'
import { useTransactionStore } from '@/stores/transactionStore'

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
  },
})

const mountTransactionsView = (overrides: Partial<ReturnType<typeof useTransactionStore>> = {}) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const transactionStore = useTransactionStore()

  transactionStore.loadTransactionsPage = async () => {}
  transactionStore.$patch({
    transactions: [],
    latestTransactions: [],
    totalCount: 0,
    stats: {
      total: 0,
      totalWins: 0,
      totalLosses: 0,
      totalPushes: 0,
      netAmount: 0,
    },
    isListLoading: false,
  })
  Object.assign(transactionStore, overrides)

  return mount(TransactionsView, {
    attachTo: document.body,
    global: {
      plugins: [pinia, i18n],
    },
  })
}

const runAxe = async (wrapper: ReturnType<typeof mount>) => {
  const results = await axe(wrapper.element)
  expect(results.violations).toHaveLength(0)
  wrapper.unmount()
}

describe('TransactionsView state accessibility', () => {
  it('loading state has no axe violations', async () => {
    const wrapper = mountTransactionsView({
      isListLoading: true,
      transactions: [],
    })

    await runAxe(wrapper)
  })

  it('empty state has no axe violations', async () => {
    const wrapper = mountTransactionsView({
      isListLoading: false,
      transactions: [],
    })

    await runAxe(wrapper)
  })
})
