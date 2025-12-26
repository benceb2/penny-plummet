import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { configureAxe } from 'vitest-axe'
import BaseModal from '@/components/modals/BaseModal.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import BasePagination from '@/components/layout/BasePagination.vue'
import UnsupportedBrowser from '@/components/UnsupportedBrowser.vue'

const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
  },
})

const runAxe = async (wrapper: ReturnType<typeof mount>) => {
  const results = await axe(wrapper.element)
  expect(results.violations).toHaveLength(0)
  wrapper.unmount()
}

describe('Shared components accessibility', () => {
  it('BaseModal has no axe violations', async () => {
    const wrapper = mount(BaseModal, {
      attachTo: document.body,
      props: {
        show: true,
        title: 'Test modal',
        centered: true,
        static: true,
      },
      slots: {
        default: '<p>Modal content</p>',
        footer: '<button type="button">Confirm</button>',
      },
    })

    await runAxe(wrapper)
  })

  it('AppFooter has no axe violations', async () => {
    const wrapper = mount(AppFooter, {
      attachTo: document.body,
    })

    await runAxe(wrapper)
  })

  it('BasePagination has no axe violations', async () => {
    const wrapper = mount(BasePagination, {
      attachTo: document.body,
      props: {
        currentPage: 2,
        totalPages: 5,
      },
    })

    await runAxe(wrapper)
  })

  it('UnsupportedBrowser has no axe violations', async () => {
    const wrapper = mount(UnsupportedBrowser, {
      attachTo: document.body,
    })

    await runAxe(wrapper)
  })
})
