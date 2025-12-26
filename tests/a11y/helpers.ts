import type { Page } from '@playwright/test'

const STORAGE_SHIFT = 11
const STORAGE_SIGNATURE_TEXT = 'penny-plummet-2024'

export const acceptConsentIfPresent = async (page: Page) => {
  const acceptButton = page.getByRole('button', { name: 'Accept' })
  if (await acceptButton.first().isVisible().catch(() => false)) {
    await acceptButton.first().click()
  }
}

export const setUsernameIfPrompted = async (page: Page) => {
  const usernameInput = page.getByLabel('Please enter your username:')
  if (await usernameInput.first().isVisible().catch(() => false)) {
    await usernameInput.fill('A11yTester')
    await page.getByRole('button', { name: 'Start Playing' }).click()
  }
}

export const seedPiniaStore = async (
  page: Page,
  storeKey: string,
  state: Record<string, unknown>
) => {
  await page.addInitScript(
    ({ key, storeState, shift, signatureText }) => {
      const shiftString = (value: string, amount: number): string =>
        value.split('').map((char) => String.fromCharCode(char.charCodeAt(0) + amount)).join('')

      const signature = btoa(signatureText)
      const shiftedKey = shiftString(key, shift)
      const encodedKey = btoa(shiftedKey)
      const storageKey = encodedKey.split('').reverse().join('') + signature

      const saveData = {
        state: storeState,
        timestamp: Date.now(),
        version: 'test'
      }
      const stateStr = JSON.stringify(saveData)
      const shiftedState = shiftString(stateStr, shift)
      const encodedState = btoa(shiftedState)
      const storedValue = encodedState.split('').reverse().join('') + signature

      localStorage.setItem(storageKey, storedValue)
    },
    {
      key: storeKey,
      storeState: state,
      shift: STORAGE_SHIFT,
      signatureText: STORAGE_SIGNATURE_TEXT
    }
  )
}
