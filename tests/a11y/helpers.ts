import type { Page } from '@playwright/test'

export const acceptConsentIfPresent = async (page: Page) => {
  const acceptButton = page.getByRole('button', { name: 'Accept' })
  if (await acceptButton.first().isVisible().catch(() => false)) {
    await acceptButton.first().click()
  }
}

export const setUsernameIfPrompted = async (page: Page) => {
  const usernameInput = page.getByLabel('Please enter your username:')
  if (await usernameInput.first().isVisible().catch(() => false)) {
    await usernameInput.fill('A11yTester')
    await page.getByRole('button', { name: 'Start Playing' }).click()
  }
}
