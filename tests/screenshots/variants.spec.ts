import { test, expect } from '@playwright/test'
import { gotoRoute, preparePage, waitForToastsToClear } from './helpers'

/**
 * States the route screenshots never reach: mid-hand tables, open bottom
 * sheets, the onboarding modals and the second locale. These run on the
 * primary phone project only — see `playwright.config.ts`.
 */

test('blackjack: player turn', async ({ page }) => {
  await preparePage(page)
  await gotoRoute(page, '/blackjack', 'Blackjack')

  await page.getByRole('button', { name: 'Bet 100', exact: true }).click()
  await page.getByRole('button', { name: 'Deal · $100' }).click()
  await page.getByRole('button', { name: 'Hit', exact: true }).waitFor({ state: 'visible' })
  await waitForToastsToClear(page)

  await expect(page).toHaveScreenshot('blackjack-player-turn.png')
})

test('blackjack: rules sheet', async ({ page }) => {
  await preparePage(page)
  await gotoRoute(page, '/blackjack', 'Blackjack')

  await page.getByRole('button', { name: 'Rules and payouts' }).click()
  await expect(page.locator('.rules-sheet.offcanvas.show')).toBeVisible()

  await expect(page).toHaveScreenshot('blackjack-rules-sheet.png')
})

test('roulette: bets placed', async ({ page }) => {
  await preparePage(page)
  await gotoRoute(page, '/roulette', 'Roulette')

  await page.getByRole('button', { name: 'Place bet on RED' }).click()
  await page.getByRole('button', { name: 'Place bet on number 17', exact: true }).click()
  await expect(page.locator('.outside-cell--active').first()).toBeVisible()
  await waitForToastsToClear(page)

  await expect(page).toHaveScreenshot('roulette-bets-placed.png')
})

test('clicker: upgrades sheet', async ({ page }) => {
  await preparePage(page)
  await gotoRoute(page, '/clicker', 'Earn Chips')

  await page.getByRole('button', { name: 'Upgrades' }).click()
  await expect(page.locator('#clickerUpgrades.show')).toBeVisible()

  await expect(page).toHaveScreenshot('clicker-upgrades-sheet.png')
})

test('onboarding: consent modal', async ({ page }) => {
  await preparePage(page, { player: 'new' })
  await gotoRoute(page, '/', 'Welcome to Penny Plummet!')

  await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible()

  await expect(page).toHaveScreenshot('onboarding-consent.png')
})

test('onboarding: username modal', async ({ page }) => {
  await preparePage(page, { player: 'unnamed' })
  await gotoRoute(page, '/', 'Welcome to Penny Plummet!')

  await expect(page.getByLabel('Please enter your username:')).toBeVisible()

  await expect(page).toHaveScreenshot('onboarding-username.png')
})

test('locale: hungarian lobby', async ({ page }) => {
  await preparePage(page, { locale: 'hu-HU' })
  await page.goto('/')
  await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' })
  await page.evaluate(() => document.fonts.ready)

  await expect(page).toHaveScreenshot('locale-hungarian-lobby.png')
})
