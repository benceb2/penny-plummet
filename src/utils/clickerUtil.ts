export interface ClickAnimationPosition {
  x: number
  y: number
}

export interface OfflineEarningsResult {
  earnings: number
  seconds: number
}

export interface UpgradeCosts {
  autoClicker: number
  multiplier: number
  critical: number
  autoClickerSpeed: number
}

// Constants
export const CRITICAL_CHANCE_BASE = 0.1 // 10% base chance
export const CRITICAL_CHANCE_PER_LEVEL = 0.02 // 2% per level
export const CRITICAL_CHANCE_MAX = 0.5 // 50% max
export const CRITICAL_MULTIPLIER = 2

export const COMBO_WINDOW_MS = 1000 // 1 second between clicks
export const COMBO_MULTIPLIER_PER_LEVEL = 0.1 // 10% per combo level
export const COMBO_MULTIPLIER_MAX = 3 // 3x max combo

export const AUTO_CLICKER_SPEED_BASE = 1000 // 1000ms base interval
export const AUTO_CLICKER_SPEED_REDUCTION = 50 // 50ms reduction per level
export const AUTO_CLICKER_SPEED_MIN = 100 // 100ms minimum interval

export const OFFLINE_RATE_MULTIPLIER = 0.5 // Half rate when offline
export const MAX_OFFLINE_DAYS = 3
export const MAX_OFFLINE_MS = MAX_OFFLINE_DAYS * 24 * 60 * 60 * 1000

// Combo calculations
export function calculateComboMultiplier(comboCount: number): number {
  return Math.min(1 + (comboCount * COMBO_MULTIPLIER_PER_LEVEL), COMBO_MULTIPLIER_MAX)
}

export function shouldResetCombo(lastClickTime: number, currentTime: number): boolean {
  return currentTime - lastClickTime >= COMBO_WINDOW_MS
}

// Critical hit calculations
export function calculateCriticalChance(criticalLevel: number): number {
  return Math.min(
    CRITICAL_CHANCE_BASE + (criticalLevel * CRITICAL_CHANCE_PER_LEVEL),
    CRITICAL_CHANCE_MAX
  )
}

export function rollCriticalHit(criticalChance: number): boolean {
  return Math.random() < criticalChance
}

export function applyCriticalMultiplier(value: number): number {
  return value * CRITICAL_MULTIPLIER
}

// Auto-clicker calculations
export function calculateAutoClickerSpeed(speedLevel: number): number {
  return Math.max(
    AUTO_CLICKER_SPEED_BASE - (speedLevel * AUTO_CLICKER_SPEED_REDUCTION),
    AUTO_CLICKER_SPEED_MIN
  )
}

export function calculatePassiveIncome(
  autoClickersCount: number,
  clickValue: number,
  autoClickerSpeed: number
): number {
  if (autoClickersCount === 0) return 0
  return Math.floor(autoClickersCount * clickValue * (1000 / autoClickerSpeed))
}

// Cost calculations
export function calculateAutoClickerCost(currentCount: number, baseCost: number = 50): number {
  return Math.floor(baseCost * Math.pow(1.5, currentCount))
}

export function calculateMultiplierCost(currentLevel: number, baseCost: number = 100): number {
  return Math.floor(baseCost * Math.pow(2, currentLevel - 1))
}

export function calculateCriticalCost(currentLevel: number, baseCost: number = 200): number {
  return Math.floor(baseCost * Math.pow(2.5, currentLevel))
}

export function calculateAutoClickerSpeedCost(currentLevel: number, baseCost: number = 300): number {
  return Math.floor(baseCost * Math.pow(1.8, currentLevel - 1))
}

// Animation utilities
export function generateClickAnimationPosition(): ClickAnimationPosition {
  const angle = Math.random() * Math.PI * 2 // Random angle in radians
  const distance = 80 + Math.random() * 120 // Random distance 80-200px from center
  const x = Math.cos(angle) * distance
  const y = Math.sin(angle) * distance

  // Add some extra randomness for variety
  const jitterX = (Math.random() - 0.5) * 60 // Additional ±30px jitter
  const jitterY = (Math.random() - 0.5) * 60

  return {
    x: x + jitterX,
    y: y + jitterY
  }
}

export function shouldShowAutoClickAnimation(): boolean {
  return Math.random() < 0.1 // 10% chance to show auto-click animation
}

// Offline earnings calculations
export function calculateOfflineEarnings(
  lastOnlineTimestamp: number,
  autoClickersCount: number,
  clickValue: number,
  autoClickerSpeed: number
): OfflineEarningsResult {
  const currentTime = Date.now()
  const offlineTime = currentTime - lastOnlineTimestamp
  const cappedOfflineTime = Math.min(offlineTime, MAX_OFFLINE_MS)

  if (cappedOfflineTime <= 0 || autoClickersCount === 0) {
    return { earnings: 0, seconds: 0 }
  }

  const seconds = Math.floor(cappedOfflineTime / 1000)
  const clicksPerSecond = autoClickersCount * clickValue * (1000 / autoClickerSpeed)
  const earnings = Math.floor(seconds * clicksPerSecond * OFFLINE_RATE_MULTIPLIER)

  return { earnings, seconds }
}

// Auto-clicker loop calculations
export function calculateAutoClickerUpdate(
  deltaTime: number,
  autoClickersCount: number,
  clickValue: number,
  autoClickerSpeed: number
): number {
  if (autoClickersCount === 0) return 0

  const clicksPerSecond = autoClickersCount * clickValue * (1000 / autoClickerSpeed)
  return Math.floor((deltaTime / 1000) * clicksPerSecond)
}

export function getAutoClickerUpdateInterval(autoClickerSpeed: number): number {
  return Math.max(autoClickerSpeed / 10, 50) // Update 10x faster than click speed, min 50ms
}
