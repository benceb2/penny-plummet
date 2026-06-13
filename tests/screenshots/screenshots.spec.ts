import { test, expect } from '@playwright/test'
import { acceptConsentIfPresent, seedPiniaStore, setUsernameIfPrompted } from '../a11y/helpers'

const setupUser = async (page: import('@playwright/test').Page) => {
  await seedPiniaStore(page, 'user-store', {
    consented: true,
    chips: 5000,
    username: 'ScreenshotUser',
    stats: { handsPlayed: 12, totalWinnings: 1500, biggestWin: 800, maxTotalWinnings: 2000 }
  })
  await seedPiniaStore(page, 'clicker-store', {
    clicks: 42,
    autoClickersCount: 2,
    multiplierLevel: 3,
    criticalChance: 0.15,
    autoClickerSpeed: 800,
    manualLifetimeClicks: 500,
    passiveLifetimeClicks: 300,
    lastActiveTimestamp: Date.now()
  })
}

test.describe('screenshots: desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('home', async ({ page }) => {
    await setupUser(page)
    await page.goto('/')
    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)
    await page.getByRole('heading', { name: 'Welcome to Penny Plummet!' }).waitFor({ state: 'visible' })
    await expect(page).toHaveScreenshot('desktop-home.png', { fullPage: true })
  })

  test('blackjack: betting', async ({ page }) => {
    await setupUser(page)
    await page.goto('/blackjack')
    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)
    await page.getByRole('heading', { name: 'Blackjack' }).waitFor({ state: 'visible' })
    await expect(page).toHaveScreenshot('desktop-blackjack-betting.png', { fullPage: true })
  })

  test('roulette', async ({ page }) => {
    await setupUser(page)
    await page.goto('/roulette')
    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)
    await page.locator('h1').filter({ hasText: 'Roulette' }).waitFor({ state: 'visible' })
    await expect(page).toHaveScreenshot('desktop-roulette.png', { fullPage: true })
  })

  test('clicker', async ({ page }) => {
    await setupUser(page)
    await page.goto('/clicker')
    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)
    await page.locator('h1').filter({ hasText: 'Earn Chips' }).waitFor({ state: 'visible' })
    await expect(page).toHaveScreenshot('desktop-clicker.png', { fullPage: true })
  })

  test('achievements', async ({ page }) => {
    await setupUser(page)
    await page.goto('/achievements')
    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)
    await page.locator('h1').filter({ hasText: 'Achievements' }).waitFor({ state: 'visible' })
    await expect(page).toHaveScreenshot('desktop-achievements.png', { fullPage: true })
  })

  test('profile', async ({ page }) => {
    await setupUser(page)
    await page.goto('/profile')
    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)
    await page.locator('h1').filter({ hasText: 'Profile' }).waitFor({ state: 'visible' })
    await expect(page).toHaveScreenshot('desktop-profile.png', { fullPage: true })
  })

  test('about', async ({ page }) => {
    await setupUser(page)
    await page.goto('/about')
    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)
    await page.locator('h1').filter({ hasText: 'About' }).waitFor({ state: 'visible' })
    await expect(page).toHaveScreenshot('desktop-about.png', { fullPage: true })
  })
})

test.describe('screenshots: mobile portrait (iPhone 14)', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

  test('home', async ({ page }) => {
    await setupUser(page)
    await page.goto('/')
    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)
    await page.getByRole('heading', { name: 'Welcome to Penny Plummet!' }).waitFor({ state: 'visible' })
    await expect(page).toHaveScreenshot('mobile-home.png', { fullPage: true })
  })

  test('blackjack: betting', async ({ page }) => {
    await setupUser(page)
    await page.goto('/blackjack')
    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)
    await page.getByRole('heading', { name: 'Blackjack' }).waitFor({ state: 'visible' })
    await expect(page).toHaveScreenshot('mobile-blackjack-betting.png', { fullPage: true })
  })

  test('roulette', async ({ page }) => {
    await setupUser(page)
    await page.goto('/roulette')
    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)
    await page.locator('h1').filter({ hasText: 'Roulette' }).waitFor({ state: 'visible' })
    await expect(page).toHaveScreenshot('mobile-roulette.png', { fullPage: true })
  })

  test('clicker', async ({ page }) => {
    await setupUser(page)
    await page.goto('/clicker')
    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)
    await page.getByRole('heading', { name: 'Earn Chips' }).waitFor({ state: 'visible' })
    await expect(page).toHaveScreenshot('mobile-clicker.png', { fullPage: true })
  })

  test('navbar: open', async ({ page }) => {
    await setupUser(page)
    await page.goto('/')
    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)
    await page.getByRole('button', { name: 'Toggle navigation' }).click()
    await page.waitForTimeout(300)
    await expect(page).toHaveScreenshot('mobile-navbar-open.png', { fullPage: true })
  })
})
