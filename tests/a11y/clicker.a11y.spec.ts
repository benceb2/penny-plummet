import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const acceptConsentIfPresent = async (page: Page) => {
  const acceptButton = page.getByRole('button', { name: 'Accept' })
  if (await acceptButton.first().isVisible().catch(() => false)) {
    await acceptButton.first().click()
  }
}

const setUsernameIfPrompted = async (page: Page) => {
  const usernameInput = page.getByLabel('Please enter your username:')
  if (await usernameInput.first().isVisible().catch(() => false)) {
    await usernameInput.fill('A11yTester')
    await page.getByRole('button', { name: 'Start Playing' }).click()
  }
}

test('clicker view has no detectable axe violations', async ({ page }) => {
  await page.goto('/clicker')

  await acceptConsentIfPresent(page)
  await setUsernameIfPrompted(page)

  await page.getByRole('heading', { name: 'Earn Chips' }).waitFor({ state: 'visible' })

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
