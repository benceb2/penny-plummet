import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { acceptConsentIfPresent, setUsernameIfPrompted } from './helpers'

test('clicker view has no detectable axe violations', async ({ page }) => {
  await page.goto('/clicker')

  await acceptConsentIfPresent(page)
  await setUsernameIfPrompted(page)

  await page.getByRole('heading', { name: 'Earn Chips' }).waitFor({ state: 'visible' })

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test.describe('mobile upgrades sheet', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  })

  test('clicker view upgrades sheet has no detectable axe violations', async ({ page }) => {
    await page.goto('/clicker')

    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)

    await page.getByRole('heading', { name: 'Earn Chips' }).waitFor({ state: 'visible' })

    await page.getByRole('button', { name: 'Upgrades' }).click()
    await page.locator('#clickerUpgrades.show').waitFor({ state: 'visible' })

    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})
