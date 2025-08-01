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
  const autoClickerInterval = ref<ReturnType<typeof setInterval> | null>(null)

  // Enhanced State
  const clicks = ref(0)
  const totalLifetimeClicks = ref(0) // Track all-time clicks
  const baseClickValue = ref(1)
  const autoClickersCount = ref(0)
  const autoClickerCost = ref(50)
  const multiplierLevel = ref(1)
  const multiplierCost = ref(100)

  startAutoClicker();

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
    clickAnimations.value.push({
      id,
      value,
      isCritical,
      x: Math.random() * 200 - 100, // Random position
      y: Math.random() * 50 - 25
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
        type: 'win',
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
        type: 'loss',
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
        type: 'loss',
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
        type: 'loss',
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
        type: 'loss',
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

  // Enhanced auto-clicker with variable speed
  function startAutoClicker() {
    if (typeof window !== 'undefined') {
      if (autoClickerInterval.value) {
        clearInterval(autoClickerInterval.value)
      }

      if (autoClickersCount.value > 0) {
        autoClickerInterval.value = setInterval(() => {
          const autoValue = autoClickersCount.value * clickValue.value;
          clicks.value += autoValue;
          totalLifetimeClicks.value += autoValue;

          // Add subtle animation for auto-clicks
          if (Math.random() < 0.3) { // 30% chance to show auto-click animation
            addClickAnimation(autoValue, false);
          }
        }, autoClickerSpeed.value)
      }
    }
  }

  function stopAutoClicker(clearStorage: boolean = true) {
    if (autoClickerInterval.value) {
      clearInterval(autoClickerInterval.value)
      autoClickerInterval.value = null
    }

    if (clearStorage) {
      const clickerStore = localStorage.getItem(calculateStorageKey("clicker-store"))
      if (clickerStore) {
        localStorage.removeItem(calculateStorageKey("clicker-store"))
      }
    }
  }

  function initializeOfflineTracking() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        lastOnlineTimestamp.value = Date.now()
      })
      checkOfflineProgress()
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
    // Enhanced State
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

    // Enhanced Computed
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


    // Enhanced Actions
    handleClick,
    collectChips,
    buyAutoClicker,
    buyMultiplier,
    buyCriticalUpgrade,
    buyAutoClickerSpeed,
    prestige,
    reset,
    initializeOfflineTracking,
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
