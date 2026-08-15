import { expect, type Page } from '@playwright/test'
import { seedPiniaStore } from '../a11y/helpers'

/**
 * Screenshot runs are pinned to a fixed instant. The transaction list renders
 * relative timestamps, and the clicker grants offline earnings based on the gap
 * since `lastOnlineTimestamp` — both drift against a live clock and would make
 * every baseline stale within minutes.
 */
export const FIXED_NOW = new Date('2026-01-15T12:00:00.000Z')

/**
 * Comparison budget per shot. `toHaveScreenshot` re-captures until two frames
 * match, and the global 5s expect timeout is tight for a full-page capture on a
 * loaded CI runner. It cannot be set once in the config: `toHaveScreenshot`
 * takes no `timeout` there, only per assertion.
 */
export const SHOT_TIMEOUT = 15_000

const FIXED_NOW_MS = FIXED_NOW.getTime()
const MINUTE_MS = 60_000

/**
 * Auto-clickers are deliberately left at zero: owning one starts a
 * requestAnimationFrame loop that increments the balance forever, so the HUD
 * would never settle long enough for a screenshot to compare equal.
 */
const clickerState = {
  clicks: 128,
  totalLifetimeClicks: 4820,
  manualLifetimeClicks: 4520,
  passiveLifetimeClicks: 300,
  totalCriticalHits: 96,
  maxComboCount: 14,
  maxCollectionAmount: 640,
  maxOfflineEarnings: 0,
  baseClickValue: 1,
  autoClickersCount: 0,
  autoClickerCost: 50,
  multiplierLevel: 3,
  multiplierCost: 240,
  criticalLevel: 2,
  criticalCost: 320,
  autoClickerSpeedLevel: 1,
  autoClickerSpeedCost: 300,
  lastOnlineTimestamp: FIXED_NOW_MS
}

const userState = {
  consented: true,
  chips: 5000,
  username: 'Penny',
  stats: {
    handsPlayed: 42,
    totalWinnings: 1850,
    biggestWin: 800,
    maxTotalWinnings: 2400
  }
}

const achievementState = {
  currentLevel: {
    level: 7,
    currentXP: 420,
    requiredXP: 900,
    rewards: { chips: 298, multiplier: 1.6 }
  }
}

const seedTransactionRecords = [
  {
    id: 'seed-1',
    timestamp: FIXED_NOW_MS - 6 * MINUTE_MS,
    amount: 400,
    type: 'win',
    game: 'blackjack',
    detailsKey: 'transactions.details.blackjack.win',
    detailsParams: { amount: 400, playerScore: 20, dealerScore: 18 }
  },
  {
    id: 'seed-2',
    timestamp: FIXED_NOW_MS - 24 * MINUTE_MS,
    amount: 150,
    type: 'loss',
    game: 'roulette',
    detailsKey: 'transactions.details.roulette.loss',
    detailsParams: { amount: 150, number: 17 }
  },
  {
    id: 'seed-3',
    timestamp: FIXED_NOW_MS - 90 * MINUTE_MS,
    amount: 640,
    type: 'income',
    game: 'clicker',
    detailsKey: 'transactions.details.clicker.collect',
    detailsParams: { amount: 640 }
  },
  {
    id: 'seed-4',
    timestamp: FIXED_NOW_MS - 5 * 60 * MINUTE_MS,
    amount: 200,
    type: 'push',
    game: 'blackjack',
    detailsKey: 'transactions.details.blackjack.push'
  }
]

/**
 * Replaces Math.random with a seeded PRNG so shuffles, roulette spins and
 * critical hits play out the same way on every run.
 */
const seedRandom = async (page: Page) => {
  await page.addInitScript(() => {
    let state = 0x9e3779b9
    Math.random = () => {
      state |= 0
      state = (state + 0x6d2b79f5) | 0
      let t = Math.imul(state ^ (state >>> 15), 1 | state)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  })
}

export type PrepareOptions = {
  /** BCP-47 tag the app stores under `userLocale`. Defaults to English. */
  locale?: 'en-GB' | 'hu-HU'
  /**
   * Which onboarding modal the app should land on. `returning` is past both
   * prompts, `new` gets the consent modal, `unnamed` gets the username modal.
   */
  player?: 'returning' | 'new' | 'unnamed'
}

/**
 * Puts the page into the deterministic state every screenshot test starts from:
 * frozen clock, seeded RNG, and stores populated past the consent and username
 * prompts. Must be called before the first navigation.
 */
export const preparePage = async (page: Page, options: PrepareOptions = {}) => {
  await page.clock.setFixedTime(FIXED_NOW)
  await seedRandom(page)

  const locale = options.locale ?? 'en-GB'
  await page.addInitScript((value) => {
    localStorage.setItem('userLocale', value)
  }, locale)

  const player = options.player ?? 'returning'
  if (player === 'returning') {
    await seedPiniaStore(page, 'user-store', userState)
  } else if (player === 'unnamed') {
    await seedPiniaStore(page, 'user-store', { ...userState, username: null })
  }

  await seedPiniaStore(page, 'clicker-store', clickerState)
  await seedPiniaStore(page, 'achievements-store', achievementState)
}

/**
 * Writes fixture rows into the IndexedDB store the app has already created.
 * Call after a first navigation so the schema comes from the app itself rather
 * than being duplicated here, then reload to pick the rows up.
 */
export const seedTransactions = async (page: Page) => {
  await page.evaluate(async (records) => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('penny-plummet')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('transactions', 'readwrite')
      const store = transaction.objectStore('transactions')
      records.forEach((record) => store.put(record))
      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })

    db.close()
  }, seedTransactionRecords)
}

/**
 * Navigates and waits until the page is worth photographing: the route's own
 * heading is mounted and webfonts have loaded, so text is never captured
 * mid-swap from the fallback face.
 */
export const gotoRoute = async (page: Page, path: string, heading: string) => {
  await page.goto(path)
  await page
    .getByRole('heading', { name: heading, exact: true, level: 1 })
    .waitFor({ state: 'visible' })
  await page.evaluate(() => document.fonts.ready)
}

/**
 * Waits out the achievement/level-up toasts that gameplay triggers. They cover
 * the top of the stage and dismiss themselves on a 5s timer the frozen clock
 * does not touch, so a shot taken without this wait captures them or not
 * depending on how fast the machine is.
 */
export const waitForToastsToClear = async (page: Page) => {
  await expect(page.locator('.toast')).toHaveCount(0, { timeout: 10_000 })
}
