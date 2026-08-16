import { describe, expect, it } from 'vitest'
import { chipDenominationsFor, chipsForAmount, chipStyle } from '@/utils/chipUtil'

describe('chipDenominationsFor', () => {
  it('offers nothing below a single chip', () => {
    expect(chipDenominationsFor(0)).toEqual([])
    expect(chipDenominationsFor(0.5)).toEqual([])
    expect(chipDenominationsFor(-10)).toEqual([])
    expect(chipDenominationsFor(NaN)).toEqual([])
  })

  it('offers only the denominations the balance can afford, ascending', () => {
    expect(chipDenominationsFor(1)).toEqual([1])
    expect(chipDenominationsFor(30)).toEqual([1, 5, 25])
    expect(chipDenominationsFor(50)).toEqual([1, 5, 25])
    expect(chipDenominationsFor(100)).toEqual([1, 5, 25, 100])
    expect(chipDenominationsFor(999)).toEqual([1, 5, 25, 100, 500])
  })

  it('slides the five-chip window up the ladder as the balance grows', () => {
    expect(chipDenominationsFor(1_000)).toEqual([5, 25, 100, 500, 1_000])
    expect(chipDenominationsFor(5_000)).toEqual([25, 100, 500, 1_000, 5_000])
    expect(chipDenominationsFor(47_900_000)).toEqual([100_000, 500_000, 1_000_000, 5_000_000, 25_000_000])
    expect(chipDenominationsFor(2_000_000_000)).toEqual([5_000_000, 25_000_000, 100_000_000, 500_000_000, 1_000_000_000])
  })
})

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

  it('keeps splitting with the larger denominations above 500', () => {
    expect(chipsForAmount(2_500)).toEqual([1_000, 1_000, 500])
    expect(chipsForAmount(10_000)).toEqual([5_000, 5_000])
    expect(chipsForAmount(1_600_000)).toEqual([1_000_000, 500_000, 100_000])
  })

  it('caps the stack at 5 visible chips', () => {
    expect(chipsForAmount(24)).toEqual([5, 5, 5, 5, 1])
    expect(chipsForAmount(47_900_000)).toEqual([25_000_000, 5_000_000, 5_000_000, 5_000_000, 5_000_000])
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

  it('reuses the same five faces every thousand up the ladder', () => {
    expect(chipStyle(1_000)).toEqual(chipStyle(1))
    expect(chipStyle(5_000)).toEqual(chipStyle(5))
    expect(chipStyle(25_000_000)).toEqual(chipStyle(25))
    expect(chipStyle(500_000_000)).toEqual(chipStyle(500))
  })

  it('falls back to a neutral colour for amounts that are not a denomination', () => {
    expect(chipStyle(7)).toEqual({ background: '#444', dark: false })
    expect(chipStyle(30)).toEqual({ background: '#444', dark: false })
    expect(chipStyle(2_000)).toEqual({ background: '#444', dark: false })
    expect(chipStyle(0)).toEqual({ background: '#444', dark: false })
  })
})
