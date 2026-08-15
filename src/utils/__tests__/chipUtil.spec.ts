import { describe, expect, it } from 'vitest'
import { chipsForAmount, chipStyle } from '@/utils/chipUtil'

describe('chipsForAmount', () => {
  it('returns an empty stack for zero or negative amounts', () => {
    expect(chipsForAmount(0)).toEqual([])
    expect(chipsForAmount(-10)).toEqual([])
  })

  it('greedily splits an amount into the largest denominations first', () => {
    expect(chipsForAmount(1)).toEqual([1])
    expect(chipsForAmount(4)).toEqual([1, 1, 1, 1])
    expect(chipsForAmount(50)).toEqual([25, 25])
    expect(chipsForAmount(131)).toEqual([100, 25, 5, 1])
  })

  it('caps the stack at 5 visible chips for large amounts', () => {
    const chips = chipsForAmount(10_000)
    expect(chips).toHaveLength(5)
    expect(chips).toEqual([500, 500, 500, 500, 500])
  })

  it('floors fractional amounts', () => {
    expect(chipsForAmount(5.9)).toEqual([5])
  })
})

describe('chipStyle', () => {
  it('returns the token colour for known denominations', () => {
    expect(chipStyle(1)).toEqual({ background: '#EDE7D6', dark: true })
    expect(chipStyle(25)).toEqual({ background: '#1E6946', dark: false })
  })

  it('falls back to a neutral colour for unknown denominations', () => {
    expect(chipStyle(7)).toEqual({ background: '#444', dark: false })
  })
})
