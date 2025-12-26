import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { acceptConsentIfPresent, setUsernameIfPrompted } from './helpers'

test.describe('keyboard and mobile accessibility', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('mobile home view has no detectable axe violations', async ({ page }) => {
    await page.goto('/')

    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)

    const navToggle = page.getByRole('button', { name: 'Toggle navigation' })
    await navToggle.click()

    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  test('navbar toggle is keyboard operable on mobile', async ({ page }) => {
    await page.goto('/')

    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)

    const navToggle = page.getByRole('button', { name: 'Toggle navigation' })
    await navToggle.focus()
    await page.keyboard.press('Enter')

    await expect(page.locator('#navbarNav')).toHaveClass(/show/)
  })
})
