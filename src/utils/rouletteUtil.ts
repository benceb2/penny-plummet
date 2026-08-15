/**
 * Roulette pocket colour helpers shared by RouletteTable, RouletteSpinner and
 * the winning-number history strip, so the red/black/green classification
 * only lives in one place.
 */

export const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
])

export type PocketColor = 'red' | 'black' | 'green'

/** Classic European single-zero pocket colour for a table or winning number. */
export function pocketColor(value: number): PocketColor {
  if (value === 0) return 'green'
  return RED_NUMBERS.has(value) ? 'red' : 'black'
}
