import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { seedPiniaStore } from './helpers'

test('consent modal has no detectable axe violations', async ({ page }) => {
  await seedPiniaStore(page, 'user-store', { consented: false, username: null })

  await page.goto('/')
  await page.getByRole('heading', { name: 'Local Storage Notice' }).waitFor({ state: 'visible' })

  const results = await new AxeBuilder({ page }).include('.modal').analyze()
  expect(results.violations).toEqual([])
})

test('username modal has no detectable axe violations', async ({ page }) => {
  await seedPiniaStore(page, 'user-store', { consented: true, username: null })

  await page.goto('/')
  await page.locator('.modal').getByRole('heading', { name: 'Welcome to Penny Plummet!' }).waitFor({ state: 'visible' })

  const results = await new AxeBuilder({ page }).include('.modal').analyze()
  expect(results.violations).toEqual([])
})

test('offline earnings modal has no detectable axe violations', async ({ page }) => {
  await seedPiniaStore(page, 'user-store', { consented: true, username: 'A11yTester' })
  await seedPiniaStore(page, 'clicker-store', {
    autoClickersCount: 1,
    lastOnlineTimestamp: Date.now() - 60_000
  })

  await page.goto('/')
  await page.getByRole('heading', { name: 'Welcome Back!' }).waitFor({ state: 'visible' })

  const results = await new AxeBuilder({ page }).include('.modal').analyze()
  expect(results.violations).toEqual([])
})
