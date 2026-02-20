import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { seedPiniaStore } from '../a11y/helpers'

type ViewportSpec = {
  name: string
  size: { width: number; height: number }
  isMobile?: boolean
  hasTouch?: boolean
}

type Locale = 'en-GB' | 'hu-HU'

type TestContext = {
  locale: Locale
  viewport: ViewportSpec
}

type RouteSpec = {
  name: string
  path: string
  readyHeading: Record<Locale, string>
  setup?: (page: Page) => Promise<void>
  exercise?: (page: Page, context: TestContext) => Promise<void>
  allowVerticalScrollOnDesktop?: boolean
  allowVerticalScrollOnMobile?: boolean
}

type SeededTransaction = {
  id: string
  timestamp: number
  amount: number
  type: 'win' | 'loss' | 'push' | 'income' | 'purchase'
  game: 'blackjack' | 'roulette' | 'clicker' | 'general'
  detailsKey?: string
  detailsParams?: Record<string, string | number>
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

const locales: Locale[] = ['en-GB', 'hu-HU']

const setLocale = async (page: Page, locale: Locale) => {
  await page.addInitScript((nextLocale) => {
    localStorage.setItem('userLocale', nextLocale)
  }, locale)
}

const seedUser = async (page: Page) => {
  await seedPiniaStore(page, 'user-store', {
    consented: true,
    chips: 50000,
    username: 'ViewportTester',
    stats: {
      handsPlayed: 12,
      totalWinnings: 840,
      biggestWin: 260,
      maxTotalWinnings: 1200
    }
  })
}

const setTransactionsInIndexedDb = async (
  page: Page,
  transactions: SeededTransaction[]
) => {
  await page.evaluate(async (nextTransactions) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('penny-plummet', 2)

      request.onupgradeneeded = () => {
        const database = request.result
        const store = database.createObjectStore('transactions', { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp')
        store.createIndex('game_timestamp', ['game', 'timestamp'])
        store.createIndex('type_timestamp', ['type', 'timestamp'])
        store.createIndex('game_type_timestamp', ['game', 'type', 'timestamp'])
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('transactions', 'readwrite')
      const store = transaction.objectStore('transactions')

      store.clear()
      for (const item of nextTransactions) {
        store.put(item)
      }

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    })

    db.close()
  }, transactions)
}

const buildSeedTransactions = (): SeededTransaction[] => {
  const now = Date.now()
  const seeded: SeededTransaction[] = [
    {
      id: 'tx-opening-balance',
      timestamp: now - 50_000,
      amount: 50,
      type: 'income',
      game: 'general',
      detailsKey: 'transactions.details.general.openingBalance',
      detailsParams: { amount: '$50' }
    }
  ]

  const gameCycle: SeededTransaction['game'][] = ['blackjack', 'roulette', 'clicker', 'general']
  const typeCycle: SeededTransaction['type'][] = ['win', 'loss', 'push', 'income', 'purchase']

  for (let i = 0; i < 24; i++) {
    const game = gameCycle[i % gameCycle.length]
    const type = typeCycle[i % typeCycle.length]
    const amountMap: Record<SeededTransaction['type'], number> = {
      win: 120 + i,
      loss: -(70 + i),
      push: 0,
      income: 45 + i,
      purchase: -(20 + i)
    }

    seeded.push({
      id: `tx-seeded-${i + 1}`,
      timestamp: now - (i * 1_000),
      amount: amountMap[type],
      type,
      game,
      detailsKey: 'transactions.details.general.openingBalance',
      detailsParams: { amount: `$${Math.abs(amountMap[type])}` }
    })
  }

  return seeded
}

const routes: RouteSpec[] = [
  {
    name: 'home',
    path: '/',
    readyHeading: {
      'en-GB': 'Welcome to Penny Plummet!',
      'hu-HU': 'Üdvözöljük a Penny Plummet-ben!'
    }
  },
  {
    name: 'clicker',
    path: '/clicker',
    readyHeading: {
      'en-GB': 'Earn Chips',
      'hu-HU': 'Zseton Gyűjtés'
    },
    exercise: async (page, context) => {
      const clickButton = page.locator('.main-click-btn').first()
      await clickButton.click({ clickCount: 20 })

      if (context.viewport.isMobile) {
        await page.locator('[aria-label="Clicker panels"] button').nth(1).click()
      }
    }
  },
  {
    name: 'blackjack',
    path: '/blackjack',
    readyHeading: {
      'en-GB': 'Blackjack',
      'hu-HU': 'Blackjack'
    },
    exercise: async (page) => {
      await page.locator('#blackjackRulesHeading button').click()
      await page.locator('#blackjackRulesHeading button').click()
    }
  },
  {
    name: 'roulette',
    path: '/roulette',
    readyHeading: {
      'en-GB': 'Roulette',
      'hu-HU': 'Rulett'
    },
    exercise: async (page) => {
      await page.locator('.roulette-card .roulette-btn:visible').first().click()
      await page.locator('.roulette-number-btn:visible').first().click()
    },
    allowVerticalScrollOnMobile: true
  },
  {
    name: 'about',
    path: '/about',
    readyHeading: {
      'en-GB': 'About',
      'hu-HU': 'Rólunk'
    },
    allowVerticalScrollOnDesktop: true,
    allowVerticalScrollOnMobile: true
  },
  {
    name: 'profile',
    path: '/profile',
    readyHeading: {
      'en-GB': 'Profile',
      'hu-HU': 'Profil'
    },
    allowVerticalScrollOnDesktop: true,
    allowVerticalScrollOnMobile: true
  },
  {
    name: 'achievements',
    path: '/achievements',
    readyHeading: {
      'en-GB': 'Achievements',
      'hu-HU': 'Eredmények'
    },
    exercise: async (page) => {
      const categoryButtons = page.locator('.btn-group[role="group"] .btn')
      const count = await categoryButtons.count()
      if (count > 0) {
        await categoryButtons.nth(0).click()
      }
      if (count > 2) {
        await categoryButtons.nth(2).click()
      }
      if (count > 4) {
        await categoryButtons.nth(4).click()
      }
    },
    allowVerticalScrollOnDesktop: true,
    allowVerticalScrollOnMobile: true
  },
  {
    name: 'settings',
    path: '/settings',
    readyHeading: {
      'en-GB': 'Settings',
      'hu-HU': 'Beállítások'
    },
    exercise: async (page) => {
      await page.locator('button:has(.bi-trash)').first().click()
      await page.locator('[aria-labelledby="delete-save-title"] .btn-secondary').click()
    },
    allowVerticalScrollOnDesktop: true,
    allowVerticalScrollOnMobile: true
  },
  {
    name: 'transactions',
    path: '/transactions',
    readyHeading: {
      'en-GB': 'Transaction History',
      'hu-HU': 'Tranzakció Előzmények'
    },
    setup: async (page) => {
      await setTransactionsInIndexedDb(page, buildSeedTransactions())
      await page.reload()
    },
    exercise: async (page) => {
      const gameFilters = page.locator('.row .btn-group').nth(0).locator('.btn')
      const typeFilters = page.locator('.row .btn-group').nth(1).locator('.btn')
      await gameFilters.nth(2).click()
      await typeFilters.nth(1).click()

      const nextPage = page.getByLabel('Next page')
      if (await nextPage.isVisible()) {
        await nextPage.click()
      }
    },
    allowVerticalScrollOnDesktop: true,
    allowVerticalScrollOnMobile: true
  }
]

const getScrollMetrics = async (page: Page) => {
  return page.evaluate(() => {
    const element = document.scrollingElement ?? document.documentElement
    return {
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth
    }
  })
}

const assertNoHorizontalScroll = async (pageLabel: string, page: Page) => {
  const metrics = await getScrollMetrics(page)
  const widthOverflow = metrics.scrollWidth - metrics.clientWidth

  expect(
    widthOverflow,
    `${pageLabel} has horizontal overflow of ${widthOverflow}px`
  ).toBeLessThanOrEqual(1)
}

const waitForRouteReady = async (page: Page, route: RouteSpec, locale: Locale) => {
  await page.getByRole('heading', { name: route.readyHeading[locale], level: 1, exact: true }).waitFor({ state: 'visible' })
}

const assertScrollWithinTolerance = async (
  page: Page,
  route: RouteSpec,
  viewport: ViewportSpec,
  locale: Locale
) => {
  const pageLabel = `${route.name} @ ${viewport.name} @ ${locale}`
  const allowVerticalScroll = viewport.isMobile
    ? route.allowVerticalScrollOnMobile
    : route.allowVerticalScrollOnDesktop

  if (allowVerticalScroll) {
    await assertNoHorizontalScroll(pageLabel, page)
    return
  }

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

for (const locale of locales) {
  for (const viewport of viewports) {
    test.describe(`viewport fit: ${locale} @ ${viewport.name}`, () => {
      test.use({
        viewport: viewport.size,
        isMobile: viewport.isMobile,
        hasTouch: viewport.hasTouch
      })

      for (const route of routes) {
        test(`${route.name} stays within tolerance`, async ({ page }) => {
          await setLocale(page, locale)
          await seedUser(page)

          await page.goto(route.path)
          await waitForRouteReady(page, route, locale)

          if (route.setup) {
            await route.setup(page)
            await waitForRouteReady(page, route, locale)
          }

          await assertScrollWithinTolerance(page, route, viewport, locale)

          if (route.exercise) {
            await route.exercise(page, { locale, viewport })
            await assertScrollWithinTolerance(page, route, viewport, locale)
          }
        })
      }
    })
  }
}
