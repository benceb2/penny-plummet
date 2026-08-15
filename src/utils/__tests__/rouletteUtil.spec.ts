import { describe, expect, it } from 'vitest'
import { pocketColor, RED_NUMBERS } from '@/utils/rouletteUtil'

describe('pocketColor', () => {
  it('returns green for zero', () => {
    expect(pocketColor(0)).toBe('green')
  })

  it('returns red for a red number', () => {
    expect(pocketColor(1)).toBe('red')
    expect(pocketColor(36)).toBe('red')
  })

  it('returns black for a black number', () => {
    expect(pocketColor(2)).toBe('black')
    expect(pocketColor(35)).toBe('black')
  })

  it('agrees with the red numbers set for every pocket 1-36', () => {
    for (let n = 1; n <= 36; n++) {
      expect(pocketColor(n)).toBe(RED_NUMBERS.has(n) ? 'red' : 'black')
    }
  })

  it('has 18 red numbers', () => {
    expect(RED_NUMBERS.size).toBe(18)
  })
})
