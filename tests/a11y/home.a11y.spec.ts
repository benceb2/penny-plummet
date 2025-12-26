import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { acceptConsentIfPresent, setUsernameIfPrompted } from './helpers'

test('home view has no detectable axe violations', async ({ page }) => {
  await page.goto('/')

  await acceptConsentIfPresent(page)
  await setUsernameIfPrompted(page)

  await page.getByRole('heading', { name: 'Welcome to Penny Plummet!' }).waitFor({ state: 'visible' })

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
