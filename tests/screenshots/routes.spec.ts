import { test, expect } from '@playwright/test'
import { SHOT_TIMEOUT, gotoRoute, preparePage, seedTransactions } from './helpers'

type Route = {
  name: string
  path: string
  heading: string
  /**
   * Content pages scroll, so they are captured whole. Game screens are built to
   * fit the viewport and pin their tray to the bottom of it; a full-page shot of
   * one renders the pinned tray across the middle of the image and is a worse
   * record of the screen than the viewport itself.
   */
  fullPage?: boolean
}

const routes: Route[] = [
  { name: 'lobby', path: '/', heading: 'Welcome to Penny Plummet!' },
  { name: 'blackjack', path: '/blackjack', heading: 'Blackjack' },
  { name: 'roulette', path: '/roulette', heading: 'Roulette' },
  { name: 'clicker', path: '/clicker', heading: 'Earn Chips' },
  { name: 'achievements', path: '/achievements', heading: 'Achievements', fullPage: true },
  { name: 'profile', path: '/profile', heading: 'Profile', fullPage: true },
  { name: 'settings', path: '/settings', heading: 'Settings', fullPage: true },
  { name: 'about', path: '/about', heading: 'About', fullPage: true }
]

for (const route of routes) {
  test(route.name, async ({ page }) => {
    await preparePage(page)
    await gotoRoute(page, route.path, route.heading)

    await expect(page).toHaveScreenshot(`${route.name}.png`, {
      fullPage: route.fullPage ?? false,
      timeout: SHOT_TIMEOUT
    })
  })
}

test('transactions', async ({ page }) => {
  await preparePage(page)
  await gotoRoute(page, '/transactions', 'Transaction History')

  await seedTransactions(page)
  await gotoRoute(page, '/transactions', 'Transaction History')
  // Four fixtures plus the opening-balance row the app writes on first run.
  await expect(page.locator('.transaction-item')).toHaveCount(5)

  await expect(page).toHaveScreenshot('transactions.png', { fullPage: true, timeout: SHOT_TIMEOUT })
})
