import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { acceptConsentIfPresent, setUsernameIfPrompted } from '../a11y/helpers'

type ViewportSpec = {
  name: string
  size: { width: number; height: number }
  isMobile?: boolean
  hasTouch?: boolean
}

type RouteSpec = {
  name: string
  path: string
  readyHeading: string
  allowVerticalScrollOnMobile?: boolean
}

const viewports: ViewportSpec[] = [
  {
    name: 'desktop-16-9',
    size: { width: 1920, height: 1080 }
  },
  {
    name: 'mobile-portrait',
    size: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true
  }
]

const routes: RouteSpec[] = [
  {
    name: 'home',
    path: '/',
    readyHeading: 'Welcome to Penny Plummet!',
    allowVerticalScrollOnMobile: true
  },
  { name: 'clicker', path: '/clicker', readyHeading: 'Earn Chips' },
  { name: 'blackjack', path: '/blackjack', readyHeading: 'Blackjack' },
  {
    name: 'roulette',
    path: '/roulette',
    readyHeading: 'Roulette',
    allowVerticalScrollOnMobile: true
  }
]

const assertNoPageScroll = async (pageLabel: string, page: Page) => {
  const metrics = await page.evaluate(() => {
    const element = document.scrollingElement ?? document.documentElement
    return {
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth
    }
  })

  const heightOverflow = metrics.scrollHeight - metrics.clientHeight
  const widthOverflow = metrics.scrollWidth - metrics.clientWidth

  expect(
    heightOverflow,
    `${pageLabel} has vertical overflow of ${heightOverflow}px`
  ).toBeLessThanOrEqual(1)
  expect(
    widthOverflow,
    `${pageLabel} has horizontal overflow of ${widthOverflow}px`
  ).toBeLessThanOrEqual(1)
}

for (const viewport of viewports) {
  test.describe(`viewport fit: ${viewport.name}`, () => {
    test.use({
      viewport: viewport.size,
      isMobile: viewport.isMobile,
      hasTouch: viewport.hasTouch
    })

    for (const route of routes) {
      test(`${route.name} fits without scroll`, async ({ page }) => {
        await page.goto(route.path)

        await acceptConsentIfPresent(page)
        await setUsernameIfPrompted(page)

        await page.getByRole('heading', { name: route.readyHeading, exact: true }).waitFor({ state: 'visible' })

        if (viewport.isMobile && route.allowVerticalScrollOnMobile) {
          const metrics = await page.evaluate(() => {
            const element = document.scrollingElement ?? document.documentElement
            return {
              scrollWidth: element.scrollWidth,
              clientWidth: element.clientWidth
            }
          })
          const widthOverflow = metrics.scrollWidth - metrics.clientWidth
          expect(
            widthOverflow,
            `${route.name} @ ${viewport.name} has horizontal overflow of ${widthOverflow}px`
          ).toBeLessThanOrEqual(1)
          return
        }

        await assertNoPageScroll(`${route.name} @ ${viewport.name}`, page)
      })
    }
  })
}
