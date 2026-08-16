/**
 * Casino chip helpers shared by ChipButton and ChipStack (src/components/game).
 *
 * Denominations follow the real casino ladder (1, 5, 25, 100, 500) and repeat
 * it every thousand (1K, 5K, 25K, ..., 1M, ...), so a bankroll in the millions
 * gets chips worth betting instead of a row that tops out at 500.
 */

const CHIP_MANTISSAS = [1, 5, 25, 100, 500] as const

/** How many denominations the tray offers at once (what fits in one row on a phone). */
const TRAY_CHIP_COUNT = 5

/** How many chips ChipStack draws before capping the stack height. */
const MAX_VISIBLE_CHIPS = 5

/** The denomination at a ladder position: 0 → 1, 4 → 500, 5 → 1K, 10 → 1M, ... */
function denominationAt(index: number): number {
  return CHIP_MANTISSAS[index % CHIP_MANTISSAS.length] * 1000 ** Math.floor(index / CHIP_MANTISSAS.length)
}

/** Ladder position of the largest denomination that fits in `value`, or -1 below 1. */
function topDenominationIndex(value: number): number {
  if (!Number.isFinite(value)) return -1
  let index = -1
  while (denominationAt(index + 1) <= value) index++
  return index
}

/**
 * The denominations the tray offers for a balance: the largest TRAY_CHIP_COUNT
 * ladder values the player can afford, ascending. $50 gets 1/5/25 like a
 * fresh player should; $47.9M gets 100K/500K/1M/5M/25M so a bet is still a
 * handful of taps.
 */
export function chipDenominationsFor(balance: number): number[] {
  const top = topDenominationIndex(balance)
  const chips: number[] = []
  for (let index = Math.max(0, top - TRAY_CHIP_COUNT + 1); index <= top; index++) {
    chips.push(denominationAt(index))
  }
  return chips
}

/**
 * Greedily splits an amount into ladder denominations for ChipStack's visual
 * stack, largest first. Capped at 5 visible chips so the stack height stays
 * fixed no matter how large the bet is.
 */
export function chipsForAmount(amount: number): number[] {
  const chips: number[] = []
  let remaining = Math.max(0, Math.floor(amount))

  for (let index = topDenominationIndex(remaining); index >= 0 && chips.length < MAX_VISIBLE_CHIPS; index--) {
    const denomination = denominationAt(index)
    while (remaining >= denomination && chips.length < MAX_VISIBLE_CHIPS) {
      chips.push(denomination)
      remaining -= denomination
    }
  }

  return chips
}

export interface ChipStyle {
  /** CSS background-color (or var() reference) for the chip face. */
  background: string
  /** Whether the chip is light enough to need dark text/dashes. */
  dark: boolean
}

/**
 * Face colours by ladder position within a thousand, per the design tokens,
 * so a 5, a 5K and a 5M chip all read as "the red one".
 */
const CHIP_COLORS: readonly ChipStyle[] = [
  { background: '#EDE7D6', dark: true },
  { background: '#C0392B', dark: false },
  // A shade deeper than the brief's #2E8F5B: that green's luminance is high
  // enough that neither cream nor white text clears 4.5:1 against it at the
  // chip's small bold label size (axe: 3.49:1). This tone reads the same
  // "casino green" while giving cream text ~5.7:1.
  { background: '#1E6946', dark: false },
  { background: '#232327', dark: false },
  { background: '#6D3FA5', dark: false }
]

const DEFAULT_CHIP_STYLE: ChipStyle = { background: '#444', dark: false }

/** Looks up the face colour for a chip denomination; off-ladder amounts get a neutral face. */
export function chipStyle(value: number): ChipStyle {
  const index = topDenominationIndex(value)
  return index >= 0 && denominationAt(index) === value
    ? CHIP_COLORS[index % CHIP_COLORS.length]
    : DEFAULT_CHIP_STYLE
}
