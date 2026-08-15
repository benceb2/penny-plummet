import { test, expect } from '@playwright/test'
import { acceptConsentIfPresent, setUsernameIfPrompted } from './helpers'

test.describe('app shell', () => {
  test('tab bar is visible on mobile and the desktop nav is hidden', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)

    await expect(page.getByRole('navigation', { name: 'Tab bar' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeHidden()
  })

  test('desktop nav is visible and the tab bar is hidden on large viewports', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)

    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Tab bar' })).toBeHidden()
  })

  test('HUD balance and level stay visible while scrolling a long route', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/about')

    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)

    await page.getByRole('heading', { name: 'About', level: 1 }).waitFor({ state: 'visible' })
    await page.mouse.wheel(0, 800)

    await expect(page.getByRole('link', { name: 'Penny Plummet' })).toBeVisible()
  })
})
