/**
 * Casino chip helpers shared by ChipButton and ChipStack (src/components/game).
 */

export const CHIP_DENOMINATIONS = [500, 100, 25, 5, 1] as const

const MAX_VISIBLE_CHIPS = 5

/**
 * Greedily splits an amount into chip denominations (500/100/25/5/1) for
 * ChipStack's visual stack, largest first. Capped at 5 visible chips so the
 * stack height stays fixed no matter how large the bet is.
 */
export function chipsForAmount(amount: number): number[] {
  const chips: number[] = []
  let remaining = Math.max(0, Math.floor(amount))

  for (const denomination of CHIP_DENOMINATIONS) {
    while (remaining >= denomination && chips.length < MAX_VISIBLE_CHIPS) {
      chips.push(denomination)
      remaining -= denomination
    }
    if (chips.length >= MAX_VISIBLE_CHIPS) break
  }

  return chips
}

export interface ChipStyle {
  /** CSS background-color (or var() reference) for the chip face. */
  background: string
  /** Whether the chip is light enough to need dark text/dashes. */
  dark: boolean
}

const CHIP_COLORS: Record<number, ChipStyle> = {
  1: { background: '#EDE7D6', dark: true },
  5: { background: '#C0392B', dark: false },
  // A shade deeper than the brief's #2E8F5B: that green's luminance is high
  // enough that neither cream nor white text clears 4.5:1 against it at the
  // chip's small bold label size (axe: 3.49:1). This tone reads the same
  // "casino green" while giving cream text ~5.7:1.
  25: { background: '#1E6946', dark: false },
  100: { background: '#232327', dark: false },
  500: { background: '#6D3FA5', dark: false },
  1000: { background: 'var(--pp-gold)', dark: true }
}

const DEFAULT_CHIP_STYLE: ChipStyle = { background: '#444', dark: false }

/** Looks up the face colour for a chip denomination, per the design tokens. */
export function chipStyle(value: number): ChipStyle {
  return CHIP_COLORS[value] ?? DEFAULT_CHIP_STYLE
}
