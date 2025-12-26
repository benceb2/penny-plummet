import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { seedPiniaStore } from './helpers'

test('home view in Hungarian has no detectable axe violations', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('userLocale', 'hu-HU')
  })
  await seedPiniaStore(page, 'user-store', { consented: true, username: 'A11yTester' })

  await page.goto('/')
  await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' })

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
