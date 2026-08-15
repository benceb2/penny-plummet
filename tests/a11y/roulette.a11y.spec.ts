import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { acceptConsentIfPresent, setUsernameIfPrompted } from './helpers'

test('roulette view has no detectable axe violations', async ({ page }) => {
  await page.goto('/roulette')

  await acceptConsentIfPresent(page)
  await setUsernameIfPrompted(page)

  await page.getByRole('heading', { name: 'Roulette', exact: true }).waitFor({ state: 'visible' })

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('placing bets by chip and cell tap has no detectable axe violations', async ({ page }) => {
  await page.goto('/roulette')

  await acceptConsentIfPresent(page)
  await setUsernameIfPrompted(page)

  await page.getByRole('heading', { name: 'Roulette', exact: true }).waitFor({ state: 'visible' })

  await page.getByRole('button', { name: 'Bet 25' }).click()
  // The number grid renders both a mobile and a desktop layout (CSS toggles
  // which is visible per breakpoint); scope to whichever is actually on
  // screen so this does not hit Playwright's strict-mode ambiguity.
  await page.locator('[aria-label="Place bet on number 17"]:visible').click()
  await page.getByRole('button', { name: 'Bet 5' }).click()
  await page.getByRole('button', { name: 'Place bet on Red' }).click()

  await expect(page.locator('.cta-btn--spin')).toContainText('$30')

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('the bets sheet has no detectable axe violations when open', async ({ page }) => {
  await page.goto('/roulette')

  await acceptConsentIfPresent(page)
  await setUsernameIfPrompted(page)

  await page.getByRole('heading', { name: 'Roulette', exact: true }).waitFor({ state: 'visible' })

  await page.getByRole('button', { name: 'Bet 25' }).click()
  // The number grid renders both a mobile and a desktop layout (CSS toggles
  // which is visible per breakpoint); scope to whichever is actually on
  // screen so this does not hit Playwright's strict-mode ambiguity.
  await page.locator('[aria-label="Place bet on number 17"]:visible').click()
  await page.getByRole('button', { name: 'View bets' }).click()
  await page.getByRole('heading', { name: 'Your bets' }).waitFor({ state: 'visible' })

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('the rules sheet has no detectable axe violations when open', async ({ page }) => {
  await page.goto('/roulette')

  await acceptConsentIfPresent(page)
  await setUsernameIfPrompted(page)

  await page.getByRole('heading', { name: 'Roulette', exact: true }).waitFor({ state: 'visible' })

  await page.getByRole('button', { name: 'Rules and payouts' }).click()
  await page.getByRole('heading', { name: 'Rules & payouts' }).waitFor({ state: 'visible' })

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
