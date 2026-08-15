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

test('rules sheet has no detectable axe violations when open', async ({ page }) => {
  await page.goto('/blackjack')

  await acceptConsentIfPresent(page)
  await setUsernameIfPrompted(page)

  await page.getByRole('heading', { name: 'Blackjack' }).waitFor({ state: 'visible' })
  await page.getByRole('button', { name: 'Rules and payouts' }).click()
  await page.getByRole('heading', { name: 'Rules & payouts' }).waitFor({ state: 'visible' })

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('placing a bet with chips and dealing has no detectable axe violations in the player turn', async ({ page }) => {
  await page.goto('/blackjack')

  await acceptConsentIfPresent(page)
  await setUsernameIfPrompted(page)

  await page.getByRole('heading', { name: 'Blackjack' }).waitFor({ state: 'visible' })

  await page.getByRole('button', { name: 'Bet 25' }).click()
  await page.getByRole('button', { name: 'Bet 25' }).click()
  await page.getByRole('button', { name: /^Deal ·/ }).click()

  await page.getByRole('button', { name: 'Hit' }).waitFor({ state: 'visible' })
  // The Deal tap can leave the pointer resting over the Hit/Stand row once
  // the tray relayouts, freezing a :hover transition mid-flight; move it
  // away so axe reads the settled resting styles.
  await page.mouse.move(0, 0)

  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test.describe('deal animation on mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })

  test('dealing a hand does not widen the page past the viewport', async ({ page }) => {
    await page.goto('/blackjack')

    await acceptConsentIfPresent(page)
    await setUsernameIfPrompted(page)

    await page.getByRole('heading', { name: 'Blackjack' }).waitFor({ state: 'visible' })

    await page.getByRole('button', { name: 'Bet 25' }).click()
    await page.getByRole('button', { name: 'Bet 25' }).click()

    // Regression guard: cards deal in from well outside their final position
    // (see PlayingCard's deal keyframes), which used to widen
    // document.documentElement.scrollWidth past clientWidth mid-animation
    // and make mobile Chrome zoom the layout viewport out for good.
    const assertNoHorizontalOverflow = async () => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      )
      expect(overflow).toBeLessThanOrEqual(1)
    }

    await page.getByRole('button', { name: /^Deal ·/ }).click()
    await assertNoHorizontalOverflow()

    await page.waitForTimeout(250)
    await assertNoHorizontalOverflow()

    await page.waitForTimeout(650)
    await assertNoHorizontalOverflow()
  })
})
