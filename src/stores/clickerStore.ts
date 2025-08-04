import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { formatIntAsCurrency, formatNumber } from '@/utils/numberFormatUtil'
import { calculateStorageKey, createGameSerializer } from '@/utils/gameSaveSerializerUtil'
import { useAchievementStore } from './achievementStore'
import type { UserStore } from './userStore'
import { useTransactionStore } from './transactionStore'

interface ClickAnimation {
  id: number
  value: number
  isCritical: boolean
  x: number
  y: number
}

export const useClickerStore = defineStore('clicker', () => {
  const OFFLINE_RATE_MULTIPLIER = 0.5 // Half rate when offline
  const MAX_OFFLINE_DAYS = 3
  const MAX_OFFLINE_MS = MAX_OFFLINE_DAYS * 24 * 60 * 60 * 1000

  // Critical click system
  const CRITICAL_CHANCE = 0.1 // 10% chance
  const CRITICAL_MULTIPLIER = 2

  // Prestige system
  const PRESTIGE_THRESHOLD = 1000000 // 1M clicks to prestige

  const achievementStore = useAchievementStore()
  const transactionStore = useTransactionStore();
  const autoClickerRAF = ref<number | null>(null)

  // Enhanced State
  const clicks = ref(0)
  const totalLifetimeClicks = ref(0) // Track all-time clicks
  const baseClickValue = ref(1)
  const autoClickersCount = ref(0)
  const autoClickerCost = ref(50)
  const multiplierLevel = ref(1)
  const multiplierCost = ref(100)

  // New upgrade types
  const criticalLevel = ref(0)
  const criticalCost = ref(200)
  const autoClickerSpeedLevel = ref(1)
  const autoClickerSpeedCost = ref(300)

  // Prestige system
  const prestigeLevel = ref(0)
  const prestigePoints = ref(0)

  // Click effects
  const clickAnimations = ref([] as Array<ClickAnimation>) // For floating numbers
  const comboMultiplier = ref(1)
  const comboCount = ref(0)
  const lastClickTime = ref(0)
  const COMBO_WINDOW = 1000 // 1 second between clicks to maintain combo

  // Offline tracking
  const lastOnlineTimestamp = ref(Date.now())
  const showOfflineEarnings = ref(false)
  const offlineEarnings = ref(0)
  const offlineSeconds = ref(0)

  // Enhanced Computed
  const clickValue = computed(() => {
    const base = baseClickValue.value * multiplierLevel.value
    const prestigeBonus = 1 + (prestigeLevel.value * 0.1) // 10% per prestige
    return Math.floor(base * prestigeBonus * comboMultiplier.value)
  })

  const criticalChance = computed(() =>
    Math.min(CRITICAL_CHANCE + (criticalLevel.value * 0.02), 0.5) // Max 50% crit chance
  )

  const autoClickerSpeed = computed(() =>
    Math.max(1000 - (autoClickerSpeedLevel.value * 50), 100) // Min 100ms interval
  )

  const canPrestige = computed(() => totalLifetimeClicks.value >= PRESTIGE_THRESHOLD)

  const prestigePointsGain = computed(() =>
    Math.floor(totalLifetimeClicks.value / PRESTIGE_THRESHOLD)
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
  }));

  const formattedIncome = computed(() => {
    const passivePerSecond = Math.floor(autoClickersCount.value * clickValue.value * (1000 / autoClickerSpeed.value))
    return formatIntAsCurrency(passivePerSecond)
  })

  // Enhanced Actions
  function handleClick() {
    const now = Date.now()

    // Calculate combo
    if (now - lastClickTime.value < COMBO_WINDOW) {
      comboCount.value++
      comboMultiplier.value = Math.min(1 + (comboCount.value * 0.1), 3) // Max 3x combo
    } else {
      comboCount.value = 0
      comboMultiplier.value = 1
    }

    lastClickTime.value = now

    // Check for critical hit
    const isCritical = Math.random() < criticalChance.value
    const finalValue = isCritical ? clickValue.value * CRITICAL_MULTIPLIER : clickValue.value

    clicks.value += finalValue
    totalLifetimeClicks.value += finalValue

    // Add floating animation
    addClickAnimation(finalValue, isCritical)

    // Update achievements
    achievementStore.updateAchievementProgress('click_novice', totalLifetimeClicks.value)
    achievementStore.updateAchievementProgress('click_master', totalLifetimeClicks.value)

    // Combo decay timer
    setTimeout(() => {
      if (Date.now() - lastClickTime.value >= COMBO_WINDOW) {
        comboCount.value = 0
        comboMultiplier.value = 1
      }
    }, COMBO_WINDOW)
  }

  function addClickAnimation(value: number, isCritical = false) {
    const id = Date.now() + Math.random()

    const angle = Math.random() * Math.PI * 2 // Random angle in radians
    const distance = 80 + Math.random() * 120 // Random distance 80-200px from center
    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance

    // Add some extra randomness for variety
    const jitterX = (Math.random() - 0.5) * 60 // Additional ±30px jitter
    const jitterY = (Math.random() - 0.5) * 60

    clickAnimations.value.push({
      id,
      value,
      isCritical,
      x: x + jitterX,
      y: y + jitterY
    })

    // Remove animation after 2 seconds
    setTimeout(() => {
      clickAnimations.value = clickAnimations.value.filter(anim => anim.id !== id)
    }, 2000)
  }

  function collectChips(userStore: UserStore) {
    if (clicks.value >= 10) {
      const amount = clicks.value;
      userStore.updateChips(amount);
      const calculatedXP = Math.floor(amount * 0.2);
      achievementStore.addXP(calculatedXP);

      transactionStore.addTransaction({
        amount: amount,
        type: 'income',
        game: 'clicker',
        details: `Collected ${formatIntAsCurrency(amount)} chips from clicking`
      });

      clicks.value = 0;
    }
  }

  function buyAutoClicker(userStore: UserStore) {
    if (userStore.chips >= autoClickerCost.value) {
      const cost = autoClickerCost.value;
      userStore.updateChips(-cost);
      autoClickersCount.value++;
      autoClickerCost.value = Math.floor(cost * 1.5);

      transactionStore.addTransaction({
        amount: -cost,
        type: 'purchase',
        game: 'clicker',
        details: `Purchased Auto-Clicker (Level ${autoClickersCount.value})`
      });

      achievementStore.updateAchievementProgress('auto_collector', autoClickersCount.value);
      achievementStore.updateAchievementProgress('auto_empire', autoClickersCount.value);

      // Restart auto-clicker with potentially new speed
      startAutoClicker();
    }
  }

  function buyMultiplier(userStore: UserStore) {
    if (userStore.chips >= multiplierCost.value) {
      const cost = multiplierCost.value;
      userStore.updateChips(-cost);
      multiplierLevel.value++;
      multiplierCost.value = Math.floor(cost * 2);

      transactionStore.addTransaction({
        amount: -cost,
        type: 'purchase',
        game: 'clicker',
        details: `Purchased Multiplier (Level ${multiplierLevel.value})`
      });

      achievementStore.updateAchievementProgress('multiplier_enthusiast', multiplierLevel.value);
    }
  }

  function buyCriticalUpgrade(userStore: UserStore) {
    if (userStore.chips >= criticalCost.value) {
      const cost = criticalCost.value;
      userStore.updateChips(-cost);
      criticalLevel.value++;
      criticalCost.value = Math.floor(cost * 2.5);

      transactionStore.addTransaction({
        amount: -cost,
        type: 'purchase',
        game: 'clicker',
        details: `Purchased Critical Hit Upgrade (Level ${criticalLevel.value})`
      });
    }
  }

  function buyAutoClickerSpeed(userStore: UserStore) {
    if (userStore.chips >= autoClickerSpeedCost.value && autoClickersCount.value > 0) {
      const cost = autoClickerSpeedCost.value;
      userStore.updateChips(-cost);
      autoClickerSpeedLevel.value++;
      autoClickerSpeedCost.value = Math.floor(cost * 1.8);

      transactionStore.addTransaction({
        amount: -cost,
        type: 'purchase',
        game: 'clicker',
        details: `Purchased Auto-Clicker Speed (Level ${autoClickerSpeedLevel.value})`
      });

      // Restart auto-clicker with new speed
      startAutoClicker();
    }
  }

  function prestige() {
    if (!canPrestige.value) return;

    const pointsGained = prestigePointsGain.value - prestigePoints.value;
    prestigePoints.value = prestigePointsGain.value;
    prestigeLevel.value++;

    // Reset most progress but keep prestige bonuses
    clicks.value = 0;
    baseClickValue.value = 1;
    autoClickersCount.value = 0;
    autoClickerCost.value = 50;
    multiplierLevel.value = 1;
    multiplierCost.value = 100;
    criticalLevel.value = 0;
    criticalCost.value = 200;
    autoClickerSpeedLevel.value = 1;
    autoClickerSpeedCost.value = 300;

    transactionStore.addTransaction({
      amount: 0,
      type: 'win',
      game: 'clicker',
      details: `Prestiged! Gained ${pointsGained} prestige points (Total: ${prestigePoints.value})`
    });

    startAutoClicker();
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
          const updateInterval = Math.max(autoClickerSpeed.value / 10, 50) // Update 10x faster than click speed, min 50ms

          if (deltaTime >= updateInterval) {
            const clicksPerSecond = autoClickersCount.value * clickValue.value * (1000 / autoClickerSpeed.value)
            const earnings = Math.floor((deltaTime / 1000) * clicksPerSecond)

            if (earnings > 0) {
              clicks.value += earnings
              totalLifetimeClicks.value += earnings

              // Add subtle animation for auto-clicks (less frequent)
              if (Math.random() < 0.1) { // 10% chance to show auto-click animation
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
      startAutoClicker();
    }
  }

  function checkOfflineProgress() {
    const currentTime = Date.now()
    const offlineTime = currentTime - lastOnlineTimestamp.value
    const cappedOfflineTime = Math.min(offlineTime, MAX_OFFLINE_MS)

    if (cappedOfflineTime > 0) {
      offlineSeconds.value = Math.floor(cappedOfflineTime / 1000)
      const clicksPerSecond = autoClickersCount.value * clickValue.value
      offlineEarnings.value = Math.floor(offlineSeconds.value * clicksPerSecond * OFFLINE_RATE_MULTIPLIER)

      if (offlineEarnings.value > 0) {
        showOfflineEarnings.value = true
        clicks.value += offlineEarnings.value
        totalLifetimeClicks.value += offlineEarnings.value
      }
    }

    lastOnlineTimestamp.value = currentTime
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
    prestigeLevel.value = 0
    prestigePoints.value = 0
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
    prestigeLevel,
    prestigePoints,
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
    canPrestige,
    prestigePointsGain,
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
    prestige,
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

export type ClickerStore = ReturnType<typeof useClickerStore>;
