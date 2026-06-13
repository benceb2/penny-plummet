import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { formatIntAsCurrency, formatNumber } from '@/utils/numberFormatUtil'
import { calculateStorageKey, createGameSerializer } from '@/utils/gameSaveSerializerUtil'
import { useAchievementStore } from './achievementStore'
import type { UserStore } from './userStore'
import { useTransactionStore } from './transactionStore'
import * as clickerUtil from '@/utils/clickerUtil'

interface ClickAnimation {
  id: number
  value: number
  isCritical: boolean
  x: number
  y: number
}

export const useClickerStore = defineStore('clicker', () => {
  const achievementStore = useAchievementStore()
  const transactionStore = useTransactionStore()
  const autoClickerRAF = ref<number | null>(null)

  // Core State
  const clicks = ref(0)
  const totalLifetimeClicks = ref(0)
  const manualLifetimeClicks = ref(0)
  const passiveLifetimeClicks = ref(0)
  const totalCriticalHits = ref(0)
  const maxComboCount = ref(0)
  const maxCollectionAmount = ref(0)
  const maxOfflineEarnings = ref(0)
  const baseClickValue = ref(1)
  const autoClickersCount = ref(0)
  const autoClickerCost = ref(50)
  const multiplierLevel = ref(1)
  const multiplierCost = ref(100)

  // Upgrade states
  const criticalLevel = ref(0)
  const criticalCost = ref(200)
  const autoClickerSpeedLevel = ref(1)
  const autoClickerSpeedCost = ref(300)

  // Click effects
  const clickAnimations = ref([] as Array<ClickAnimation>)
  const comboMultiplier = ref(1)
  const comboCount = ref(0)
  const lastClickTime = ref(0)
  const isClickerActive = ref(false)

  // Offline tracking
  const lastOnlineTimestamp = ref(Date.now())
  const showOfflineEarnings = ref(false)
  const offlineEarnings = ref(0)
  const offlineSeconds = ref(0)

  // Computed Properties
  const clickValue = computed(() => {
    const base = baseClickValue.value * multiplierLevel.value
    return Math.floor(base * comboMultiplier.value)
  })

  const criticalChance = computed(() =>
    clickerUtil.calculateCriticalChance(criticalLevel.value)
  )

  const autoClickerSpeed = computed(() =>
    clickerUtil.calculateAutoClickerSpeed(autoClickerSpeedLevel.value)
  )

  // Formatted values
  const formattedClickValue = computed(() => formatIntAsCurrency(clickValue.value))
  const formattedAutoClickerCost = computed(() => formatIntAsCurrency(autoClickerCost.value))
  const formattedMultiplierCost = computed(() => formatIntAsCurrency(multiplierCost.value))
  const formattedCriticalCost = computed(() => formatIntAsCurrency(criticalCost.value))
  const formattedAutoClickerSpeedCost = computed(() => formatIntAsCurrency(autoClickerSpeedCost.value))
  const formattedClicks = computed(() => formatIntAsCurrency(clicks.value))
  const formattedLifetimeClicks = computed(() => formatNumber(manualLifetimeClicks.value, {
    currency: false,
    decimals: 0
  }))
  const formattedManualLifetimeClicks = computed(() => formatNumber(manualLifetimeClicks.value, {
    currency: false,
    decimals: 1
  }))
  const formattedPassiveLifetimeClicks = computed(() => formatNumber(passiveLifetimeClicks.value, {
    currency: false,
    decimals: 1
  }))

  const formattedIncome = computed(() => {
    const passivePerSecond = clickerUtil.calculatePassiveIncome(
      autoClickersCount.value,
      clickValue.value,
      autoClickerSpeed.value
    )
    return formatIntAsCurrency(passivePerSecond)
  })

  // Actions
  function handleClick() {
    const now = Date.now()

    // Calculate combo
    if (clickerUtil.shouldResetCombo(lastClickTime.value, now)) {
      comboCount.value = 0
      comboMultiplier.value = 1
    } else {
      comboCount.value++
      comboMultiplier.value = clickerUtil.calculateComboMultiplier(comboCount.value)
    }

    const currentComboLength = comboCount.value + 1
    if (currentComboLength > maxComboCount.value) {
      maxComboCount.value = currentComboLength
      achievementStore.updateAchievementProgress('combo_chain', maxComboCount.value)
    }

    lastClickTime.value = now

    // Check for critical hit
    const isCritical = clickerUtil.rollCriticalHit(criticalChance.value)
    const finalValue = isCritical ?
      clickerUtil.applyCriticalMultiplier(clickValue.value) :
      clickValue.value

    clicks.value += finalValue
    totalLifetimeClicks.value += 1
    manualLifetimeClicks.value += 1

    // Add floating animation
    addClickAnimation(finalValue, isCritical)

    // Update achievements
    achievementStore.updateAchievementProgress('click_novice', manualLifetimeClicks.value)
    achievementStore.updateAchievementProgress('click_master', manualLifetimeClicks.value)
    achievementStore.updateAchievementProgress('click_legend', manualLifetimeClicks.value)

    if (isCritical) {
      totalCriticalHits.value++
      achievementStore.updateAchievementProgress('critical_striker', totalCriticalHits.value)
    }

    // Combo decay timer
    setTimeout(() => {
      if (clickerUtil.shouldResetCombo(lastClickTime.value, Date.now())) {
        comboCount.value = 0
        comboMultiplier.value = 1
      }
    }, clickerUtil.COMBO_WINDOW_MS)
  }

  function addClickAnimation(value: number, isCritical = false) {
    if (!isClickerActive.value) {
      return
    }

    const id = Date.now() + Math.random()
    const position = clickerUtil.generateClickAnimationPosition()

    clickAnimations.value.push({
      id,
      value,
      isCritical,
      x: position.x,
      y: position.y
    })

    // Remove animation after 2 seconds
    setTimeout(() => {
      clickAnimations.value = clickAnimations.value.filter(anim => anim.id !== id)
    }, 2000)
  }

  function collectChips() {
    if (clicks.value >= 10) {
      const amount = clicks.value
      const calculatedXP = Math.floor(amount * 0.2)
      achievementStore.addXP(calculatedXP)
      if (amount > maxCollectionAmount.value) {
        maxCollectionAmount.value = amount
        achievementStore.updateAchievementProgress('big_collection', maxCollectionAmount.value)
      }

      transactionStore.addTransaction({
        amount: amount,
        type: 'income',
        game: 'clicker',
        detailsKey: 'transactions.details.clicker.collect',
        detailsParams: {
          amount: formatIntAsCurrency(amount)
        }
      })

      clicks.value = 0
    }
  }

  function buyAutoClicker(userStore: UserStore) {
    if (userStore.chips >= autoClickerCost.value) {
      const cost = autoClickerCost.value
      autoClickersCount.value++

      // Calculate new cost using utility
      autoClickerCost.value = clickerUtil.calculateAutoClickerCost(autoClickersCount.value)

      transactionStore.addTransaction({
        amount: -cost,
        type: 'purchase',
        game: 'clicker',
        detailsKey: 'transactions.details.clicker.autoClicker',
        detailsParams: {
          level: autoClickersCount.value
        }
      })

      achievementStore.updateAchievementProgress('auto_collector', autoClickersCount.value)
      achievementStore.updateAchievementProgress('auto_empire', autoClickersCount.value)

      // Restart auto-clicker with potentially new speed
      startAutoClicker()
    }
  }

  function buyMultiplier(userStore: UserStore) {
    if (userStore.chips >= multiplierCost.value) {
      const cost = multiplierCost.value
      multiplierLevel.value++

      // Calculate new cost using utility
      multiplierCost.value = clickerUtil.calculateMultiplierCost(multiplierLevel.value + 1)

      transactionStore.addTransaction({
        amount: -cost,
        type: 'purchase',
        game: 'clicker',
        detailsKey: 'transactions.details.clicker.multiplier',
        detailsParams: {
          level: multiplierLevel.value
        }
      })

      achievementStore.updateAchievementProgress('multiplier_enthusiast', multiplierLevel.value)
      achievementStore.updateAchievementProgress('multiplier_master', multiplierLevel.value)
    }
  }

  function buyCriticalUpgrade(userStore: UserStore) {
    if (userStore.chips >= criticalCost.value) {
      const cost = criticalCost.value
      criticalLevel.value++

      // Calculate new cost using utility
      criticalCost.value = clickerUtil.calculateCriticalCost(criticalLevel.value)

      transactionStore.addTransaction({
        amount: -cost,
        type: 'purchase',
        game: 'clicker',
        detailsKey: 'transactions.details.clicker.critical',
        detailsParams: {
          level: criticalLevel.value
        }
      })

      achievementStore.updateAchievementProgress('critical_specialist', criticalLevel.value)
    }
  }

  function buyAutoClickerSpeed(userStore: UserStore) {
    if (userStore.chips >= autoClickerSpeedCost.value && autoClickersCount.value > 0) {
      const cost = autoClickerSpeedCost.value
      autoClickerSpeedLevel.value++

      // Calculate new cost using utility
      autoClickerSpeedCost.value = clickerUtil.calculateAutoClickerSpeedCost(autoClickerSpeedLevel.value + 1)

      transactionStore.addTransaction({
        amount: -cost,
        type: 'purchase',
        game: 'clicker',
        detailsKey: 'transactions.details.clicker.speed',
        detailsParams: {
          level: autoClickerSpeedLevel.value
        }
      })

      achievementStore.updateAchievementProgress('speed_demon', autoClickerSpeedLevel.value)

      // Restart auto-clicker with new speed
      startAutoClicker()
    }
  }

  function startAutoClicker() {
    if (typeof window !== 'undefined') {
      // Clear any existing RAF
      if (autoClickerRAF.value) {
        cancelAnimationFrame(autoClickerRAF.value)
        autoClickerRAF.value = null
      }

      if (autoClickersCount.value > 0) {
        let lastCalculation = Date.now()

        function autoClickerLoop() {
          const now = Date.now()
          const deltaTime = now - lastCalculation
          const updateInterval = clickerUtil.getAutoClickerUpdateInterval(autoClickerSpeed.value)

          if (deltaTime >= updateInterval) {
            const autoClicks = clickerUtil.calculateAutoClickerClicks(
              deltaTime,
              autoClickersCount.value,
              autoClickerSpeed.value
            )
            const earnings = autoClicks * clickValue.value

            if (earnings > 0) {
              clicks.value += earnings
              passiveLifetimeClicks.value += autoClicks
              totalLifetimeClicks.value += autoClicks
              achievementStore.updateAchievementProgress('passive_novice', passiveLifetimeClicks.value)
              achievementStore.updateAchievementProgress('passive_master', passiveLifetimeClicks.value)
              achievementStore.updateAchievementProgress('passive_legend', passiveLifetimeClicks.value)

              // Add subtle animation for auto-clicks (less frequent)
              if (clickerUtil.shouldShowAutoClickAnimation()) {
                addClickAnimation(earnings, false)
              }

              lastCalculation = now
            }
          }

          // Continue the loop if we still have auto-clickers
          if (autoClickersCount.value > 0) {
            autoClickerRAF.value = requestAnimationFrame(autoClickerLoop)
          }
        }

        // Start the loop
        autoClickerRAF.value = requestAnimationFrame(autoClickerLoop)
      }
    }
  }

  function stopAutoClicker(clearStorage: boolean = true) {
    if (autoClickerRAF.value) {
      cancelAnimationFrame(autoClickerRAF.value)
      autoClickerRAF.value = null
    }

    if (clearStorage) {
      const clickerStore = localStorage.getItem(calculateStorageKey("clicker-store"))
      if (clickerStore) {
        localStorage.removeItem(calculateStorageKey("clicker-store"))
      }
    }
  }

  function initialise() {
    if (typeof window !== 'undefined') {
      if (manualLifetimeClicks.value === 0 && totalLifetimeClicks.value > 0) {
        manualLifetimeClicks.value = Math.max(
          totalLifetimeClicks.value - passiveLifetimeClicks.value,
          0
        )
      }
      const sessionKey = calculateStorageKey('clicker-session-active')
      const hasSession = sessionStorage.getItem(sessionKey) === 'true'
      if (hasSession) {
        lastOnlineTimestamp.value = Date.now()
      } else {
        checkOfflineProgress()
      }
      sessionStorage.setItem(sessionKey, 'true')
      window.addEventListener('beforeunload', () => {
        lastOnlineTimestamp.value = Date.now()
      })
      checkOfflineProgress()
      achievementStore.updateAchievementProgress('passive_novice', passiveLifetimeClicks.value)
      achievementStore.updateAchievementProgress('passive_master', passiveLifetimeClicks.value)
      achievementStore.updateAchievementProgress('passive_legend', passiveLifetimeClicks.value)
    }

    if (autoClickersCount.value > 0) {
      startAutoClicker()
    }
  }

  function checkOfflineProgress() {
    const result = clickerUtil.calculateOfflineEarnings(
      lastOnlineTimestamp.value,
      autoClickersCount.value,
      clickValue.value,
      autoClickerSpeed.value
    )

    if (result.earnings > 0) {
      // Add earnings to clicks
      clicks.value += result.earnings
      passiveLifetimeClicks.value += result.clicks
      totalLifetimeClicks.value += result.clicks
      achievementStore.updateAchievementProgress('passive_novice', passiveLifetimeClicks.value)
      achievementStore.updateAchievementProgress('passive_master', passiveLifetimeClicks.value)
      achievementStore.updateAchievementProgress('passive_legend', passiveLifetimeClicks.value)

      if (result.earnings > maxOfflineEarnings.value) {
        maxOfflineEarnings.value = result.earnings
        achievementStore.updateAchievementProgress('offline_profits', maxOfflineEarnings.value)
      }

      // Automatically collect the chips if there's enough
      if (clicks.value >= 10) {
        const amount = clicks.value
        if (amount > maxCollectionAmount.value) {
          maxCollectionAmount.value = amount
          achievementStore.updateAchievementProgress('big_collection', maxCollectionAmount.value)
        }

        // Calculate and add XP
        const calculatedXP = Math.floor(amount * 0.2)
        achievementStore.addXP(calculatedXP)

        // Add transaction for transparency
        const timeAwayText = result.seconds >= 3600
          ? `${Math.floor(result.seconds / 3600)}h ${Math.floor((result.seconds % 3600) / 60)}m`
          : `${Math.floor(result.seconds / 60)}m`

        transactionStore.addTransaction({
          amount: amount,
          type: 'income',
          game: 'clicker',
          detailsKey: 'transactions.details.clicker.offlineEarnings',
          detailsParams: {
            timeAway: timeAwayText
          }
        })

        // Set up modal data with the collected amount
        offlineEarnings.value = amount
        offlineSeconds.value = result.seconds
        showOfflineEarnings.value = true

        // Reset clicks since we collected them
        clicks.value = 0
      } else {
        // If earnings are too small, don't show modal
        // The earnings remain in clicks for when they manually collect
      }
    }

    lastOnlineTimestamp.value = Date.now()
  }

  function closeOfflineEarningsModal() {
    showOfflineEarnings.value = false
    offlineEarnings.value = 0
    offlineSeconds.value = 0
  }

  function setClickerActive(active: boolean) {
    isClickerActive.value = active
    if (!active) {
      clickAnimations.value = []
    }
  }

  // Reset state
  function reset() {
    clicks.value = 0
    totalLifetimeClicks.value = 0
    manualLifetimeClicks.value = 0
    passiveLifetimeClicks.value = 0
    totalCriticalHits.value = 0
    maxComboCount.value = 0
    maxCollectionAmount.value = 0
    maxOfflineEarnings.value = 0
    baseClickValue.value = 1
    autoClickersCount.value = 0
    autoClickerCost.value = 50
    multiplierLevel.value = 1
    multiplierCost.value = 100
    criticalLevel.value = 0
    criticalCost.value = 200
    autoClickerSpeedLevel.value = 1
    autoClickerSpeedCost.value = 300
    comboMultiplier.value = 1
    comboCount.value = 0
    clickAnimations.value = []
  }

  return {
    // State
    clicks,
    totalLifetimeClicks,
    manualLifetimeClicks,
    passiveLifetimeClicks,
    totalCriticalHits,
    maxComboCount,
    maxCollectionAmount,
    maxOfflineEarnings,
    baseClickValue,
    autoClickersCount,
    autoClickerCost,
    multiplierLevel,
    multiplierCost,
    criticalLevel,
    criticalCost,
    autoClickerSpeedLevel,
    autoClickerSpeedCost,
    lastOnlineTimestamp,
    showOfflineEarnings,
    offlineEarnings,
    offlineSeconds,
    clickAnimations,
    comboMultiplier,
    comboCount,
    isClickerActive,

    // Computed
    clickValue,
    criticalChance,
    autoClickerSpeed,
    formattedClickValue,
    formattedAutoClickerCost,
    formattedMultiplierCost,
    formattedCriticalCost,
    formattedAutoClickerSpeedCost,
    formattedClicks,
    formattedLifetimeClicks,
    formattedManualLifetimeClicks,
    formattedPassiveLifetimeClicks,
    formattedIncome,

    // Actions
    handleClick,
    collectChips,
    buyAutoClicker,
    buyMultiplier,
    buyCriticalUpgrade,
    buyAutoClickerSpeed,
    reset,
    initializeOfflineTracking: initialise,
    checkOfflineProgress,
    closeOfflineEarningsModal,
    startAutoClicker,
    stopAutoClicker,
    addClickAnimation,
    setClickerActive
  }
}, {
  persist: {
    key: calculateStorageKey("clicker-store"),
    serializer: createGameSerializer(),
    paths: [
      'clicks',
      'totalLifetimeClicks',
      'manualLifetimeClicks',
      'passiveLifetimeClicks',
      'totalCriticalHits',
      'maxComboCount',
      'maxCollectionAmount',
      'maxOfflineEarnings',
      'baseClickValue',
      'autoClickersCount',
      'autoClickerCost',
      'multiplierLevel',
      'multiplierCost',
      'criticalLevel',
      'criticalCost',
      'autoClickerSpeedLevel',
      'autoClickerSpeedCost',
      'lastOnlineTimestamp'
    ]
  }
} as any)

export type ClickerStore = ReturnType<typeof useClickerStore>
