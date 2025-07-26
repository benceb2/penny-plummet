/**
 * Formats large numbers with appropriate suffixes (K, M, B, T)
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted string
 */
export interface FormatOptions {
  /** Number of decimal places to show (default: 1) */
  decimals?: number
  /** Whether to include currency symbol (default: false) */
  currency?: boolean
  /** Currency symbol to use (default: '$') */
  currencySymbol?: string
  /** Whether to force showing decimals even for whole numbers (default: false) */
  forceDecimals?: boolean
  /** Minimum value to start abbreviating (default: 1000) */
  minAbbreviation?: number
}

export function formatNumber(value: number, options: FormatOptions = {}): string {
  const {
    decimals = 1,
    currency = false,
    currencySymbol = '$',
    forceDecimals = false,
    minAbbreviation = 1000
  } = options

  // Handle edge cases
  if (value === 0) return currency ? `${currencySymbol}0` : '0'
  if (!isFinite(value)) return currency ? `${currencySymbol}0` : '0'

  const absValue = Math.abs(value)
  const isNegative = value < 0

  // Don't abbreviate small numbers
  if (absValue < minAbbreviation) {
    const formatted = absValue.toLocaleString('en-US', {
      minimumFractionDigits: forceDecimals ? decimals : 0,
      maximumFractionDigits: decimals
    })
    return `${isNegative ? '-' : ''}${currency ? currencySymbol : ''}${formatted}`
  }

  // Define the suffixes and their values
  const suffixes = [
    { value: 1e12, suffix: 'T' }, // Trillion
    { value: 1e9, suffix: 'B' },  // Billion
    { value: 1e6, suffix: 'M' },  // Million
    { value: 1e3, suffix: 'K' },  // Thousand
  ]

  // Find the appropriate suffix
  for (const { value: threshold, suffix } of suffixes) {
    if (absValue >= threshold) {
      const scaledValue = absValue / threshold

      // Format the number
      let formatted: string
      if (scaledValue >= 100 || (scaledValue === Math.floor(scaledValue) && !forceDecimals)) {
        // Show whole numbers for values >= 100 or exact integers
        formatted = Math.floor(scaledValue).toString()
      } else {
        // Show decimal for smaller values
        formatted = scaledValue.toFixed(decimals)
      }

      return `${isNegative ? '-' : ''}${currency ? currencySymbol : ''}${formatted}${suffix}`
    }
  }

  // Fallback (shouldn't reach here given minAbbreviation logic)
  return `${isNegative ? '-' : ''}${currency ? currencySymbol : ''}${absValue}`
}

// =============================================================================
// MAIN EXPORTED FUNCTIONS
// =============================================================================

/**
 * E.g. $4,235,256 -> $4.2M
 */
export const formatIntAsCurrency = (value: number): string => {
  return formatNumber(value, { currency: true })
}

/**
 * Format XP values with abbreviations
 * 1,500,000 -> 1.5M
 */
export const formatXP = (value: number): string => {
  return formatNumber(value, {
    currency: false,
    decimals: 1
  })
}

/**
 * Format score values (similar to XP)
 * 25,000 -> 25K
 */
export const formatScore = (value: number): string => {
  return formatNumber(value, {
    currency: false,
    decimals: 1
  })
}

// =============================================================================
// SPECIALIZED VARIANTS
// =============================================================================

/**
 * If you need the old full format anywhere
 * $4,235,256 -> $4,235,256
 */
export const formatIntAsCurrencyFull = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(value)
}

/**
 * Ultra-compact currency (no decimals)
 * $4,235,256 -> $4M
 */
export const formatCurrencyUltraCompact = (value: number): string => {
  return formatNumber(value, {
    currency: true,
    decimals: 0
  })
}

/**
 * Format for chip displays (with precision)
 * $4,235,256 -> $4.2M
 */
export const formatChips = (value: number): string => {
  return formatNumber(value, {
    currency: true,
    decimals: 1
  })
}

/**
 * Flexible currency formatter with options
 */
export const formatCurrencyDetailed = (value: number, options?: {
  showFullAmount?: boolean
  decimals?: number
}): string => {
  if (options?.showFullAmount) {
    return formatNumber(value, {
      currency: true,
      minAbbreviation: Infinity
    })
  }

  return formatNumber(value, {
    currency: true,
    decimals: options?.decimals || 1
  })
}
