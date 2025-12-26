import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { acceptConsentIfPresent, setUsernameIfPrompted } from './helpers'

test('blackjack view has no detectable axe violations', async ({ page }) => {
  await page.goto('/blackjack')

  await acceptConsentIfPresent(page)
  await setUsernameIfPrompted(page)

  await page.getByRole('heading', { name: 'Blackjack' }).waitFor({ state: 'visible' })

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
