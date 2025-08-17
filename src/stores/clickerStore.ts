import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { formatIntAsCurrency, formatNumber } from '@/utils/numberFormatUtil'
import { calculateStorageKey, createGameSerializer } from '@/utils/gameSaveSerializerUtil'
import { useAchievementStore } from './achievementStore'
import { useUserStore } from './userStore'
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
  const formattedLifetimeClicks = computed(() => formatNumber(totalLifetimeClicks.value, {
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

    lastClickTime.value = now

    // Check for critical hit
    const isCritical = clickerUtil.rollCriticalHit(criticalChance.value)
    const finalValue = isCritical ?
      clickerUtil.applyCriticalMultiplier(clickValue.value) :
      clickValue.value

    clicks.value += finalValue
    totalLifetimeClicks.value += finalValue

    // Add floating animation
    addClickAnimation(finalValue, isCritical)

    // Update achievements
    achievementStore.updateAchievementProgress('click_novice', totalLifetimeClicks.value)
    achievementStore.updateAchievementProgress('click_master', totalLifetimeClicks.value)

    // Combo decay timer
    setTimeout(() => {
      if (clickerUtil.shouldResetCombo(lastClickTime.value, Date.now())) {
        comboCount.value = 0
        comboMultiplier.value = 1
      }
    }, clickerUtil.COMBO_WINDOW_MS)
  }

  function addClickAnimation(value: number, isCritical = false) {
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

  function collectChips(userStore: UserStore) {
    if (clicks.value >= 10) {
      const amount = clicks.value
      userStore.updateChips(amount)
      const calculatedXP = Math.floor(amount * 0.2)
      achievementStore.addXP(calculatedXP)

      transactionStore.addTransaction({
        amount: amount,
        type: 'income',
        game: 'clicker',
        details: `Collected ${formatIntAsCurrency(amount)} chips from clicking`
      })

      clicks.value = 0
    }
  }

  function buyAutoClicker(userStore: UserStore) {
    if (userStore.chips >= autoClickerCost.value) {
      const cost = autoClickerCost.value
      userStore.updateChips(-cost)
      autoClickersCount.value++

      // Calculate new cost using utility
      autoClickerCost.value = clickerUtil.calculateAutoClickerCost(autoClickersCount.value)

      transactionStore.addTransaction({
        amount: -cost,
        type: 'purchase',
        game: 'clicker',
        details: `Purchased Auto-Clicker (Level ${autoClickersCount.value})`
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
      userStore.updateChips(-cost)
      multiplierLevel.value++

      // Calculate new cost using utility
      multiplierCost.value = clickerUtil.calculateMultiplierCost(multiplierLevel.value + 1)

      transactionStore.addTransaction({
        amount: -cost,
        type: 'purchase',
        game: 'clicker',
        details: `Purchased Multiplier (Level ${multiplierLevel.value})`
      })

      achievementStore.updateAchievementProgress('multiplier_enthusiast', multiplierLevel.value)
    }
  }

  function buyCriticalUpgrade(userStore: UserStore) {
    if (userStore.chips >= criticalCost.value) {
      const cost = criticalCost.value
      userStore.updateChips(-cost)
      criticalLevel.value++

      // Calculate new cost using utility
      criticalCost.value = clickerUtil.calculateCriticalCost(criticalLevel.value)

      transactionStore.addTransaction({
        amount: -cost,
        type: 'purchase',
        game: 'clicker',
        details: `Purchased Critical Hit Upgrade (Level ${criticalLevel.value})`
      })
    }
  }

  function buyAutoClickerSpeed(userStore: UserStore) {
    if (userStore.chips >= autoClickerSpeedCost.value && autoClickersCount.value > 0) {
      const cost = autoClickerSpeedCost.value
      userStore.updateChips(-cost)
      autoClickerSpeedLevel.value++

      // Calculate new cost using utility
      autoClickerSpeedCost.value = clickerUtil.calculateAutoClickerSpeedCost(autoClickerSpeedLevel.value + 1)

      transactionStore.addTransaction({
        amount: -cost,
        type: 'purchase',
        game: 'clicker',
        details: `Purchased Auto-Clicker Speed (Level ${autoClickerSpeedLevel.value})`
      })

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
            const earnings = clickerUtil.calculateAutoClickerUpdate(
              deltaTime,
              autoClickersCount.value,
              clickValue.value,
              autoClickerSpeed.value
            )

            if (earnings > 0) {
              clicks.value += earnings
              totalLifetimeClicks.value += earnings

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
      window.addEventListener('beforeunload', () => {
        lastOnlineTimestamp.value = Date.now()
      })
      checkOfflineProgress()
    }

    if (autoClickersCount.value > 0) {
      startAutoClicker()
    }
  }

  function checkOfflineProgress() {
    const userStore = useUserStore()
    const result = clickerUtil.calculateOfflineEarnings(
      lastOnlineTimestamp.value,
      autoClickersCount.value,
      clickValue.value,
      autoClickerSpeed.value
    )

    if (result.earnings > 0) {
      // Add earnings to clicks
      clicks.value += result.earnings
      totalLifetimeClicks.value += result.earnings

      // Automatically collect the chips if there's enough
      if (clicks.value >= 10) {
        const amount = clicks.value

        // Update user's chip balance
        userStore.updateChips(amount)

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
          details: `Offline earnings collected (${timeAwayText} away)`
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
        console.log(`Small offline earnings (${result.earnings} clicks) added to balance`)
      }
    }

    lastOnlineTimestamp.value = Date.now()
  }

  function closeOfflineEarningsModal() {
    showOfflineEarnings.value = false
    offlineEarnings.value = 0
    offlineSeconds.value = 0
  }

  // Reset state
  function reset() {
    clicks.value = 0
    totalLifetimeClicks.value = 0
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
    addClickAnimation
  }
}, {
  persist: {
    key: calculateStorageKey("clicker-store"),
    serializer: createGameSerializer()
  }
} as any)

export type ClickerStore = ReturnType<typeof useClickerStore>
