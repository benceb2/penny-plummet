import { defineConfig, devices } from '@playwright/test'

/** Every screen, shot on each device below. */
const ROUTE_TESTS = '**/tests/screenshots/routes.spec.ts'
/** Route shots plus the mid-game, modal and locale states, primary phone only. */
const ALL_SCREENSHOT_TESTS = '**/tests/screenshots/*.spec.ts'

/**
 * Reduced motion short-circuits the HUD's animated balance, which would
 * otherwise still be easing towards its target when the shot is taken. It is a
 * browser context option rather than a test option, so it only takes effect
 * under `contextOptions`.
 */
const reducedMotion = { reducedMotion: 'reduce' as const }

/**
 * Screenshot projects run Chromium at phone viewports rather than the WebKit
 * device descriptors: one engine keeps a single set of baselines, and the
 * baselines are only comparable when every run renders on the same stack.
 */
const phone = {
  ...devices['Desktop Chrome'],
  isMobile: true,
  hasTouch: true,
  contextOptions: reducedMotion
}

export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      maxDiffPixelRatio: 0.01,
    },
  },
  snapshotPathTemplate: 'tests/screenshots/__screenshots__/{projectName}/{arg}{ext}',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run build-only && npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: '**/tests/screenshots/**',
    },
    {
      name: 'iphone-14',
      use: { ...phone, viewport: { width: 390, height: 844 } },
      testMatch: ALL_SCREENSHOT_TESTS,
      timeout: 60_000,
    },
    {
      name: 'iphone-se',
      use: { ...phone, viewport: { width: 375, height: 667 } },
      testMatch: ROUTE_TESTS,
      timeout: 60_000,
    },
    {
      name: 'pixel-7',
      use: { ...phone, viewport: { width: 412, height: 915 } },
      testMatch: ROUTE_TESTS,
      timeout: 60_000,
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        contextOptions: reducedMotion,
      },
      testMatch: ROUTE_TESTS,
      timeout: 60_000,
    },
  ],
})
